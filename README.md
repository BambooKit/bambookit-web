# BambooKit Web — Developer Control Plane

Production web application and developer SaaS console for **BambooKit** — the AI Agent Control Plane and persistent software engineering environment.

## Overview

BambooKit provides orchestration, security boundaries, persistent state, permissions, and human approval gates for autonomous AI software engineers.

Developers can supervise coding agents from anywhere (Web Console, Android Phone, Desktop Connector) without keeping their workstation online or exposing unprotected network ports.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19, Tailwind CSS 4, Lucide React
- **Language**: TypeScript (strict mode)
- **Architecture**: Domain-Driven Design with abstract Service interfaces (`IProjectService`, `IAgentService`, `IApprovalService`, etc.)
- **Testing**: Vitest

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Verify Code Quality
```bash
# Typecheck
npm run typecheck

# Unit Tests
npm test

# Production Build
npm run build
```

---

## Architecture & Service Abstraction

The frontend does not hardcode data directly into UI components. All domain operations pass through interface contracts:

```
src/
├── app/                  # Next.js App Router (Public & SaaS Console routes)
├── components/           # Reusable UI & Feature components
│   ├── agent/            # Agent Workspace & AgentReplay timeline
│   ├── approvals/        # Dangerous action review cards
│   ├── diff/             # Unified / Split code diff viewer
│   ├── layout/           # AppShell, Navbar, Footer, HeroSimulator
│   ├── terminal/         # Interactive cloud worker PTY simulation
│   └── ui/               # Core design system (Button, Badge, Card)
├── config/               # Centralized pricing & default permission policies
├── data/                 # Coherent mock datasets for demo workspace
├── lib/                  # Utilities & formatting functions
├── services/             # Abstract interfaces & Mock service implementation
└── types/                # Strongly-typed domain models
```

When the future `bambookit-api` backend is connected, mock implementations in `src/services/mockServices.ts` can be cleanly swapped with live API clients without rewriting user interface components.

---

## License

© 2026 BambooKit Inc. All rights reserved.
