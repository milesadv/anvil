"use client"

import { useRef, useMemo, useState, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { AudioData } from "@/hooks/use-audio-analyzer"

interface AudioParticlesProps {
  audioData: AudioData
}

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uMagnetStrength;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uBeat;
  uniform float uVolume;
  uniform float uLowpassIntensity;
  uniform float uHighpassIntensity;

  varying float vDistanceFromCenter;
  varying float vMouseInfluence;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vIntensity;
  varying float vGlitch;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 pos = position;

    float distFromCenter = length(pos);
    vDistanceFromCenter = 1.0 - (distFromCenter / 2.5);
    vIntensity = uBass * 0.5 + uMid * 0.3 + uHigh * 0.2;

    float timeScale = 1.0 - uLowpassIntensity * 0.85;
    float spreadFactor = 1.0 + uHighpassIntensity * 0.4;

    float breatheTime = uTime * timeScale;
    float breathe = sin(breatheTime * 0.8 + distFromCenter * 0.5) * 0.08;
    float pulse = sin(breatheTime * 1.2 + pos.y * 2.0) * cos(breatheTime * 0.9 + pos.x * 1.5) * 0.05;

    float audioBreathe = uBass * 0.15 + uVolume * 0.1;
    pos *= 1.0 + breathe + pulse + audioBreathe;

    float slowTime = uTime * 0.3 * timeScale;
    float medTime = uTime * 0.6 * timeScale;
    float fastTime = uTime * 1.2 * timeScale;

    float flowSpeed = (1.0 + uVolume * 2.0 + uBass * 1.5) * timeScale;

    float flow1 = snoise(vec3(pos.x * 0.5, pos.y * 0.5, slowTime * flowSpeed * 0.5));
    float flow2 = snoise(vec3(pos.y * 0.5, pos.z * 0.5, slowTime * flowSpeed * 0.5 + 100.0));
    float turb = snoise(vec3(pos.x * 1.0, pos.y * 1.0, medTime * flowSpeed));
    float ripple = snoise(vec3(pos.x * 2.0, pos.y * 2.0, fastTime)) * uHigh;

    vec3 normal = normalize(pos);
    float flowDisplacement = (flow1 * 0.15 + flow2 * 0.1 + turb * 0.08 + ripple * 0.05) * (1.0 + uBass);
    pos += normal * flowDisplacement * timeScale;

    vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    vec3 bitangent = cross(normal, tangent);
    float tangentFlow = snoise(vec3(pos * 0.8 + uTime * 0.2 * timeScale)) * 0.1 * (1.0 + uMid);
    pos += tangent * tangentFlow;

    float beatExpand = 1.0 + uBeat * 0.2 * timeScale;
    pos *= beatExpand;

    pos *= spreadFactor;

    vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vWorldPosition = worldPos;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    float distToMouse = length(worldPos - uMouse);
    float magneticInfluence = smoothstep(3.0, 0.0, distToMouse);
    magneticInfluence = pow(magneticInfluence, 0.7);
    vMouseInfluence = magneticInfluence;

    vec3 direction = normalize(uMouse - worldPos);
    vec3 perpendicular = cross(direction, vec3(0.0, 0.0, 1.0));
    pos += direction * magneticInfluence * uMagnetStrength;
    pos += perpendicular * magneticInfluence * 0.4 * sin(uTime * 2.0 + length(worldPos) * 3.0);

    float wave = sin(distToMouse * 4.0 - uTime * 2.5) * magneticInfluence * 0.15;
    pos += direction * wave;

    float glitchTime = floor(uTime * 15.0);
    float glitchSeed = hash(glitchTime + position.x * 10.0 + position.y * 20.0);
    float glitchTrigger = step(0.88, glitchSeed) * step(0.3, uVolume);

    float sliceY = floor(pos.y * 8.0) / 8.0;
    float sliceGlitch = hash(sliceY + glitchTime) * glitchTrigger;
    pos.x += sliceGlitch * 0.15 * sign(hash(sliceY * 2.0 + glitchTime) - 0.5);

    float particleGlitch = hash(position.x * 100.0 + position.z * 50.0 + glitchTime);
    float isGlitched = step(0.94, particleGlitch) * glitchTrigger;
    pos += vec3(
      (hash(particleGlitch * 2.0) - 0.5) * 0.3,
      (hash(particleGlitch * 3.0) - 0.5) * 0.3,
      (hash(particleGlitch * 4.0) - 0.5) * 0.2
    ) * isGlitched * uBeat;

    vGlitch = isGlitched + sliceGlitch;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float audioSize = uBass * 1.5 + uBeat * 1.0;
    float glitchSize = isGlitched * 2.0;
    gl_PointSize = 1.8 + magneticInfluence * 2.5 + audioSize + glitchSize;
  }
`

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uBeat;
  uniform float uVolume;

  varying float vDistanceFromCenter;
  varying float vMouseInfluence;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vIntensity;
  varying float vGlitch;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec3 getIridescentColor(vec3 worldPos, vec3 normal, float time) {
    float angle = atan(worldPos.y, worldPos.x);
    float height = worldPos.z;
    float colorShift = angle * 0.5 + height * 0.3 + time * 0.1;

    vec3 warmWhite = vec3(1.0, 0.95, 0.9);
    vec3 softRed = vec3(1.0, 0.4, 0.3);
    vec3 deepRed = vec3(0.9, 0.15, 0.1);
    vec3 flareRed = vec3(1.0, 0.2, 0.1);

    colorShift += uBass * 0.8 + uMid * 0.4;

    float redZone1 = sin(angle * 2.0 + time * 1.5) * 0.5 + 0.5;
    float redZone2 = cos(height * 3.0 - time * 1.2) * 0.5 + 0.5;
    float redZone3 = sin(angle * 4.0 - height * 2.0 + time * 0.8) * 0.5 + 0.5;

    float redMask = redZone1 * 0.4 + redZone2 * 0.3 + redZone3 * 0.3;
    redMask = smoothstep(0.3, 0.7, redMask);

    vec3 baseColor = mix(warmWhite, softRed, 0.15 + redMask * 0.25);

    float audioRed = uBass * 0.8 + uBeat * 1.2 + uVolume * 0.3;

    baseColor = mix(baseColor, deepRed, redMask * audioRed * 0.6);

    float flareStreak = pow(redZone1 * redZone3, 2.0);
    baseColor = mix(baseColor, flareRed, flareStreak * audioRed * 0.5);

    baseColor += vec3(0.4, 0.15, 0.1) * uBeat;

    return baseColor;
  }

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.0, 0.8, vDistanceFromCenter);
    alpha = mix(alpha, 1.0, vMouseInfluence * 0.8);

    alpha *= 0.7 + vIntensity * 0.3 + uVolume * 0.2;

    vec3 iridescent = getIridescentColor(vWorldPosition, vNormal, uTime);

    float colorIntensity = 0.5 + uVolume * 0.4 + uBeat * 0.3;
    vec3 finalColor = mix(vec3(1.0, 0.98, 0.95), iridescent, colorIntensity);

    float glitchTime = floor(uTime * 12.0);
    float glitchRand = hash(glitchTime + vWorldPosition.x * 100.0);
    float glitchActive = step(0.92, glitchRand) * uVolume;

    if (vGlitch > 0.5 && glitchActive > 0.0) {
      finalColor.r *= 1.0 + glitchActive * 0.5;
      finalColor.b *= 1.0 - glitchActive * 0.3;
    }

    float flareRand = hash(vWorldPosition.x * 50.0 + vWorldPosition.y * 30.0 + floor(uTime * 10.0));
    float isFlare = step(0.93, flareRand) * (0.3 + uBeat * 0.7 + uBass * 0.5);
    finalColor += vec3(1.0, 0.25, 0.15) * isFlare * 1.5;
    alpha = mix(alpha, 1.0, min(isFlare, 1.0));

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function AudioParticles({ audioData }: AudioParticlesProps) {
  const pointsRef = useRef<THREE.Points | null>(null)
  const [mouse3D, setMouse3D] = useState(new THREE.Vector3(0, 0, -10))
  const { camera } = useThree()

  // Create organic blob geometry with particles (same as torus shader)
  const geometry = useMemo(() => {
    const numParticles = 35000
    const posArray = new Float32Array(numParticles * 3)

    for (let i = 0; i < numParticles; i++) {
      // Use golden ratio sphere distribution for even coverage
      const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      // Base spherical coordinates
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.sin(phi) * Math.sin(theta)
      const z = Math.cos(phi)

      // Apply organic deformation using multiple noise frequencies
      const noise1 = Math.sin(x * 3 + y * 2) * Math.cos(z * 2.5) * 0.3
      const noise2 = Math.sin(y * 4 + z * 3) * Math.cos(x * 2) * 0.2
      const noise3 = Math.sin(z * 5 + x * 2) * Math.cos(y * 3) * 0.15
      const noise4 = Math.sin(x * 2 - y * 3 + z) * 0.1

      // Combine noises for organic displacement
      const displacement = 1.2 + noise1 + noise2 + noise3 + noise4

      // Add some asymmetry for more organic feel
      const asymmetry = 1 + Math.sin(theta * 2) * 0.1 + Math.cos(phi * 3) * 0.08

      posArray[i * 3] = x * displacement * asymmetry * 1.5
      posArray[i * 3 + 1] = y * displacement * asymmetry * 1.5
      posArray[i * 3 + 2] = z * displacement * 1.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    return geo
  }, [])

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3(0, 0, -10) },
          uMagnetStrength: { value: 0.9 },
          uBass: { value: 0 },
          uMid: { value: 0 },
          uHigh: { value: 0 },
          uBeat: { value: 0 },
          uVolume: { value: 0 },
          uLowpassIntensity: { value: 0 },
          uHighpassIntensity: { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const setRef = useCallback((el: THREE.Points | null) => {
    pointsRef.current = el
    if (el) {
      el.geometry = geometry
      el.material = shaderMaterial
    }
  }, [geometry, shaderMaterial])

  const handlePointerMove = (event: { pointer: THREE.Vector2 }) => {
    if (!pointsRef.current) return

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(event.pointer, camera)

    const planeZ = pointsRef.current.position.z
    const planeNormal = new THREE.Vector3(0, 0, 1)
    const planePoint = new THREE.Vector3(0, 0, planeZ)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint)

    const intersectPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersectPoint)

    if (intersectPoint) {
      setMouse3D(intersectPoint)
    }
  }

  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation like torus, but audio-reactive speed
      const rotationSpeed = 0.005 + audioData.volume * 0.01 + audioData.bass * 0.005
      pointsRef.current.rotation.y += rotationSpeed
      pointsRef.current.rotation.x += rotationSpeed * 0.4

      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
      shaderMaterial.uniforms.uMouse.value.copy(mouse3D)
      shaderMaterial.uniforms.uBass.value = audioData.bass
      shaderMaterial.uniforms.uMid.value = audioData.mid
      shaderMaterial.uniforms.uHigh.value = audioData.high
      shaderMaterial.uniforms.uBeat.value = audioData.beat
      shaderMaterial.uniforms.uVolume.value = audioData.volume

      // Calculate filter intensities
      const minFreq = 20
      const maxFreq = 20000
      const logMin = Math.log(minFreq)
      const logMax = Math.log(maxFreq)
      const logFreq = Math.log(Math.max(minFreq, Math.min(maxFreq, audioData.filterFrequency)))
      const normalizedFreq = (logFreq - logMin) / (logMax - logMin)

      let lowpassIntensity = 0
      let highpassIntensity = 0

      if (audioData.filterType === "lowpass") {
        lowpassIntensity = 1 - normalizedFreq
      } else if (audioData.filterType === "highpass") {
        highpassIntensity = normalizedFreq
      }

      shaderMaterial.uniforms.uLowpassIntensity.value = lowpassIntensity
      shaderMaterial.uniforms.uHighpassIntensity.value = highpassIntensity
    }
  })

  return (
    <points ref={setRef} onPointerMove={handlePointerMove} />
  )
}
