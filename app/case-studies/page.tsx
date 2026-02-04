import Link from "next/link"
import { caseStudies } from "@/lib/case-studies"
import { CaseStudyCard } from "@/components/case-study-card"
import { BackgroundBlob } from "@/components/background-blob"

export const metadata = {
  title: "Work | Anvil",
  description: "Case studies showcasing our approach to building digital products.",
}

export default function CaseStudiesPage() {
  return (
    <div className="scrollable-page min-h-screen bg-[#0a0a0a] relative">
      <BackgroundBlob />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-6">
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm tracking-[0.15em] transition-colors"
          >
            anvil.
          </Link>
        </nav>

        {/* Content */}
        <main className="px-6 md:px-12 lg:px-24 pt-32 pb-24 max-w-5xl">
          <header className="mb-16">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white/90 font-light">
              Work
            </h1>
          </header>

          <div className="flex flex-col">
            {caseStudies.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
