import type { Metadata } from "next"
import { AboutContent } from "./page-content"

export const metadata: Metadata = {
  title: "About | anvil.",
  description: "Anvil — operations as a creative act.",
}

export default function AboutPage() {
  return <AboutContent />
}
