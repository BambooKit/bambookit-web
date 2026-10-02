"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Monitor, QrCode, Smartphone, Download } from "lucide-react";
import { CodeBlock } from "@/components/site/CodeBlock";
import { ButtonLink, Card, ErrorState, Notice, OnlineDot, Spinner, cx } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useLiveDevices } from "@/lib/live";
import { INSTALL_COMMAND, LINKS } from "@/lib/config";

function Step({ n, title, done, waiting, icon, children }: { n: number; title: string; done: boolean; waiting?: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className={cx("p-5 sm:p-6", done && "border-bk-ok/30")}>
      <div className="flex items-start gap-4">
        <div
          className={cx(
            "grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold",
            done ? "border-bk-ok/40 bg-bk-ok/10 text-bk-ok" : "border-bk-line bg-bk-raised text-bk-muted",
          )}
        >
          {done ? <Check className="size-4" /> : n}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-bk-faint">{icon}</span>
            <h2 className="font-medium">{title}</h2>
            {done ? (
              <span className="text-xs text-bk-ok">Done</span>
            ) : waiting ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-bk-muted">
                <Spinner className="size-3" /> Waiting…
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-bk-muted">{children}</div>
        </div>
      </div>
    </Card>
  );
}

export function WelcomeView() {
  const { user } = useAuth();
  const devices = useLiveDevices();
  const desktops = (devices.data ?? []).filter((d) => d.kind === "desktop");
  const mobiles = (devices.data ?? []).filter((d) => d.kind === "mobile");
  const hasPc = desktops.length > 0;
  const hasPhone = mobiles.length > 0 || desktops.some((d) => d.linkedDevices.some((l) => l.kind === "mobile"));
  const loaded = !!devices.data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-wider text-bk-faint">Welcome</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Set up BambooKit</h1>
        <p className="mt-2 text-bk-muted">
          The agent runs on your Windows PC, and your sessions are stored there. Connect your PC once and you can follow every session from
          here and from your phone.
        </p>
      </div>

      {devices.error && !devices.data && <ErrorState message={devices.error.message} onRetry={devices.reload} />}

      {hasPc && (
        <Notice tone="ok" className="mb-6" icon={<Check className="size-4" />}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Your PC is connected: <span className="font-medium">{desktops.map((d) => d.name).join(", ")}</span>
            </span>
            <ButtonLink href="/sessions/" variant="primary" className="px-3 py-1.5">
              Go to sessions <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </Notice>
      )}

      <div className="space-y-4">
        <Step n={1} title="Install BambooKit Desktop" done={hasPc} icon={<Download className="size-4" />}>
          <p>On your Windows 10 or 11 (64-bit) PC, open PowerShell and run:</p>
          <CodeBlock code={INSTALL_COMMAND} />
          <p className="text-xs text-bk-faint">
            It downloads the latest installer from the{" "}
            <a href={LINKS.releases} className="underline underline-offset-2 hover:text-bk-fg" rel="noopener noreferrer">
              releases page
            </a>{" "}
            and runs it. More options in the <Link href="/docs/install/" className="underline underline-offset-2 hover:text-bk-fg">install guide</Link>.
          </p>
        </Step>

        <Step n={2} title="Sign in on your PC" done={hasPc} waiting={loaded && !hasPc} icon={<Monitor className="size-4" />}>
          <p>
            Open BambooKit Desktop and sign in with the same account you use here
            {user?.email ? (
              <>
                {" "}(<span className="text-bk-fg">{user.email}</span>)
              </>
            ) : null}
            {user?.provider === "google" ? " using Google" : ""}. This page updates by itself when your PC connects.
          </p>
          {hasPc && (
            <ul className="mt-3 space-y-1.5">
              {desktops.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-bk-fg">
                  <OnlineDot online={d.online} /> {d.name}
                  <span className="text-xs text-bk-faint">{d.online ? "online" : "offline"}</span>
                </li>
              ))}
            </ul>
          )}
        </Step>

        <Step n={3} title="Pair your phone (optional)" done={hasPhone} waiting={hasPc && !hasPhone} icon={<Smartphone className="size-4" />}>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Install the BambooKit Android app from the{" "}
              <a href={LINKS.releases} className="underline underline-offset-2 hover:text-bk-fg" rel="noopener noreferrer">
                releases page
              </a>{" "}
              and sign in with the same account.
            </li>
            <li>
              In BambooKit Desktop: <span className="text-bk-fg">BambooKit</span> menu → <span className="text-bk-fg">Add mobile device</span>.
            </li>
            <li>
              In the app: <span className="inline-flex items-center gap-1 text-bk-fg"><QrCode className="size-3.5" /> scan the QR code</span>. It works once and
              expires after two minutes.
            </li>
          </ol>
          {hasPhone && <p className="mt-3 text-bk-fg">Phone paired: {mobiles.map((m) => m.name).join(", ") || "yes"}</p>}
        </Step>
      </div>

      <p className="mt-8 text-center text-xs text-bk-faint">
        Sessions stay on your PC. BambooKit Cloud keeps only a small index (titles, status, times) and relays chats live while your PC is online.
      </p>
    </div>
  );
}
