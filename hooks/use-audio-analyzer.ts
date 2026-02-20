"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"

export type FilterType = "lowpass" | "highpass" | "off"

export interface AudioData {
  // Frequency band levels (0-1, smoothed)
  bass: number
  mid: number
  high: number
  // Beat detection (0-1, decays after beat)
  beat: number
  // Overall volume/energy (0-1)
  volume: number
  // Raw frequency data for detailed visualizations
  frequencyData: Uint8Array | null
  // Playback state
  isPlaying: boolean
  duration: number
  currentTime: number
  // Filter state
  filterType: FilterType
  filterFrequency: number
}

interface AudioAnalyzerControls {
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  seek: (time: number) => void
  loadAudio: (file: File) => Promise<void>
  reset: () => void
  // Filter controls
  setFilter: (type: FilterType, frequency: number) => void
  setFilterEnabled: (enabled: boolean) => void
}

const INITIAL_AUDIO_DATA: AudioData = {
  bass: 0,
  mid: 0,
  high: 0,
  beat: 0,
  volume: 0,
  frequencyData: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  filterType: "off",
  filterFrequency: 1000,
}

// Frequency ranges in Hz
const BASS_RANGE = { min: 20, max: 250 }
const MID_RANGE = { min: 250, max: 4000 }
const HIGH_RANGE = { min: 4000, max: 20000 }

// Smoothing factor (0-1, higher = smoother but slower response)
const SMOOTHING = 0.85
const BEAT_DECAY = 0.95
const BEAT_THRESHOLD = 1.4 // Energy spike multiplier to trigger beat

export function useAudioAnalyzer(): [AudioData, AudioAnalyzerControls] {
  const [audioData, setAudioData] = useState<AudioData>(INITIAL_AUDIO_DATA)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const filterEnabledRef = useRef<boolean>(false)

  // Smoothed values for interpolation
  const smoothedRef = useRef({ bass: 0, mid: 0, high: 0, volume: 0, beat: 0 })
  // Rolling average for beat detection
  const energyHistoryRef = useRef<number[]>([])
  const frequencyDataRef = useRef<Uint8Array | null>(null)

  // Get average value in a frequency range
  const getFrequencyRangeAverage = useCallback((
    dataArray: Uint8Array,
    minFreq: number,
    maxFreq: number,
    fftSize: number,
    sampleRate: number
  ) => {
    const minIndex = Math.floor((minFreq * fftSize) / sampleRate)
    const maxIndex = Math.floor((maxFreq * fftSize) / sampleRate)

    let sum = 0
    let count = 0

    for (let i = minIndex; i <= maxIndex && i < dataArray.length; i++) {
      sum += dataArray[i]
      count++
    }

    return count > 0 ? (sum / count) / 255 : 0
  }, [])

  // Analysis loop
  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioElementRef.current) return

    const analyser = analyserRef.current
    const audio = audioElementRef.current
    const fftSize = analyser.fftSize
    const sampleRate = audioContextRef.current?.sampleRate || 44100

    // Get frequency data
    if (!frequencyDataRef.current) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    analyser.getByteFrequencyData(frequencyDataRef.current as Uint8Array<ArrayBuffer>)

    // Calculate frequency band averages
    const rawBass = getFrequencyRangeAverage(
      frequencyDataRef.current, BASS_RANGE.min, BASS_RANGE.max, fftSize, sampleRate
    )
    const rawMid = getFrequencyRangeAverage(
      frequencyDataRef.current, MID_RANGE.min, MID_RANGE.max, fftSize, sampleRate
    )
    const rawHigh = getFrequencyRangeAverage(
      frequencyDataRef.current, HIGH_RANGE.min, HIGH_RANGE.max, fftSize, sampleRate
    )

    // Calculate overall volume
    let sum = 0
    for (let i = 0; i < frequencyDataRef.current.length; i++) {
      sum += frequencyDataRef.current[i]
    }
    const rawVolume = (sum / frequencyDataRef.current.length) / 255

    // Apply smoothing
    const s = smoothedRef.current
    s.bass = s.bass * SMOOTHING + rawBass * (1 - SMOOTHING)
    s.mid = s.mid * SMOOTHING + rawMid * (1 - SMOOTHING)
    s.high = s.high * SMOOTHING + rawHigh * (1 - SMOOTHING)
    s.volume = s.volume * SMOOTHING + rawVolume * (1 - SMOOTHING)

    // Beat detection based on bass energy
    const currentEnergy = rawBass
    energyHistoryRef.current.push(currentEnergy)
    if (energyHistoryRef.current.length > 30) {
      energyHistoryRef.current.shift()
    }

    const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0) / energyHistoryRef.current.length

    // Detect beat: current energy significantly above average
    if (currentEnergy > avgEnergy * BEAT_THRESHOLD && s.beat < 0.3) {
      s.beat = 1.0
    } else {
      s.beat *= BEAT_DECAY
    }

    setAudioData(prev => ({
      ...prev,
      bass: s.bass,
      mid: s.mid,
      high: s.high,
      beat: s.beat,
      volume: s.volume,
      frequencyData: frequencyDataRef.current,
      isPlaying: !audio.paused,
      duration: audio.duration || 0,
      currentTime: audio.currentTime || 0,
    }))

    if (!audio.paused) {
      animationFrameRef.current = requestAnimationFrame(analyze)
    }
  }, [getFrequencyRangeAverage])

  // Initialize audio context and analyser
  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume()
    }

    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.3
    }

    // Create filter node
    if (!filterRef.current) {
      filterRef.current = audioContextRef.current.createBiquadFilter()
      filterRef.current.type = "lowpass"
      filterRef.current.frequency.value = 20000 // Start fully open
      filterRef.current.Q.value = 1
    }

    return { context: audioContextRef.current, analyser: analyserRef.current, filter: filterRef.current }
  }, [])

  // Load audio file
  const loadAudio = useCallback(async (file: File) => {
    const { context, analyser, filter } = await initAudio()

    // Clean up previous source
    if (sourceRef.current) {
      sourceRef.current.disconnect()
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      URL.revokeObjectURL(audioElementRef.current.src)
    }

    // Create new audio element
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.loop = true  // Enable looping
    audio.src = URL.createObjectURL(file)
    audioElementRef.current = audio

    // Wait for audio to load
    await new Promise<void>((resolve, reject) => {
      audio.onloadeddata = () => resolve()
      audio.onerror = () => reject(new Error("Failed to load audio"))
    })

    // Connect audio chain: source -> filter -> analyser -> destination
    const source = context.createMediaElementSource(audio)
    source.connect(filter)
    filter.connect(analyser)
    analyser.connect(context.destination)
    sourceRef.current = source

    // Reset filter to neutral
    filter.type = "lowpass"
    filter.frequency.value = 20000
    filterEnabledRef.current = false

    // Reset smoothed values
    smoothedRef.current = { bass: 0, mid: 0, high: 0, volume: 0, beat: 0 }
    energyHistoryRef.current = []

    setAudioData(prev => ({
      ...prev,
      duration: audio.duration,
      currentTime: 0,
      isPlaying: false,
      filterType: "off",
      filterFrequency: 1000,
    }))
  }, [initAudio])

  const play = useCallback(async () => {
    if (!audioElementRef.current) return

    // Ensure audio context is running (browser autoplay policy)
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume()
    }

    await audioElementRef.current.play()
    animationFrameRef.current = requestAnimationFrame(analyze)
  }, [analyze])

  const pause = useCallback(() => {
    if (!audioElementRef.current) return
    audioElementRef.current.pause()
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setAudioData(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const toggle = useCallback(() => {
    if (audioElementRef.current?.paused) {
      play()
    } else {
      pause()
    }
  }, [play, pause])

  const setVolume = useCallback((volume: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time
    }
  }, [])

  // Set filter type and frequency
  const setFilter = useCallback((type: FilterType, frequency: number) => {
    if (!filterRef.current || !audioContextRef.current) return

    const filter = filterRef.current
    const ctx = audioContextRef.current

    if (type === "off") {
      // Bypass filter by setting to fully open lowpass
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(20000, ctx.currentTime)
      filterEnabledRef.current = false
    } else {
      filter.type = type
      // Smooth transition to avoid clicks
      filter.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.01)
      filterEnabledRef.current = true
    }

    setAudioData(prev => ({
      ...prev,
      filterType: type,
      filterFrequency: frequency,
    }))
  }, [])

  // Enable/disable filter
  const setFilterEnabled = useCallback((enabled: boolean) => {
    if (!enabled) {
      setFilter("off", 1000)
    }
    filterEnabledRef.current = enabled
  }, [setFilter])

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      URL.revokeObjectURL(audioElementRef.current.src)
      audioElementRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // Reset filter
    if (filterRef.current) {
      filterRef.current.type = "lowpass"
      filterRef.current.frequency.value = 20000
    }
    filterEnabledRef.current = false

    smoothedRef.current = { bass: 0, mid: 0, high: 0, volume: 0, beat: 0 }
    energyHistoryRef.current = []
    frequencyDataRef.current = null

    setAudioData(INITIAL_AUDIO_DATA)
  }, [])

  // Handle audio ended - we don't need timeupdate since analyze() handles currentTime during playback
  useEffect(() => {
    const audio = audioElementRef.current
    if (!audio) return

    const handleEnded = () => {
      setAudioData(prev => ({ ...prev, isPlaying: false }))
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioData.isPlaying]) // Re-attach when playback state changes (new audio triggers play)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        URL.revokeObjectURL(audioElementRef.current.src)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const controls: AudioAnalyzerControls = useMemo(() => ({
    play,
    pause,
    toggle,
    setVolume,
    seek,
    loadAudio,
    reset,
    setFilter,
    setFilterEnabled,
  }), [play, pause, toggle, setVolume, seek, loadAudio, reset, setFilter, setFilterEnabled])

  return [audioData, controls]
}
