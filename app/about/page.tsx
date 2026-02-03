export default function AboutPage() {
  return (
    <div className="w-full h-dvh bg-black">
      {/* Brand wordmark - top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 select-none">
        <span
          className="font-sans text-white/40 text-2xl font-medium tracking-[0.1em]"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.3)' }}
        >
          anvil.
        </span>
      </div>
    </div>
  )
}
