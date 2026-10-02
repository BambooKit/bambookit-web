import Link from "next/link";
import { SiteFooter, SiteHeader, LINKS } from "@/components/site/Chrome";
import { CodeBlock } from "@/components/site/CodeBlock";

const FEATURES = [
  { title: "A full AI coding workspace", body: "Chat with agents, edit and review files, read diffs, run the terminal, use Git, MCP servers and tools — all on your own PC." },
  { title: "Free models included", body: "Start with the free BambooKit models, or connect your own keys for OpenAI, Anthropic, Google, OpenRouter, local Ollama and more." },
  { title: "Your phone is the remote", body: "See live sessions, chat with the agent, watch tool calls and changed files, open diffs, and stop, continue or retry — from Android." },
  { title: "Approvals where you are", body: "When the agent wants to run a command or edit a file, the request reaches your phone. Approve once, always, or reject." },
  { title: "One scan to pair", body: "Pair a phone by scanning a single-use QR code that expires in two minutes. No codes to type, no passwords in the QR." },
  { title: "Local first", body: "Your code stays on your PC. The agent runs locally; the cloud only relays the session metadata your phone needs." },
];

const STEPS = [
  { n: "1", title: "Install on Windows", body: "Run the installer and sign in with email or Google." },
  { n: "2", title: "Open a project", body: "Pick a folder and start chatting with an agent. It edits files, runs tests and uses Git." },
  { n: "3", title: "Pair your phone", body: "BambooKit chip → Add mobile device, then scan the QR code with the Android app." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-28">
          <img src="/logo-mark.png" alt="" width={88} height={88} className="-ml-2" />
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            AI coding on your PC.
            <br />
            <span className="text-bk-muted">Controlled from your phone.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-bk-muted">
            BambooKit is an AI software-engineering workspace for Windows with a companion Android app. Let an agent work on your
            project, then follow along, approve actions and steer it from anywhere.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#install" className="rounded-md bg-bk-fg px-5 py-2.5 text-sm font-medium text-bk-bg hover:opacity-90">
              Install for Windows
            </a>
            <Link href="/docs" className="rounded-md border border-bk-line px-5 py-2.5 text-sm font-medium text-bk-fg hover:bg-bk-raised">
              Read the docs
            </Link>
          </div>
        </section>

        <section className="border-y border-bk-line bg-bk-panel/40">
          <div className="mx-auto grid max-w-6xl gap-px px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5">
                <h3 className="font-medium text-bk-fg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bk-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="install" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <h2 className="text-2xl font-semibold">Install</h2>
          <p className="mt-2 max-w-2xl text-bk-muted">Windows 10 or 11, 64-bit. Run in PowerShell:</p>
          <CodeBlock code={`irm https://bambookit-web.onrender.com/install.ps1 | iex`} />
          <p className="text-sm text-bk-faint">
            Downloads the latest BambooKit Desktop installer from the{" "}
            <a href={LINKS.releases} className="underline underline-offset-2 hover:text-bk-fg">releases page</a> and runs it. Prefer to
            build it yourself? See <Link href="/docs/install#from-source" className="underline underline-offset-2 hover:text-bk-fg">install from source</Link>.
          </p>

          <h3 className="mt-10 text-lg font-medium">Android</h3>
          <p className="mt-2 max-w-2xl text-bk-muted">
            Install the BambooKit APK on your phone from the{" "}
            <a href={LINKS.releases} className="underline underline-offset-2 hover:text-bk-fg">releases page</a>, sign in with the same account,
            and scan the QR code shown on your PC.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-lg border border-bk-line p-5">
                <span className="font-mono text-sm text-bk-faint">{s.n}</span>
                <h3 className="mt-2 font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-bk-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
