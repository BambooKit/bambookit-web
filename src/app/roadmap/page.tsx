import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { RoadmapView } from "@/components/site/RoadmapView";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "A map of BambooKit: getting started, the desktop and phone apps, the cloud, monetization and the platforms we support — with what's shipped and what's in progress.",
};

export default function RoadmapPage() {
  return (
    <>
      <SiteHeader />
      <RoadmapView />
      <SiteFooter />
    </>
  );
}
