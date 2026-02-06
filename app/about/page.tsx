"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TextWithParticles } from "@/components/text-with-particles"

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    document.body.style.position = "relative"
    document.body.style.overflow = "auto"
    document.body.style.touchAction = "pan-y"

    const timer = setTimeout(() => setIsLoaded(true), 100)

    return () => {
      document.body.style.position = "fixed"
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="relative min-h-dvh w-full overflow-y-auto overscroll-y-contain scroll-smooth bg-black">
      <div className="w-full px-5 py-12 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-8 sm:py-16 md:px-12 lg:px-16">
        {/* Brand wordmark - clickable to go home */}
        <div
          className="mb-12 sm:mb-16"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-sans text-lg font-medium tracking-widest text-white/30 transition-colors duration-500 hover:text-white/50 sm:text-xl"
          >
            anvil.
          </Link>
        </div>

        {/* Headline */}
        <h1
          className="mb-10 text-xl leading-relaxed font-normal tracking-[-0.01em] text-white/80 sm:mb-14 sm:text-2xl md:text-3xl"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out 0.1s, transform 0.8s ease-out 0.1s",
          }}
        >
          Operations are a creative act.
        </h1>

        {/* Body */}
        <div
          className="mb-16 space-y-5 text-sm leading-[1.85] font-normal sm:mb-20 sm:text-base"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s",
          }}
        >
          <TextWithParticles className="text-white/45 transition-colors duration-700 hover:text-white/65">
            <p>
              Anvil was founded on a simple idea: the most successful companies treat their internal
              operations not as monotonous box ticking, but as a source of competitive advantage.
            </p>
          </TextWithParticles>
          <TextWithParticles className="text-white/45 transition-colors duration-700 hover:text-white/65">
            <p>
              A well-architected operational system creates clarity, empowers people, and frees up
              creativity. We are a team of strategists, designers, and engineers dedicated to
              building the foundations that allow visionary companies to achieve their full
              potential.
            </p>
          </TextWithParticles>
        </div>

        {/* Philosophy */}
        <div
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
          }}
        >
          <h2 className="mb-6 text-[10px] font-medium tracking-[0.25em] text-white/30 uppercase sm:mb-8 sm:text-xs">
            Philosophy
          </h2>
          <div className="space-y-5 text-sm leading-[1.85] font-normal sm:text-base">
            <TextWithParticles className="group text-white/45 transition-colors duration-700 hover:text-white/65">
              <div>
                <span className="text-white/55 transition-colors duration-700 group-hover:text-white/75">
                  Ownership
                </span>
                <span className="mx-2" />
                We build systems for you to own. We provide the training and documentation for you
                to be fully self-sufficient.
              </div>
            </TextWithParticles>
            <TextWithParticles className="group text-white/45 transition-colors duration-700 hover:text-white/65">
              <div>
                <span className="text-white/55 transition-colors duration-700 group-hover:text-white/75">
                  Pragmatism
                </span>
                <span className="mx-2" />
                We focus on delivering tangible value quickly. No multi-year projects with uncertain
                outcomes.
              </div>
            </TextWithParticles>
            <TextWithParticles className="group text-white/45 transition-colors duration-700 hover:text-white/65">
              <div>
                <span className="text-white/55 transition-colors duration-700 group-hover:text-white/75">
                  Partnership
                </span>
                <span className="mx-2" />
                We work as an extension of your team, embedding ourselves in your challenges and
                goals.
              </div>
            </TextWithParticles>
          </div>
        </div>

        {/* Work link */}
        <div
          className="mt-16 sm:mt-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s",
          }}
        >
          <Link
            href="/case-studies"
            className="inline-flex min-h-11 items-center text-sm font-normal tracking-wide text-white/30 transition-colors duration-500 hover:text-white/50"
          >
            selected work
          </Link>
        </div>
      </div>
    </div>
  )
}
