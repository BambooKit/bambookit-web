import Link from "next/link";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

/** Shared roadmap.sh-style map primitives, used by the public /roadmap page and the
 *  in-app session map. Colors come from the bk-rm-* theme tokens (globals.css). */

export type RoadmapStatus = "done" | "progress" | "todo";
export type RoadmapRole = "primary" | "secondary" | "neutral";

const ROLE_BOX: Record<RoadmapRole, string> = {
  primary: "bg-bk-rm-primary-bg border-bk-rm-primary-border text-bk-rm-primary-fg",
  secondary: "bg-bk-rm-secondary-bg border-bk-rm-secondary-border text-bk-rm-secondary-fg",
  neutral: "bg-bk-rm-neutral-bg border-bk-rm-neutral-border text-bk-rm-neutral-fg",
};

/** Small check circle shown at a node's top-right: done, in-progress or planned. */
export function RoadmapCheck({ status, className }: { status: RoadmapStatus; className?: string }) {
  const base = "inline-flex size-5 items-center justify-center rounded-full border-2";
  if (status === "done") {
    return (
      <span className={cx(base, "border-bk-rm-done bg-bk-rm-done text-bk-bg", className)} aria-label="Shipped" title="Shipped">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "progress") {
    return (
      <span className={cx(base, "border-bk-rm-progress bg-bk-rm-progress text-bk-bg", className)} aria-label="In progress" title="In progress">
        <Minus className="size-3" strokeWidth={3} />
      </span>
    );
  }
  return <span className={cx(base, "border-bk-rm-todo bg-transparent", className)} aria-label="Planned" title="Planned" />;
}

export interface RoadmapNodeProps {
  role?: RoadmapRole;
  status?: RoadmapStatus;
  title: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** A single rounded node with an optional status check. Links where `href` is set. */
export function RoadmapNode({ role = "secondary", status, title, sub, icon, href, onClick, className }: RoadmapNodeProps) {
  const interactive = !!href || !!onClick;
  const box = cx(
    "relative block rounded-lg border-2 px-4 py-2.5 text-center text-sm font-medium transition",
    ROLE_BOX[role],
    status === "done" && "opacity-90",
    interactive && "hover:-translate-y-px hover:shadow-sm",
    className,
  );
  const inner = (
    <>
      {status && <RoadmapCheck status={status} className="absolute -right-2 -top-2" />}
      <span className="inline-flex items-center justify-center gap-1.5 leading-tight">
        {icon}
        <span>{title}</span>
      </span>
      {sub && <span className="mt-0.5 block text-[11px] font-normal opacity-80">{sub}</span>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={box}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={box}>
        {inner}
      </button>
    );
  }
  return <div className={box}>{inner}</div>;
}

/** Connector lines. Solid = main spine; dashed = branch off the spine. */
export function RoadmapLine({ variant = "solid", className }: { variant?: "solid" | "dashed"; className?: string }) {
  if (variant === "dashed") {
    return <span aria-hidden className={cx("block w-0 border-l-2 border-dashed border-bk-rm-line", className)} />;
  }
  return <span aria-hidden className={cx("block w-0.5 bg-bk-rm-line", className)} />;
}

/** A neutral "tip" card, like roadmap.sh's side notes. */
export function RoadmapNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-lg border-2 border-bk-rm-neutral-border bg-bk-rm-neutral-bg px-4 py-3 text-sm text-bk-muted", className)}>
      {children}
    </div>
  );
}

export interface RoadmapItem {
  title: string;
  status?: RoadmapStatus;
  href?: string;
  sub?: string;
}

export interface RoadmapSection {
  heading: string;
  primary: RoadmapItem;
  branches?: RoadmapItem[];
}

/** The full product map: a central solid spine of primary nodes with dashed branches. */
export function RoadmapGraph({ sections }: { sections: RoadmapSection[] }) {
  return (
    <div className="flex flex-col items-center">
      {sections.map((section, i) => (
        <div key={section.heading} className="flex w-full flex-col items-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-bk-muted">{section.heading}</div>
          <RoadmapNode
            role="primary"
            status={section.primary.status}
            title={section.primary.title}
            sub={section.primary.sub}
            href={section.primary.href}
            className="min-w-[13rem]"
          />
          {section.branches && section.branches.length > 0 && (
            <>
              <RoadmapLine variant="dashed" className="h-5" />
              <div className="flex max-w-3xl flex-wrap justify-center gap-3 px-1">
                {section.branches.map((b) => (
                  <RoadmapNode
                    key={b.title}
                    role="secondary"
                    status={b.status}
                    title={b.title}
                    sub={b.sub}
                    href={b.href}
                    className="min-w-[8.5rem] flex-1 basis-[8.5rem] sm:flex-none"
                  />
                ))}
              </div>
            </>
          )}
          {i < sections.length - 1 && <RoadmapLine variant="solid" className="my-5 h-9" />}
        </div>
      ))}
    </div>
  );
}
