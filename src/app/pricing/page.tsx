import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { PricingView } from "@/components/site/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "BambooKit is free on your PC. Pro removes the phone limits, adds more PCs and turns off ads in the Android app. ₹199 a month or ₹1,999 a year.",
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <PricingView />
      <SiteFooter />
    </>
  );
}
