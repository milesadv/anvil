"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export function TorusShader() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [mouse3D, setMouse3D] = useState(new THREE.Vector3(0, 0, -10))
  const { camera } = useThree()

  // Create expanded wave-like particle field
  const { positions } = useMemo(() => {
    const numParticles = 35000
    const posArray = new Float32Array(numParticles * 3)

    for (let i = 0; i < numParticles; i++) {
      // Use golden ratio distribution as base
      const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      // Base coordinates
      let x = Math.sin(phi) * Math.cos(theta)
      let y = Math.sin(phi) * Math.sin(theta)
      let z = Math.cos(phi)

      // Subtle wave displacement
      const wave1 = Math.sin(theta * 2 + phi * 2) * 0.2
      const wave2 = Math.cos(theta * 3 - phi * 2) * 0.15

      // Expanded radius with wave variation
      const baseRadius = 2.2
      const waveRadius = baseRadius + wave1 + wave2

      // Slight horizontal stretch for wave feel
      const stretchX = 1.15
      const stretchY = 1.1
      const stretchZ = 0.85

      posArray[i * 3] = x * waveRadius * stretchX
      posArray[i * 3 + 1] = y * waveRadius * stretchY
      posArray[i * 3 + 2] = z * waveRadius * stretchZ
    }

    return { positions: posArray, count: numParticles }
  }, [])

  // Custom shader material
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3(0, 0, -10) },
          uMagnetStrength: { value: 0.9 },
        },
        vertexShader: `
          uniform float uTime;
          uniform vec3 uMouse;
          uniform float uMagnetStrength;
          varying float vDistanceFromCenter;
          varying float vMouseInfluence;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          
          void main() {
            vec3 pos = position;
            
            // Organic breathing animation
            float distFromCenter = length(pos);
            float breathe = sin(uTime * 0.8 + distFromCenter * 0.5) * 0.08;
            float pulse = sin(uTime * 1.2 + pos.y * 2.0) * cos(uTime * 0.9 + pos.x * 1.5) * 0.05;
            pos *= 1.0 + breathe + pulse;
            
            // Calculate visibility based on distance from center
            vDistanceFromCenter = 1.0 - (distFromCenter / 2.5);
            
            vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
            vWorldPosition = worldPos;
            vNormal = normalize((modelMatrix * vec4(normalize(pos), 0.0)).xyz);
            
            float distToMouse = length(worldPos - uMouse);
            float magneticInfluence = smoothstep(3.0, 0.0, distToMouse);
            magneticInfluence = pow(magneticInfluence, 0.7);
            vMouseInfluence = magneticInfluence;
            
            // Pull vertices towards mouse
            vec3 direction = normalize(uMouse - worldPos);
            vec3 perpendicular = cross(direction, vec3(0.0, 0.0, 1.0));
            pos += direction * magneticInfluence * uMagnetStrength;
            pos += perpendicular * magneticInfluence * 0.4 * sin(uTime * 2.0 + length(worldPos) * 3.0);
            
            float wave = sin(distToMouse * 4.0 - uTime * 2.5) * magneticInfluence * 0.15;
            pos += direction * wave;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = 1.8 + magneticInfluence * 2.5;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying float vDistanceFromCenter;
          varying float vMouseInfluence;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;

          // Hash for subtle randomness
          float hash(float n) {
            return fract(sin(n) * 43758.5453123);
          }

          vec3 getColor(vec3 worldPos, vec3 normal, float time) {
            float angle = atan(worldPos.y, worldPos.x);
            float height = worldPos.z;

            // Warm palette with deep reds
            vec3 warmWhite = vec3(1.0, 0.95, 0.9);
            vec3 softRed = vec3(1.0, 0.4, 0.3);
            vec3 deepRed = vec3(0.85, 0.12, 0.08);
            vec3 darkRed = vec3(0.5, 0.05, 0.02);

            // Slowly moving red zones
            float redZone1 = sin(angle * 2.0 + time * 0.4) * 0.5 + 0.5;
            float redZone2 = cos(height * 3.0 - time * 0.3) * 0.5 + 0.5;
            float redZone3 = sin(angle * 3.0 - height * 2.0 + time * 0.25) * 0.5 + 0.5;

            // Combine for organic patches
            float redMask = redZone1 * 0.4 + redZone2 * 0.35 + redZone3 * 0.25;
            redMask = smoothstep(0.25, 0.75, redMask);

            // Base warm white with red undertone
            vec3 baseColor = mix(warmWhite, softRed, 0.1 + redMask * 0.2);

            // Add deep red patches
            float deepRedMask = redZone1 * redZone2;
            deepRedMask = smoothstep(0.4, 0.8, deepRedMask);
            baseColor = mix(baseColor, deepRed, deepRedMask * 0.7);

            // Dark red accents in crevices
            float darkMask = pow(redZone2 * redZone3, 2.0);
            baseColor = mix(baseColor, darkRed, darkMask * 0.4);

            // Subtle pulsing glow
            float pulse = sin(time * 0.8) * 0.5 + 0.5;
            baseColor += vec3(0.08, 0.02, 0.01) * pulse * redMask;

            return baseColor;
          }

          void main() {
            vec2 center = gl_PointCoord - 0.5;
            float dist = length(center);
            if (dist > 0.5) discard;

            float alpha = smoothstep(0.0, 0.8, vDistanceFromCenter);
            alpha = mix(alpha, 1.0, vMouseInfluence * 0.8);

            vec3 color = getColor(vWorldPosition, vNormal, uTime);

            // Mix with warm white base - higher color intensity
            vec3 finalColor = mix(vec3(1.0, 0.97, 0.94), color, 0.55);

            // Random subtle flare particles
            float flareRand = hash(vWorldPosition.x * 40.0 + vWorldPosition.y * 25.0 + floor(uTime * 3.0));
            float isFlare = step(0.96, flareRand);
            finalColor += vec3(0.3, 0.08, 0.05) * isFlare;

            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  const handlePointerMove = (event: any) => {
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

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current && materialRef.current) {
      pointsRef.current.rotation.y += 0.005
      pointsRef.current.rotation.x += 0.002

      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMouse.value.copy(mouse3D)
    }
  })

  return (
    <points ref={pointsRef} onPointerMove={handlePointerMove}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  )
}
