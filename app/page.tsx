"use client"

import React from "react"
import { Canvas } from "@react-three/fiber"
import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AudioParticles } from "@/components/audio-particles"
import { TorusShader } from "@/components/torus-shader"
import { useAudioAnalyzer, type FilterType } from "@/hooks/use-audio-analyzer"

// Map mouse position to filter parameters
function mapMouseToFilter(mouseX: number, mouseY: number, screenWidth: number, screenHeight: number): { type: FilterType; frequency: number } {
  const normalizedX = mouseX / screenWidth
  const normalizedY = mouseY / screenHeight

  // X-axis: left = lowpass, right = highpass
  const type: FilterType = normalizedX < 0.5 ? "lowpass" : "highpass"

  // Y-axis: logarithmic frequency mapping (top = low freq, bottom = high freq)
  const minFreq = 20
  const maxFreq = 20000
  const frequency = minFreq * Math.pow(maxFreq / minFreq, normalizedY)

  return { type, frequency }
}

const ANVIL_LETTERS = ['a', 'n', 'v', 'i', 'l', '.']

export default function Page() {
  const router = useRouter()
  const [hasAudio, setHasAudio] = useState(false)
  const [isFrequencyMode, setIsFrequencyMode] = useState(false)
  const [showFilterLabel, setShowFilterLabel] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const filterLabelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFilterTypeRef = useRef<FilterType | null>(null)

  // Trigger load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleAnvilClick = useCallback(() => {
    setIsZooming(true)
    setTimeout(() => {
      router.push("/about")
    }, 850)
  }, [router])


  const audioInputRef = useRef<HTMLInputElement>(null)

  const [audioData, audioControls] = useAudioAnalyzer()

  // Show filter label briefly
  const showLabelBriefly = useCallback(() => {
    setShowFilterLabel(true)
    if (filterLabelTimeoutRef.current) {
      clearTimeout(filterLabelTimeoutRef.current)
    }
    filterLabelTimeoutRef.current = setTimeout(() => {
      setShowFilterLabel(false)
    }, 1500)
  }, [])

  // Handle mouse/touch movement in frequency mode
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isFrequencyMode) return

    const { type, frequency } = mapMouseToFilter(
      clientX,
      clientY,
      window.innerWidth,
      window.innerHeight
    )

    // Show label when filter type changes
    if (type !== lastFilterTypeRef.current) {
      lastFilterTypeRef.current = type
      showLabelBriefly()
    }

    audioControls.setFilter(type, frequency)
  }, [isFrequencyMode, audioControls, showLabelBriefly])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY)
  }, [handlePointerMove])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }, [handlePointerMove])

  // Toggle frequency mode
  const toggleFrequencyMode = useCallback(() => {
    if (isFrequencyMode) {
      // Exiting frequency mode - disable filter
      audioControls.setFilterEnabled(false)
      setIsFrequencyMode(false)
      setShowFilterLabel(false)
      lastFilterTypeRef.current = null
      if (filterLabelTimeoutRef.current) {
        clearTimeout(filterLabelTimeoutRef.current)
      }
    } else {
      setIsFrequencyMode(true)
      showLabelBriefly()
    }
  }, [isFrequencyMode, audioControls, showLabelBriefly])

  // Handle ESC key to exit frequency mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFrequencyMode) {
        audioControls.setFilterEnabled(false)
        setIsFrequencyMode(false)
        setShowFilterLabel(false)
        lastFilterTypeRef.current = null
        if (filterLabelTimeoutRef.current) {
          clearTimeout(filterLabelTimeoutRef.current)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFrequencyMode, audioControls])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterLabelTimeoutRef.current) {
        clearTimeout(filterLabelTimeoutRef.current)
      }
    }
  }, [])

  const handleAudio = useCallback(async (file: File) => {
    try {
      await audioControls.loadAudio(file)
      setHasAudio(true)
      audioControls.play()
    } catch (error) {
      console.error("Failed to load audio:", error)
    }
  }, [audioControls])

  const handleAudioSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleAudio(file)
      }
    },
    [handleAudio]
  )

  const reset = () => {
    setHasAudio(false)
    setIsFrequencyMode(false)
    audioControls.reset()
    if (audioInputRef.current) audioInputRef.current.value = ""
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const mode = hasAudio ? "audio" : "idle"

  return (
    <div
      className={`w-full h-dvh bg-black relative overflow-hidden touch-none transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div
        className="w-full h-full"
        style={{
          opacity: isZooming ? 0 : 1,
          transition: isZooming ? 'opacity 0.8s ease-in-out' : 'none'
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
          {mode === "idle" && <TorusShader />}
          {mode === "audio" && <AudioParticles audioData={audioData} />}
        </Canvas>
      </div>

      {/* Fade overlay for transition */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: isZooming ? 1 : 0,
          transition: isZooming ? 'opacity 0.6s ease-in 0.3s' : 'none'
        }}
      />

      {/* Brand wordmark - center */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center select-none mix-blend-plus-lighter pointer-events-none"
        style={{
          opacity: isZooming ? 0 : 1,
          transition: isZooming ? 'opacity 0.4s ease-out' : 'opacity 0.5s ease-out'
        }}
      >
        <button
          onClick={handleAnvilClick}
          className="font-sans text-2xl sm:text-3xl font-medium tracking-[0.1em] cursor-pointer pointer-events-auto min-h-[44px] min-w-[44px] flex items-center justify-center gap-[0.1em] group"
        >
          {ANVIL_LETTERS.map((letter, index) => (
            <span
              key={index}
              className="text-white/40 group-hover:text-white/50 active:text-white/60 transition-colors duration-300 animate-float inline-block"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.3)',
                animationDelay: `${index * 0.15}s`,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s, color 0.3s ease`
              }}
            >
              {letter}
            </span>
          ))}
        </button>
      </div>


      {/* Audio upload - hidden for now */}
      <input
        ref={audioInputRef}
        id="audio-upload"
        type="file"
        accept="audio/*"
        onChange={handleAudioSelect}
        className="hidden"
      />


      {/* Frequency toggle - shown when audio is playing */}
      {mode === "audio" && (
        <button
          onClick={toggleFrequencyMode}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] text-sm tracking-wide transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isFrequencyMode
              ? "text-white/80"
              : "text-white/30 hover:text-white/70 active:text-white/80"
          }`}
        >
          ~ frequency
        </button>
      )}

      {/* Audio controls - shown when audio is loaded */}
      {hasAudio && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] flex items-center gap-2 sm:gap-4">
          {/* Time */}
          <span className="text-white/20 text-xs font-mono">
            {formatTime(audioData.currentTime)} / {formatTime(audioData.duration)}
          </span>

          {/* Audio levels indicator */}
          <div className="flex items-end gap-0.5 h-3">
            <div
              className="w-1 bg-white/40 transition-all duration-75"
              style={{ height: `${Math.max(2, audioData.bass * 12)}px` }}
            />
            <div
              className="w-1 bg-white/30 transition-all duration-75"
              style={{ height: `${Math.max(2, audioData.mid * 12)}px` }}
            />
            <div
              className="w-1 bg-white/20 transition-all duration-75"
              style={{ height: `${Math.max(2, audioData.high * 12)}px` }}
            />
          </div>
        </div>
      )}

      {/* Filter label - shown briefly when filter type changes */}
      {isFrequencyMode && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 ${
            showFilterLabel ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-white/60 text-lg font-mono tracking-wide text-center">
            {audioData.filterType === "lowpass" ? "low pass" : "high pass"}
          </div>
        </div>
      )}

      {/* Reset button */}
      {mode !== "idle" && (
        <button
          onClick={reset}
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 pt-[env(safe-area-inset-top)] text-white/30 hover:text-white/70 active:text-white/80 transition-colors text-sm tracking-wide min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          reset
        </button>
      )}
    </div>
  )
}
