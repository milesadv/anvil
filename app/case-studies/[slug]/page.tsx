"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCaseStudy, getNextCaseStudy } from "@/lib/case-studies"
import { TextWithParticles } from "@/components/text-with-particles"
import { MetricCard } from "@/components/metric-card"

// Parse impact string to extract metric value and description
function parseImpact(impact: string): { value: string; label: string } | null {
  // Match patterns like "90% reduction..." or "3 weeks earlier..." or "200+ active projects..."
  const patterns = [
    /^(\d+%)\s+(.+)$/,           // "90% reduction..."
    /^(\d+\+?)\s+(.+)$/,         // "200+ active projects..."
    /^(\d+)\s+(weeks?|days?|hours?)\s+(.+)$/i,  // "3 weeks earlier..."
  ]

  for (const pattern of patterns) {
    const match = impact.match(pattern)
    if (match) {
      if (pattern === patterns[2]) {
        // Time-based pattern
        return { value: `${match[1]} ${match[2]}`, label: match[3] }
      }
      return { value: match[1], label: match[2] }
    }
  }

  return null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CaseStudyPage({ params }: PageProps) {
  const { slug } = use(params)
  const caseStudy = getCaseStudy(slug)
  const nextCaseStudy = getNextCaseStudy(slug)
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

  if (!caseStudy) {
    notFound()
  }

  // Parse impact items
  const parsedImpacts = caseStudy.impact.map(item => ({
    original: item,
    parsed: parseImpact(item)
  }))

  const metricsWithValues = parsedImpacts.filter(i => i.parsed !== null)
  const metricsWithoutValues = parsedImpacts.filter(i => i.parsed === null)

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
            href="/case-studies"
            className="text-white/30 text-sm font-normal tracking-wide hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
          >
            all work
          </Link>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.1s, transform 0.8s ease-out 0.1s'
          }}
        >
          <span className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase block mb-4 sm:mb-6">
            {caseStudy.subtitle}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-white/80 text-xl sm:text-2xl md:text-3xl tracking-[-0.01em] leading-relaxed mb-10 sm:mb-14 font-normal"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s'
          }}
        >
          {caseStudy.title}
        </h1>

        {/* Context */}
        <div
          className="mb-16 sm:mb-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
          }}
        >
          <h2 className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-6 sm:mb-8">
            Context
          </h2>
          <TextWithParticles className="text-white/45 hover:text-white/65 transition-colors duration-700">
            <p className="text-sm sm:text-base font-normal leading-[1.85]">
              {caseStudy.context}
            </p>
          </TextWithParticles>
        </div>

        {/* Challenges */}
        <div
          className="mb-16 sm:mb-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s'
          }}
        >
          <h2 className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-6 sm:mb-8">
            Challenges
          </h2>
          <div className="space-y-5 text-sm sm:text-base font-normal leading-[1.85]">
            {caseStudy.challenges.map((challenge, i) => (
              <TextWithParticles key={i} className="text-white/45 hover:text-white/65 transition-colors duration-700">
                <p>{challenge}</p>
              </TextWithParticles>
            ))}
          </div>
        </div>

        {/* What we built */}
        <div
          className="mb-16 sm:mb-20"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
          }}
        >
          <h2 className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-6 sm:mb-8">
            What we built
          </h2>
          <div className="space-y-5 text-sm sm:text-base font-normal leading-[1.85]">
            {caseStudy.whatWeBuilt.map((item, i) => (
              <TextWithParticles key={i} className="text-white/45 hover:text-white/65 transition-colors duration-700">
                <p>{item}</p>
              </TextWithParticles>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div
          className="mb-12 sm:mb-16"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.5s, transform 0.8s ease-out 0.5s'
          }}
        >
          <h2 className="text-white/30 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-8 sm:mb-10">
            Impact
          </h2>

          {/* Metrics grid */}
          {metricsWithValues.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 mb-10">
              {metricsWithValues.map((item, i) => (
                <MetricCard
                  key={i}
                  value={item.parsed!.value}
                  label={item.parsed!.label}
                  delay={i * 150}
                />
              ))}
            </div>
          )}

          {/* Remaining text items */}
          {metricsWithoutValues.length > 0 && (
            <div className="space-y-4">
              {metricsWithoutValues.map((item, i) => (
                <TextWithParticles key={i} className="text-white/45 hover:text-white/65 transition-colors duration-700">
                  <p className="text-sm sm:text-base font-normal leading-[1.85]">
                    {item.original}
                  </p>
                </TextWithParticles>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          className="pt-12 sm:pt-16 flex flex-col sm:flex-row justify-between gap-6"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s'
          }}
        >
          <Link
            href="/case-studies"
            className="text-white/30 text-sm font-normal tracking-wide hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
          >
            All work
          </Link>
          {nextCaseStudy && (
            <Link
              href={`/case-studies/${nextCaseStudy.slug}`}
              className="text-white/30 text-sm font-normal tracking-wide hover:text-white/50 transition-colors duration-500 min-h-[44px] inline-flex items-center"
            >
              {nextCaseStudy.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
