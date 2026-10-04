import { Monitor, Smartphone } from "lucide-react";
import data from "@/content/screenshots.json";

export interface Screenshot {
  src: string;
  alt: string;
}

const SHOTS = data as { desktop: Screenshot[]; android: Screenshot[] };

/** True when scripts/sync-screenshots.mjs found at least one screenshot. */
export const HAS_SCREENSHOTS = SHOTS.desktop.length > 0 || SHOTS.android.length > 0;

function Row({ title, icon: Icon, shots, phone }: { title: string; icon: typeof Monitor; shots: Screenshot[]; phone: boolean }) {
  if (shots.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-lg font-medium">
        <Icon className="size-4 text-bk-muted" /> {title}
      </h3>
      <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
        {shots.map((s) => (
          <li key={s.src} className={phone ? "w-44 shrink-0 snap-start sm:w-52" : "w-[85%] shrink-0 snap-start sm:w-[34rem]"}>
            <a
              href={s.src}
              target="_blank"
              rel="noopener noreferrer"
              title={`${s.alt} (opens the full image)`}
              className={`block overflow-hidden border border-bk-line bg-bk-panel transition hover:border-bk-faint ${phone ? "rounded-[1.5rem] p-1.5" : "rounded-xl p-1"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, plain images */}
              <img src={s.src} alt={s.alt} loading="lazy" className={`block w-full bg-bk-raised ${phone ? "rounded-[1.1rem]" : "rounded-lg"}`} />
            </a>
            <p className="mt-2 text-center text-xs text-bk-muted">{s.alt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desktop and Android screenshots from src/content/screenshots.json; a platform without any is left out. */
export function Screenshots() {
  return (
    <>
      <Row title="BambooKit Desktop" icon={Monitor} shots={SHOTS.desktop} phone={false} />
      <Row title="BambooKit for Android" icon={Smartphone} shots={SHOTS.android} phone />
    </>
  );
}
