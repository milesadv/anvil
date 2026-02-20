import type { Metadata } from "next"
import { getCaseStudy } from "@/lib/case-studies"
import { CaseStudyContent } from "./page-content"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  if (!caseStudy) return {}
  return {
    title: `${caseStudy.title} | anvil.`,
    description: caseStudy.description,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  return <CaseStudyContent slug={slug} />
}
