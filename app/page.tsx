"use client"

import React from "react"

import { Canvas } from "@react-three/fiber"
import { useState, useCallback, useRef, useEffect } from "react"
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

export default function Page() {
  const [hasAudio, setHasAudio] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isFrequencyMode, setIsFrequencyMode] = useState(false)
  const [showFilterLabel, setShowFilterLabel] = useState(false)
  const filterLabelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFilterTypeRef = useRef<FilterType | null>(null)

  // Email form state
  const [email, setEmail] = useState("")
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (!file) return

      if (file.type.startsWith("audio/")) {
        handleAudio(file)
      }
    },
    [handleAudio]
  )

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || emailStatus === "loading") return

    setEmailStatus("loading")
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setEmailStatus("success")
        setEmail("")
      } else {
        setEmailStatus("error")
      }
    } catch {
      setEmailStatus("error")
    }
  }

  const mode = hasAudio ? "audio" : "idle"

  return (
    <div
      className="w-full h-dvh bg-black relative overflow-hidden touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
        {mode === "idle" && <TorusShader />}
        {mode === "audio" && <AudioParticles audioData={audioData} />}
      </Canvas>

      {/* Brand wordmark - center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-white/40 text-sm font-medium tracking-[0.25em]">
          Anvil
        </span>
      </div>

      {/* Audio upload - bottom left */}
      {mode === "idle" && (
        <div
          className="absolute bottom-6 left-6 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label
            htmlFor="audio-upload"
            className={`block cursor-pointer transition-all duration-200 ${
              isDragging ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <span className="text-sm tracking-wide">audio</span>
          </label>
          <input
            ref={audioInputRef}
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleAudioSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Email capture - bottom right */}
      <div className="absolute bottom-6 right-6 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] text-right">
        {emailStatus === "success" ? (
          <p className="text-white/60 text-sm tracking-wide">you&apos;re on the list</p>
        ) : (
          <>
            <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email"
                required
                className="bg-transparent border-b border-white/20 text-white/80 text-sm px-0 py-1 w-36 sm:w-48 focus:outline-none focus:border-white/50 placeholder:text-white/30 transition-all duration-700 hover:border-white/40 animate-[subtle-pulse_4s_ease-in-out_3s_infinite]"
              />
              <button
                type="submit"
                disabled={emailStatus === "loading"}
                className="text-white/40 text-sm tracking-wide hover:text-white/70 transition-colors disabled:opacity-50"
              >
                {emailStatus === "loading" ? "..." : "notify"}
              </button>
            </form>
            {emailStatus === "error" && (
              <p className="text-red-400/60 text-xs mt-2">something went wrong</p>
            )}
          </>
        )}
      </div>

      {/* Frequency toggle - shown when audio is playing */}
      {mode === "audio" && (
        <button
          onClick={toggleFrequencyMode}
          className={`absolute top-6 right-6 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] text-sm tracking-wide transition-colors ${
            isFrequencyMode
              ? "text-white/80"
              : "text-white/30 hover:text-white/70"
          }`}
        >
          ~ frequency
        </button>
      )}

      {/* Audio controls - shown when audio is loaded */}
      {hasAudio && (
        <div className="absolute top-6 left-6 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] flex items-center gap-4">
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
          className="absolute top-6 left-1/2 -translate-x-1/2 pt-[env(safe-area-inset-top)] text-white/30 hover:text-white/70 transition-colors text-sm tracking-wide"
        >
          reset
        </button>
      )}
    </div>
  )
}
