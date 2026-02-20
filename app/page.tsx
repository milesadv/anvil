import type { Metadata } from "next"
import { HomeContent } from "./page-content"

export const metadata: Metadata = {
  title: "anvil.",
  description: "forging foundations",
}

export default function Page() {
  return <HomeContent />
}
