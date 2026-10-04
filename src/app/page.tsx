import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Cloud, HardDrive, KeyRound, Monitor, QrCode, ShieldCheck, Smartphone, Sparkles, Terminal } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { CodeBlock } from "@/components/site/CodeBlock";
import { DownloadButton, LatestReleases } from "@/components/Releases";
import { HAS_SCREENSHOTS, Screenshots } from "@/components/site/Screenshots";
import { INSTALL_COMMAND, LINKS } from "@/lib/config";

const PRODUCTS = [
  {
    icon: Monitor,
    name: "BambooKit Desktop",
    tag: "Windows",
    body: "A full AI coding workspace on your PC. Chat with agents that edit files, run commands and tests, and use Git, MCP servers and tools. Every change is shown as a diff you can review or revert.",
    points: ["Free BambooKit models included", "Or bring your own OpenAI, Anthropic, Google, OpenRouter or Ollama keys", "Sessions and chats stored on your PC"],
  },
  {
    icon: Smartphone,
    name: "BambooKit for Android",
    tag: "Remote",
    body: "Your phone is the remote. See your PCs and every session, follow chats, todos and tool calls live, check changed files and answer the agent's approvals and questions from anywhere.",
    points: ["Live sessions, todos, diagram and full diffs", "Approve commands and edits, answer the agent's questions", "Chat and pick the model after you continue a session on your PC"],
  },
];

const STEPS = [
  { icon: Terminal, title: "Install and sign in", body: "Download the Windows installer (or run the one-line installer) and sign in to BambooKit Desktop with your account." },
  { icon: Sparkles, title: "Work with the agent", body: "Open a project folder and start a session. The agent edits, runs and tests while you review every change." },
  { icon: QrCode, title: "Pair your phone", body: "In Desktop choose BambooKit → Add mobile device and scan the QR code with the Android app." },
];

const PRIVACY = [
  "Chats, tool output and file changes are stored only on your PC.",
  "BambooKit Cloud keeps a small index (session titles, status, project, times) and pending approvals.",
  "When your phone or this site opens a chat, it is read live from your PC. If the PC is offline, there is nothing to show.",
  "Model keys and model traffic never leave your PC.",
];

const WINDOWS_STEPS: ReactNode[] = [
  <>Download and run the installer, or run the PowerShell line above, which downloads and starts it for you.</>,
  <>
    Windows SmartScreen may say <span className="text-bk-fg">Windows protected your PC</span> because the installer is not code-signed yet. Choose{" "}
    <span className="text-bk-fg">More info → Run anyway</span>.
  </>,
  <>Open BambooKit from the Start menu and sign in, or create an account.</>,
  <>
    Choose <span className="text-bk-fg">Add project</span> (<span className="font-mono">Ctrl+O</span>), pick a project folder and start a session.
  </>,
  <>
    Optional: the <span className="text-bk-fg">☕ keep-awake</span> button next to the update button keeps the PC awake while agents run, until you click it
    again or close the window.
  </>,
];

const ANDROID_STEPS: ReactNode[] = [
  <>Download the APK on your phone with the button above and open it.</>,
  <>
    When Android asks, allow <span className="text-bk-fg">Install unknown apps</span> for your browser, then go back.
  </>,
  <>
    Tap <span className="text-bk-fg">Install</span> and open BambooKit.
  </>,
  <>Sign in with the same account you use on your PC.</>,
  <>
    On the PC choose <span className="text-bk-fg">BambooKit → Add mobile device</span> and scan the QR code with the app.
  </>,
];

function InstallSteps({ steps }: { steps: ReactNode[] }) {
  return (
    <ol className="mt-5 space-y-2.5 text-sm text-bk-muted">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-mono text-bk-faint">{i + 1}</span>
          <span className="min-w-0">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Flow() {
  const box = "rounded-xl border border-bk-line bg-bk-panel/90 p-4";
  return (
    <div className="bk-grid relative rounded-2xl border border-bk-line p-4 sm:p-6">
      <div className={box}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Monitor className="size-4 text-bk-muted" /> Your PC
        </div>
        <ul className="mt-2 space-y-1 text-xs text-bk-muted">
          <li className="flex items-center gap-1.5"><HardDrive className="size-3.5 text-bk-faint" /> Sessions, chats and code live here</li>
          <li className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-bk-faint" /> The agent runs here</li>
        </ul>
      </div>
      <div className="flex justify-center py-2 text-bk-faint">
        <span className="h-6 w-px bg-bk-line" />
      </div>
      <div className={box}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Cloud className="size-4 text-bk-muted" /> BambooKit Cloud
        </div>
        <p className="mt-2 text-xs text-bk-muted">Sign-in, pairing, a small session index and approvals. Relays chats live.</p>
      </div>
      <div className="flex justify-center py-2 text-bk-faint">
        <span className="h-6 w-px bg-bk-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={box}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="size-4 text-bk-muted" /> Phone
          </div>
          <p className="mt-2 text-xs text-bk-muted">Follow, approve, continue</p>
        </div>
        <div className={box}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-bk-muted" /> Web
          </div>
          <p className="mt-2 text-xs text-bk-muted">View sessions and chats</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bk-glow">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-bk-line bg-bk-panel px-3 py-1 text-xs text-bk-muted">
                <span className="size-1.5 rounded-full bg-bk-ok" /> Windows desktop app · Android remote
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                AI coding on your PC.
                <br />
                <span className="text-bk-muted">Follow it from anywhere.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-bk-muted">
                BambooKit is an AI coding agent for Windows with your phone as the remote. The agent works on your project on your PC, your sessions stay
                there, and you can check in, review changes and answer its questions from your phone.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <DownloadButton platform="windows" />
                <DownloadButton platform="android" label="Download for Android" primary={false} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <a href="#install" className="inline-flex items-center gap-1.5 font-medium text-bk-muted hover:text-bk-fg">
                  Installation guide <ArrowRight className="size-4" />
                </a>
                <Link href="/signin/" className="font-medium text-bk-muted hover:text-bk-fg">
                  Sign in
                </Link>
                <Link href="/docs/" className="font-medium text-bk-muted hover:text-bk-fg">
                  Read the docs
                </Link>
              </div>
            </div>
            <div className="min-w-0">
              <Flow />
            </div>
          </div>
        </section>

        <section className="border-y border-bk-line bg-bk-panel/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">One agent, two screens</h2>
            <p className="mt-2 max-w-2xl text-bk-muted">The work happens on your PC. Your phone, and this website, let you keep an eye on it.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {PRODUCTS.map((p) => (
                <div key={p.name} className="rounded-2xl border border-bk-line bg-bk-bg p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg border border-bk-line bg-bk-raised">
                      <p.icon className="size-5 text-bk-fg" />
                    </div>
                    <div>
                      <h3 className="font-medium">{p.name}</h3>
                      <div className="text-xs text-bk-faint">{p.tag}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-bk-muted">{p.body}</p>
                  <ul className="mt-4 space-y-2">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm text-bk-muted">
                        <Check className="mt-0.5 size-4 shrink-0 text-bk-ok" /> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-bk-line bg-bk-panel p-6">
                <div className="flex items-center justify-between">
                  <s.icon className="size-5 text-bk-muted" />
                  <span className="font-mono text-xs text-bk-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-bk-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {HAS_SCREENSHOTS && (
          <section id="screenshots" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">See it in action</h2>
            <p className="mt-2 max-w-2xl text-bk-muted">BambooKit Desktop on Windows and the Android remote. Click a screenshot to open it full size.</p>
            <Screenshots />
          </section>
        )}

        <section id="install" className="scroll-mt-20 border-y border-bk-line bg-bk-panel/40">
          <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Download and install</h2>
            <p className="mt-2 max-w-2xl text-bk-muted">Install BambooKit Desktop on your PC first, then the Android app on your phone. Both are free.</p>
            <p className="mt-3 text-sm text-bk-faint">
              System requirements: <span className="text-bk-muted">Windows 10 or 11, 64-bit</span> · <span className="text-bk-muted">Android 8.0 or newer</span> · an
              internet connection on both.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-bk-line bg-bk-bg p-6">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Monitor className="size-5 text-bk-muted" /> Windows
              </h3>
              <div className="mt-4">
                <DownloadButton platform="windows" label="Download BambooKit-Setup .exe" />
              </div>
              <p className="mt-4 text-sm text-bk-muted">Or open PowerShell and run:</p>
              <CodeBlock code={INSTALL_COMMAND} />
              <InstallSteps steps={WINDOWS_STEPS} />
              <p className="mt-4 text-xs text-bk-faint">
                All versions are on the{" "}
                <a href={LINKS.releases} className="underline underline-offset-2 hover:text-bk-fg" rel="noopener noreferrer">
                  releases page
                </a>
                . Prefer to build it yourself? See{" "}
                <Link href="/docs/install/#from-source" className="underline underline-offset-2 hover:text-bk-fg">
                  install from source
                </Link>
                .
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-bk-line bg-bk-bg p-6">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Smartphone className="size-5 text-bk-muted" /> Android
              </h3>
              <div className="mt-4">
                <DownloadButton platform="android" label="Download BambooKit .apk" />
              </div>
              <InstallSteps steps={ANDROID_STEPS} />
              <p className="mt-4 text-xs text-bk-faint">
                All versions are on the{" "}
                <a href={LINKS.androidReleases} className="underline underline-offset-2 hover:text-bk-fg" rel="noopener noreferrer">
                  Android releases page
                </a>
                . Stuck? See{" "}
                <Link href="/docs/install-help/" className="underline underline-offset-2 hover:text-bk-fg">
                  install and connection help
                </Link>
                .
              </p>
            </div>
          </div>
          <div id="downloads" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6">
            <h3 className="text-lg font-medium">Latest versions</h3>
            <p className="mt-1 text-sm text-bk-muted">Download the newest release directly, with its release notes.</p>
            <LatestReleases className="mt-4" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <div className="grid size-11 place-items-center rounded-xl border border-bk-line bg-bk-panel">
                <KeyRound className="size-5 text-bk-fg" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Your sessions stay on your PC</h2>
              <p className="mt-2 text-bk-muted">
                BambooKit is built so the cloud only knows what it needs to connect your devices.{" "}
                <Link href="/docs/how-it-works/" className="underline underline-offset-2 hover:text-bk-fg">
                  How it works
                </Link>
              </p>
            </div>
            <ul className="space-y-3">
              {PRIVACY.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-xl border border-bk-line bg-bk-panel px-4 py-3 text-sm text-bk-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bk-ok" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="bk-glow flex flex-col items-start gap-5 rounded-2xl border border-bk-line bg-bk-panel p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Already using BambooKit Desktop?</h2>
              <p className="mt-1 text-sm text-bk-muted">Sign in to see your PCs and follow every session live.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signin/" className="inline-flex items-center gap-2 rounded-lg bg-bk-accent px-5 py-2.5 text-sm font-medium text-bk-bg hover:opacity-90">
                Sign in <ArrowRight className="size-4" />
              </Link>
              <Link href="/docs/" className="rounded-lg border border-bk-line px-5 py-2.5 text-sm font-medium text-bk-fg hover:bg-bk-raised">
                Docs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
