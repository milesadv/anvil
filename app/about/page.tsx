"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
      <div className="w-full px-5 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
        {/* Brand wordmark - clickable to go home */}
        <div
          className="mb-10 sm:mb-14"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
          }}
        >
          <Link
            href="/"
            className="font-sans text-white/40 text-lg sm:text-xl font-medium tracking-[0.1em] hover:text-white/60 active:text-white/70 transition-colors duration-300 min-h-[44px] inline-flex items-center"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.3)' }}
          >
            anvil.
          </Link>
        </div>

        {/* Headline with subtle emboldening */}
        <h1
          className="text-white/90 text-xl sm:text-2xl md:text-3xl tracking-tight leading-snug mb-8 sm:mb-10"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            fontWeight: 350
          }}
        >
          <span className="font-normal">Operations</span> are a <span className="font-normal">Creative Act</span>
        </h1>

        {/* Body */}
        <div
          className="space-y-4 text-white/50 text-sm sm:text-base font-light leading-relaxed mb-10 sm:mb-14"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
          }}
        >
          <p className="hover:text-white/70 transition-colors duration-500 cursor-default">
            Anvil was founded on a simple but powerful idea: the most successful companies treat their internal operations not as a necessary evil, but as a source of profound competitive advantage. A well-architected operational system is a thing of beauty. It creates clarity, empowers people, and frees up creativity.
          </p>
          <p className="hover:text-white/70 transition-colors duration-500 cursor-default">
            Prior to the origination of Anvil, we saw too many brilliant companies being held back by operational drag. With a background in both strategic consulting and software architecture, they created Anvil to bridge the gap between business strategy and technical execution. We are a team of strategists, designers, and engineers dedicated to building the operational foundations that allow visionary companies to achieve their full potential.
          </p>
        </div>

        {/* Philosophy */}
        <div
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s'
          }}
        >
          <h2 className="text-white/40 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase mb-5 sm:mb-6">
            Our Philosophy
          </h2>
          <div className="space-y-4 text-white/50 text-sm sm:text-base font-light leading-relaxed">
            <div className="group hover:text-white/70 transition-colors duration-500 cursor-default">
              <span className="text-white/60 group-hover:text-white/90 transition-colors duration-500">Ownership</span>
              <span className="text-white/20 mx-2">—</span>
              We build systems for you to own. We provide the training and documentation for you to be fully self-sufficient.
            </div>
            <div className="group hover:text-white/70 transition-colors duration-500 cursor-default">
              <span className="text-white/60 group-hover:text-white/90 transition-colors duration-500">Pragmatism</span>
              <span className="text-white/20 mx-2">—</span>
              We focus on delivering tangible value quickly. No multi-year projects with uncertain outcomes.
            </div>
            <div className="group hover:text-white/70 transition-colors duration-500 cursor-default">
              <span className="text-white/60 group-hover:text-white/90 transition-colors duration-500">Partnership</span>
              <span className="text-white/20 mx-2">—</span>
              We work as an extension of your team, embedding ourselves in your challenges and goals.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
