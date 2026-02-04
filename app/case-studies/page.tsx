"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { caseStudies } from "@/lib/case-studies"

// Particle component for hover effect (same as about page)
function TextWithParticles({ children, className }: { children: React.ReactNode; className?: string }) {
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
      className={`relative cursor-default ${className}`}
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

export default function CaseStudiesPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    document.body.style.position = 'relative'
    document.body.style.overflow = 'auto'
    document.body.style.touchAction = 'pan-y'

    const timer = setTimeout(() => setIsLoaded(true), 100)

    return () => {
      document.body.style.position = 'fixed'
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="w-full min-h-dvh bg-black relative overflow-y-auto overscroll-y-contain scroll-smooth">
      <div className="w-full px-5 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]">
        {/* Navigation */}
        <div
          className="flex justify-between items-center mb-12 sm:mb-16"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}
        >
          <Link
            href="/"
            className="font-sans text-white/30 text-lg sm:text-xl font-medium tracking-[0.1em] hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
          >
            anvil.
          </Link>
          <Link
            href="/about"
            className="text-white/30 text-sm font-normal tracking-wide hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
          >
            about
          </Link>
        </div>

        {/* Headline */}
        <h1
          className="text-white/80 text-xl sm:text-2xl md:text-3xl tracking-[-0.01em] leading-relaxed mb-10 sm:mb-14 font-normal"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.1s, transform 0.8s ease-out 0.1s'
          }}
        >
          Work
        </h1>

        {/* Case Studies List */}
        <div
          className="space-y-10 sm:space-y-12"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
          }}
        >
          {caseStudies.map((caseStudy, index) => (
            <Link
              key={caseStudy.slug}
              href={`/case-studies/${caseStudy.slug}`}
              className="block group"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.8s ease-out ${0.2 + index * 0.1}s, transform 0.8s ease-out ${0.2 + index * 0.1}s`
              }}
            >
              <TextWithParticles className="text-white/45 hover:text-white/65 transition-colors duration-700">
                <div className="py-6 sm:py-8">
                  <span className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase block mb-3 sm:mb-4 group-hover:text-white/40 transition-colors duration-500">
                    {caseStudy.subtitle}
                  </span>
                  <h2 className="text-white/55 text-lg sm:text-xl md:text-2xl font-normal tracking-[-0.01em] mb-3 sm:mb-4 group-hover:text-white/75 transition-colors duration-500">
                    {caseStudy.title}
                  </h2>
                  <p className="text-sm sm:text-base font-normal leading-[1.85]">
                    {caseStudy.description}
                  </p>
                </div>
              </TextWithParticles>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
