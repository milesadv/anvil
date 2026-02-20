import type { Metadata } from "next"
import { CaseStudiesContent } from "./page-content"

export const metadata: Metadata = {
  title: "Work | anvil.",
  description: "Selected work by Anvil.",
}

export default function CaseStudiesPage() {
  return <CaseStudiesContent />
}
