import Link from "next/link"
import type { CaseStudy } from "@/lib/case-studies"

interface CaseStudyCardProps {
  caseStudy: CaseStudy
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="group block py-12 border-b border-white/10 transition-colors hover:border-white/20"
    >
      <div className="flex flex-col gap-4">
        <span className="text-white/40 text-sm tracking-wide uppercase">
          {caseStudy.subtitle}
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-white/90 group-hover:text-white transition-colors">
          {caseStudy.title}
        </h2>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
          {caseStudy.description}
        </p>
        <span className="text-white/40 text-sm tracking-wide group-hover:text-white/70 transition-colors mt-2">
          View case study &rarr;
        </span>
      </div>
    </Link>
  )
}
