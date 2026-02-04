"use client"

import { useRef, useState, useCallback } from "react"

interface TextWithParticlesProps {
  children: React.ReactNode
  className?: string
}

export function TextWithParticles({ children, className }: TextWithParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; drift: number }>>([])
  const particleId = useRef(0)

  const spawnParticle = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (Math.random() > 0.25) return

    const id = particleId.current++
    const drift = (Math.random() - 0.5) * 24
    setParticles(prev => [...prev.slice(-10), { id, x, y, drift }])

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id))
    }, 1800)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative cursor-default ${className || ""}`}
      onMouseMove={spawnParticle}
    >
      {children}
      {particles.map(particle => (
        <span
          key={particle.id}
          className="absolute w-[2px] h-[2px] bg-white/30 rounded-full pointer-events-none animate-particle"
          style={{
            left: particle.x,
            top: particle.y,
            ['--drift' as string]: `${particle.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
