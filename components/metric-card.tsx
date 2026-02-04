"use client"

import { useEffect, useRef, useState } from "react"

interface MetricCardProps {
  value: string
  label: string
  delay?: number
}

export function MetricCard({ value, label, delay = 0 }: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayValue, setDisplayValue] = useState("0")
  const ref = useRef<HTMLDivElement>(null)

  // Extract numeric part and suffix
  const match = value.match(/^(\d+)(.*)$/)
  const numericValue = match ? parseInt(match[1], 10) : 0
  const suffix = match ? match[2] : ""

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible, delay])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1200
    const steps = 30
    const stepDuration = duration / steps

    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(numericValue * eased)
      setDisplayValue(current.toString())

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(numericValue.toString())
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, numericValue])

  return (
    <div
      ref={ref}
      className="group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }}
    >
      <div className="text-white/70 text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight mb-2 tabular-nums">
        {displayValue}<span className="text-white/50">{suffix}</span>
      </div>
      <div className="text-white/35 text-xs sm:text-sm font-normal leading-relaxed">
        {label}
      </div>
    </div>
  )
}
