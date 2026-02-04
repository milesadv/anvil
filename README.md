# Anvil

Crafting foundations for visionary companies.

## About

Anvil is an operations consultancy that helps companies transform their internal operations into a source of competitive advantage. This repository contains the company's digital presence—a minimal, modern website featuring an interactive particle visualisation.

## Features

- **Interactive Home**: Ambient particle visualisation with mouse-tracking magnetic effects
- **About Page**: Company philosophy and approach with subtle hover interactions
- **Case Studies**: Portfolio of work showcasing operational transformation projects
- **Audio Visualiser**: Hidden feature for audio-reactive particle system (upload audio to activate)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber + Three.js with custom GLSL shaders
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans, Geist Mono
- **Analytics**: Vercel Analytics

## Project Structure

```
/anvil
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page with particle visualisation
│   ├── globals.css         # Global styles and animations
│   ├── about/
│   │   └── page.tsx        # About page
│   └── case-studies/
│       ├── page.tsx        # Case studies listing
│       └── [slug]/
│           └── page.tsx    # Individual case study
├── components/
│   ├── audio-particles.tsx     # Audio-reactive particle system
│   ├── torus-shader.tsx        # Idle state particle visualisation
│   └── text-with-particles.tsx # Hover particle effect for text
├── hooks/
│   └── use-audio-analyzer.ts   # Web Audio API integration
└── lib/
    └── case-studies.ts         # Case study data
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Deployment

Deployed on Vercel. Push to main branch to trigger automatic deployment.
