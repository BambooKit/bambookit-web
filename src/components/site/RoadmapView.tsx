import { RoadmapCheck, RoadmapGraph, RoadmapNote, type RoadmapSection } from "@/components/Roadmap";

/** The BambooKit product map, roadmap.sh style. Static content — no API. */
const SECTIONS: RoadmapSection[] = [
  {
    heading: "Get started",
    primary: { title: "Get started", status: "done", href: "/docs/quickstart/" },
    branches: [
      { title: "Install", status: "done", href: "/docs/install/" },
      { title: "Sign in", status: "done", href: "/docs/sign-in/" },
      { title: "Pair phone", status: "done", href: "/docs/pairing/" },
    ],
  },
  {
    heading: "Desktop app",
    primary: { title: "Desktop app", status: "done", href: "/docs/desktop/" },
    branches: [
      { title: "AI agent", status: "done", href: "/docs/sessions/" },
      { title: "Approvals", status: "done", href: "/docs/approvals/" },
      { title: "Approval modes", status: "done", href: "/docs/approvals/" },
      { title: "Keep awake", sub: "☕", status: "done", href: "/docs/desktop/" },
      { title: "Developer tools", sub: "Power · Terminal", status: "done", href: "/docs/terminal-git/" },
    ],
  },
  {
    heading: "Phone app",
    primary: { title: "Phone app", status: "done", href: "/docs/phone/" },
    branches: [
      { title: "Follow live", status: "done", href: "/docs/diagram/" },
      { title: "Approve & answer", status: "done", href: "/docs/approvals/" },
      { title: "Chat after Continue", status: "done", href: "/docs/sessions/" },
      { title: "Achievements", status: "done", href: "/docs/profile/" },
      { title: "Plan & ads", status: "done", href: "/docs/plans/" },
    ],
  },
  {
    heading: "Cloud",
    primary: { title: "Cloud", status: "done", href: "/docs/realtime/" },
    branches: [
      { title: "Realtime sync", status: "done", href: "/docs/realtime/" },
      { title: "Releases / auto-update", status: "done", href: "/docs/updates/" },
      { title: "Admin & Telegram", status: "done", href: "/docs/admin/" },
    ],
  },
  {
    heading: "Monetization",
    primary: { title: "Monetization", status: "done", href: "/docs/plans/" },
    branches: [
      { title: "Free / Pro", status: "done", href: "/docs/plans/" },
      { title: "Cashfree", status: "progress", href: "/docs/plans/" },
      { title: "Ads", status: "done", href: "/docs/plans/" },
      { title: "Rewarded ads", status: "done", href: "/docs/plans/" },
    ],
  },
  {
    heading: "Platforms",
    primary: { title: "Platforms", status: "progress", href: "/docs/install/" },
    branches: [
      { title: "Windows", status: "done", href: "/docs/install/" },
      { title: "Android", status: "done", href: "/docs/install/" },
      { title: "VS Code / Cursor", status: "done", href: "/docs/developers/" },
      { title: "macOS", sub: "in progress", status: "progress" },
      { title: "Linux", sub: "in progress", status: "progress" },
    ],
  },
];

function LegendItem({ status, label }: { status: "done" | "progress" | "todo"; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-bk-muted">
      <span className="relative inline-flex size-5">
        <RoadmapCheck status={status} />
      </span>
      {label}
    </span>
  );
}

export function RoadmapView() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-bk-fg sm:text-4xl">BambooKit roadmap</h1>
        <p className="mt-3 text-bk-muted">
          The whole product at a glance — from getting started to the desktop and phone apps, the cloud and the platforms
          we support. Tap any node to open its documentation.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <LegendItem status="done" label="Shipped" />
          <LegendItem status="progress" label="In progress" />
          <LegendItem status="todo" label="Planned" />
        </div>
      </header>

      <RoadmapNote className="mx-auto mt-10 max-w-xl text-center">
        Everything here runs on your PC with your phone as the remote. New to BambooKit?{" "}
        <a href="/docs/install/" className="font-medium text-bk-fg underline underline-offset-2">
          Install it
        </a>{" "}
        and follow the <strong className="text-bk-fg">Get started</strong> branch.
      </RoadmapNote>

      <div className="mt-12">
        <RoadmapGraph sections={SECTIONS} />
      </div>
    </main>
  );
}
