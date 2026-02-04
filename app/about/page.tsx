"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TextWithParticles } from "@/components/text-with-particles"

export default function AboutPage() {
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
        {/* Brand wordmark - clickable to go home */}
        <div
          className="mb-12 sm:mb-16"
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
          Operations are a creative act.
        </h1>

        {/* Body */}
        <div
          className="space-y-5 text-sm sm:text-base font-normal leading-[1.85] mb-16 sm:mb-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
          }}
        >
          <TextWithParticles className="text-white/45 hover:text-white/65 transition-colors duration-700">
            <p>
              Anvil was founded on a simple idea: the most successful companies treat their internal operations not as monotonous box ticking, but as a source of competitive advantage.
            </p>
          </TextWithParticles>
          <TextWithParticles className="text-white/45 hover:text-white/65 transition-colors duration-700">
            <p>
              A well-architected operational system creates clarity, empowers people, and frees up creativity. We are a team of strategists, designers, and engineers dedicated to building the foundations that allow visionary companies to achieve their full potential.
            </p>
          </TextWithParticles>
        </div>

        {/* Philosophy */}
        <div
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s'
          }}
        >
          <h2 className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-6 sm:mb-8">
            Philosophy
          </h2>
          <div className="space-y-5 text-sm sm:text-base font-normal leading-[1.85]">
            <TextWithParticles className="group text-white/45 hover:text-white/65 transition-colors duration-700">
              <div>
                <span className="text-white/55 group-hover:text-white/75 transition-colors duration-700">Ownership</span>
                <span className="mx-2" />
                We build systems for you to own. We provide the training and documentation for you to be fully self-sufficient.
              </div>
            </TextWithParticles>
            <TextWithParticles className="group text-white/45 hover:text-white/65 transition-colors duration-700">
              <div>
                <span className="text-white/55 group-hover:text-white/75 transition-colors duration-700">Pragmatism</span>
                <span className="mx-2" />
                We focus on delivering tangible value quickly. No multi-year projects with uncertain outcomes.
              </div>
            </TextWithParticles>
            <TextWithParticles className="group text-white/45 hover:text-white/65 transition-colors duration-700">
              <div>
                <span className="text-white/55 group-hover:text-white/75 transition-colors duration-700">Partnership</span>
                <span className="mx-2" />
                We work as an extension of your team, embedding ourselves in your challenges and goals.
              </div>
            </TextWithParticles>
          </div>
        </div>

        {/* Work link */}
        <div
          className="mt-16 sm:mt-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
          }}
        >
          <Link
            href="/case-studies"
            className="text-white/30 text-sm font-normal tracking-wide hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
          >
            Selected work
          </Link>
        </div>
      </div>
    </div>
  )
}
