"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function SubtleBlob() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Create organic blob geometry with fewer particles for subtlety
  const { positions } = useMemo(() => {
    const numParticles = 10000
    const posArray = new Float32Array(numParticles * 3)

    for (let i = 0; i < numParticles; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.sin(phi) * Math.sin(theta)
      const z = Math.cos(phi)

      const noise1 = Math.sin(x * 3 + y * 2) * Math.cos(z * 2.5) * 0.3
      const noise2 = Math.sin(y * 4 + z * 3) * Math.cos(x * 2) * 0.2
      const noise3 = Math.sin(z * 5 + x * 2) * Math.cos(y * 3) * 0.15
      const noise4 = Math.sin(x * 2 - y * 3 + z) * 0.1

      const displacement = 1.2 + noise1 + noise2 + noise3 + noise4
      const asymmetry = 1 + Math.sin(theta * 2) * 0.1 + Math.cos(phi * 3) * 0.08

      posArray[i * 3] = x * displacement * asymmetry * 1.5
      posArray[i * 3 + 1] = y * displacement * asymmetry * 1.5
      posArray[i * 3 + 2] = z * displacement * 1.5
    }

    return { positions: posArray }
  }, [])

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          varying float vDistanceFromCenter;
          varying vec3 vWorldPosition;

          void main() {
            vec3 pos = position;

            // Slow breathing animation
            float distFromCenter = length(pos);
            float breathe = sin(uTime * 0.4 + distFromCenter * 0.5) * 0.06;
            float pulse = sin(uTime * 0.6 + pos.y * 2.0) * cos(uTime * 0.5 + pos.x * 1.5) * 0.03;
            pos *= 1.0 + breathe + pulse;

            vDistanceFromCenter = 1.0 - (distFromCenter / 2.5);

            vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
            vWorldPosition = worldPos;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = 1.2;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying float vDistanceFromCenter;
          varying vec3 vWorldPosition;

          vec3 getColor(vec3 worldPos, float time) {
            float angle = atan(worldPos.y, worldPos.x);
            float height = worldPos.z;

            vec3 warmWhite = vec3(1.0, 0.95, 0.9);
            vec3 softRed = vec3(1.0, 0.4, 0.3);
            vec3 deepRed = vec3(0.85, 0.12, 0.08);

            float redZone1 = sin(angle * 2.0 + time * 0.2) * 0.5 + 0.5;
            float redZone2 = cos(height * 3.0 - time * 0.15) * 0.5 + 0.5;
            float redZone3 = sin(angle * 3.0 - height * 2.0 + time * 0.12) * 0.5 + 0.5;

            float redMask = redZone1 * 0.4 + redZone2 * 0.35 + redZone3 * 0.25;
            redMask = smoothstep(0.25, 0.75, redMask);

            vec3 baseColor = mix(warmWhite, softRed, 0.1 + redMask * 0.2);

            float deepRedMask = redZone1 * redZone2;
            deepRedMask = smoothstep(0.4, 0.8, deepRedMask);
            baseColor = mix(baseColor, deepRed, deepRedMask * 0.5);

            return baseColor;
          }

          void main() {
            vec2 center = gl_PointCoord - 0.5;
            float dist = length(center);
            if (dist > 0.5) discard;

            float alpha = smoothstep(0.0, 0.8, vDistanceFromCenter) * 0.25;

            vec3 color = getColor(vWorldPosition, uTime);
            vec3 finalColor = mix(vec3(1.0, 0.97, 0.94), color, 0.4);

            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  useFrame((state) => {
    if (pointsRef.current && materialRef.current) {
      pointsRef.current.rotation.y += 0.002
      pointsRef.current.rotation.x += 0.001
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  )
}

export function BackgroundBlob() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
        <SubtleBlob />
      </Canvas>
    </div>
  )
}
