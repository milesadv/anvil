export interface CaseStudy {
  slug: string
  title: string
  subtitle: string
  description: string
  context: string
  challenges: string[]
  whatWeBuilt: string[]
  impact: string[]
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "planning-cost-control",
    title: "Planning & Cost Control Platform",
    subtitle: "Enterprise resource planning for construction",
    description:
      "A comprehensive platform enabling construction firms to plan, track, and control project costs across their entire portfolio.",
    context:
      "A leading construction company managing multi-million dollar projects needed to replace their fragmented spreadsheet-based cost tracking with an integrated solution. Project managers were spending hours reconciling data, and leadership lacked real-time visibility into portfolio-wide financials.",
    challenges: [
      "Fragmented data across dozens of spreadsheets with no single source of truth",
      "Manual reconciliation consuming 15+ hours per project manager weekly",
      "No real-time visibility into cost variances until projects were already off-track",
      "Complex approval workflows handled through email chains",
      "Integration required with existing ERP and accounting systems",
    ],
    whatWeBuilt: [
      "Unified cost management platform with real-time data synchronization",
      "Automated variance detection with intelligent alerting thresholds",
      "Multi-level approval workflows with delegation and escalation rules",
      "Executive dashboards providing portfolio-wide cost visibility",
      "Bidirectional integration with SAP and existing toolchain",
      "Mobile-first design for on-site cost capture and approvals",
    ],
    impact: [
      "90% reduction in manual reconciliation time",
      "Cost variances identified 3 weeks earlier on average",
      "Portfolio-wide visibility achieved for the first time",
      "Approval cycle time reduced from 5 days to same-day",
      "Adopted across 200+ active projects within first year",
    ],
  },
  {
    slug: "property-intelligence",
    title: "Property Portfolio Intelligence Hub",
    subtitle: "Data-driven real estate asset management",
    description:
      "An intelligent platform consolidating property data, market insights, and portfolio analytics to drive strategic investment decisions.",
    context:
      "A property investment firm managing a diverse portfolio of commercial and residential assets needed a centralised hub to consolidate disparate data sources and surface actionable insights. Investment decisions were being made with incomplete information, and opportunities were being missed.",
    challenges: [
      "Property data scattered across 12+ systems with inconsistent formatting",
      "Market intelligence gathered manually from multiple subscription services",
      "No unified view of portfolio performance across asset classes",
      "Lease expiry tracking done through calendar reminders",
      "Due diligence processes requiring weeks of manual data gathering",
    ],
    whatWeBuilt: [
      "Centralised property database with automated data ingestion pipelines",
      "Real-time market intelligence integration from leading data providers",
      "Interactive portfolio dashboards with drill-down to asset level",
      "Intelligent lease management with automated expiry alerts and renewal tracking",
      "Due diligence workspace accelerating acquisition analysis",
      "Predictive analytics for rent forecasting and vacancy risk",
    ],
    impact: [
      "Single source of truth across entire property portfolio",
      "Due diligence timeline reduced from 6 weeks to 10 days",
      "95% of lease events now proactively managed vs reactive",
      "Investment decisions backed by comprehensive market data",
      "Portfolio visibility enabled strategic divestment saving significant capital",
    ],
  },
]

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}

export function getNextCaseStudy(currentSlug: string): CaseStudy | undefined {
  const currentIndex = caseStudies.findIndex((cs) => cs.slug === currentSlug)
  if (currentIndex === -1) return undefined
  const nextIndex = (currentIndex + 1) % caseStudies.length
  return caseStudies[nextIndex]
}
