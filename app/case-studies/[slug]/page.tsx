import Link from "next/link"
import { notFound } from "next/navigation"
import { caseStudies, getCaseStudy, getNextCaseStudy } from "@/lib/case-studies"
import { BackgroundBlob } from "@/components/background-blob"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  if (!caseStudy) return {}

  return {
    title: `${caseStudy.title} | Self Made Good`,
    description: caseStudy.description,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  const nextCaseStudy = getNextCaseStudy(slug)

  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="scrollable-page min-h-screen bg-[#0a0a0a] relative">
      <BackgroundBlob />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm tracking-[0.15em] transition-colors"
          >
            self made good
          </Link>
          <Link
            href="/case-studies"
            className="text-white/40 hover:text-white/70 text-sm tracking-wide transition-colors"
          >
            &larr; all work
          </Link>
        </nav>

        {/* Hero */}
        <header className="px-6 md:px-12 lg:px-24 pt-32 pb-16 max-w-5xl">
          <span className="text-white/40 text-sm tracking-wide uppercase block mb-6">
            {caseStudy.subtitle}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white/90 font-light leading-tight">
            {caseStudy.title}
          </h1>
        </header>

        {/* Content */}
        <main className="px-6 md:px-12 lg:px-24 pb-24 max-w-4xl">
          {/* Context */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl text-white/70 mb-6">Context</h2>
            <p className="text-white/50 text-lg leading-relaxed">
              {caseStudy.context}
            </p>
          </section>

          {/* Challenges */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl text-white/70 mb-6">Challenges</h2>
            <ul className="space-y-4">
              {caseStudy.challenges.map((challenge, i) => (
                <li key={i} className="text-white/50 text-lg leading-relaxed pl-6 relative">
                  <span className="absolute left-0 text-white/30">&mdash;</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </section>

          {/* What we built */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl text-white/70 mb-6">What we built</h2>
            <ul className="space-y-4">
              {caseStudy.whatWeBuilt.map((item, i) => (
                <li key={i} className="text-white/50 text-lg leading-relaxed pl-6 relative">
                  <span className="absolute left-0 text-white/30">&mdash;</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Impact */}
          <section className="mb-24">
            <h2 className="font-serif text-2xl text-white/70 mb-6">Impact</h2>
            <ul className="space-y-4">
              {caseStudy.impact.map((item, i) => (
                <li key={i} className="text-white/50 text-lg leading-relaxed pl-6 relative">
                  <span className="absolute left-0 text-white/30">&mdash;</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Navigation */}
          <footer className="border-t border-white/10 pt-12 flex flex-col sm:flex-row justify-between gap-8">
            <Link
              href="/case-studies"
              className="text-white/40 hover:text-white/70 text-sm tracking-wide transition-colors"
            >
              &larr; Back to work
            </Link>
            {nextCaseStudy && (
              <Link
                href={`/case-studies/${nextCaseStudy.slug}`}
                className="text-white/40 hover:text-white/70 text-sm tracking-wide transition-colors text-right"
              >
                Next: {nextCaseStudy.title} &rarr;
              </Link>
            )}
          </footer>
        </main>
      </div>
    </div>
  )
}
