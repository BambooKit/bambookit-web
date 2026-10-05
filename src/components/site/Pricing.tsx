"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Clock, Minus, PlayCircle, Sparkles } from "lucide-react";
import { Button, Notice, Pill, Spinner } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { ApiError, apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LINKS } from "@/lib/config";
import {
  FALLBACK_PLANS,
  fetchPlans,
  formatMoney,
  limitLabel,
  monthsFree,
  startCheckout,
  type BillingPlans,
  type BillingProduct,
  type MyPlan,
  type ProductId,
} from "@/lib/billing";

type Cell = boolean | string;

function rows(plans: BillingPlans): Array<{ label: string; free: Cell; pro: Cell }> {
  const { free, pro } = plans.limits;
  return [
    { label: "BambooKit Desktop agent with your own API keys", free: true, pro: true },
    { label: "Free BambooKit models", free: true, pro: true },
    { label: "Follow sessions, approve and answer questions from your phone", free: true, pro: true },
    { label: "Chat from your phone", free: limitLabel(free.phoneMessagesPerDay, "messages / day"), pro: limitLabel(pro.phoneMessagesPerDay, "messages / day") },
    { label: "New sessions from your phone", free: limitLabel(free.phoneSessionsPerDay, "/ day"), pro: limitLabel(pro.phoneSessionsPerDay, "/ day") },
    { label: "PCs per account", free: String(free.desktops), pro: String(pro.desktops) },
    { label: "Ads in the Android app", free: "Yes", pro: "None" },
    { label: "Priority support", free: false, pro: true },
  ];
}

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto size-4 text-bk-ok" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-bk-faint" aria-label="Not included" />;
  return <span>{value}</span>;
}

const FAQ: Array<{ q: string; a: ReactNode }> = [
  {
    q: "Can I cancel anytime?",
    a: (
      <>
        Yes. Pro is a monthly or yearly pass, not a subscription: passes don&apos;t renew automatically yet, so there is nothing to cancel. When your pass ends you go
        back to Free. To keep Pro, buy another pass; it extends the one you have.
      </>
    ),
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        If something went wrong with a payment, contact us through{" "}
        <a href={LINKS.discussions} className="text-bk-fg underline underline-offset-2" rel="noopener noreferrer">
          GitHub Discussions
        </a>{" "}
        (the Support link in the footer) with your order ID from the Account page, and we&apos;ll sort it out.
      </>
    ),
  },
  {
    q: "Who processes payments?",
    a: <>Payments are processed by Cashfree Payments. You can pay with UPI, cards or netbanking. BambooKit never sees or stores your card or UPI details.</>,
  },
  {
    q: "Which currency are prices in?",
    a: <>Prices are in Indian rupees (INR) and include taxes as applicable.</>,
  },
  {
    q: "What stays free?",
    a: (
      <>
        Everything on your PC: the Desktop agent, your own API keys and the free BambooKit models. On the phone you can always follow sessions, approve and
        answer questions. Free limits only apply to chatting and starting new sessions from the phone, and to the number of PCs.
      </>
    ),
  },
];

function friendlyBuyError(err: unknown): string | null {
  if (err instanceof ApiError && err.code === "PAYMENTS_NOT_CONFIGURED") return "Payments are being set up — coming soon. Nothing was charged.";
  return null;
}

export function PricingView() {
  const { status, getToken } = useAuth();
  const [plans, setPlans] = useState<BillingPlans>(FALLBACK_PLANS);
  const [loaded, setLoaded] = useState<"loading" | "ok" | "failed">("loading");
  const [plansError, setPlansError] = useState<unknown>(null);
  const [myPlan, setMyPlan] = useState<MyPlan | null>(null);
  const [busy, setBusy] = useState<ProductId | null>(null);
  const [buyError, setBuyError] = useState<unknown>(null);
  const autoBuy = useRef(false);

  const load = useCallback(() => {
    const ctrl = new AbortController();
    setLoaded("loading");
    fetchPlans(ctrl.signal)
      .then((p) => {
        setPlans({ ...FALLBACK_PLANS, ...p, products: p.products?.length ? p.products : FALLBACK_PLANS.products });
        setPlansError(null);
        setLoaded("ok");
      })
      .catch((err) => {
        if ((err as Error)?.name === "AbortError") return;
        setPlans(FALLBACK_PLANS);
        setPlansError(err);
        setLoaded("failed");
      });
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => {
    if (status !== "signedIn") {
      setMyPlan(null);
      return;
    }
    const ctrl = new AbortController();
    void (async () => {
      try {
        setMyPlan(await apiGet<MyPlan>("/v1/me/plan", await getToken(), ctrl.signal));
      } catch {
        // Optional: the page works without the current plan.
      }
    })();
    return () => ctrl.abort();
  }, [status, getToken]);

  const canBuy = loaded === "ok" && plans.payments.configured;

  const buy = useCallback(
    async (productId: ProductId) => {
      setBuyError(null);
      if (status !== "signedIn") {
        window.location.assign(`/signin/?next=${encodeURIComponent(`/pricing/?buy=${productId}`)}`);
        return;
      }
      setBusy(productId);
      try {
        await startCheckout(productId, await getToken());
        // Checkout replaces this page; if it didn't, let the buyer try again.
        setBusy(null);
      } catch (err) {
        setBuyError(err);
        setBusy(null);
      }
    },
    [status, getToken],
  );

  // Back from sign-in with ?buy=…: continue to checkout once.
  useEffect(() => {
    if (autoBuy.current || status !== "signedIn" || !canBuy) return;
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("buy");
    if (wanted !== "pro-month" && wanted !== "pro-year") return;
    autoBuy.current = true;
    window.history.replaceState(null, "", "/pricing/");
    void buy(wanted);
  }, [status, canBuy, buy]);

  const month = plans.products.find((p) => p.id === "pro-month");
  const year = plans.products.find((p) => p.id === "pro-year");
  const saved = monthsFree(plans.products);
  const isPro = myPlan?.plan === "pro";
  const proUntil = myPlan?.proUntil ? new Date(myPlan.proUntil).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;

  const buyButton = (product: BillingProduct | undefined, primary: boolean) => {
    if (!product) return null;
    const label = status !== "signedIn" ? "Sign in to get Pro" : isPro ? "Extend Pro" : "Get Pro";
    return (
      <Button
        variant={primary ? "primary" : "secondary"}
        className="w-full"
        disabled={!canBuy || busy !== null || status === "loading"}
        onClick={() => void buy(product.id)}
      >
        {busy === product.id ? <Spinner /> : <Sparkles className="size-4" />} {busy === product.id ? "Opening checkout…" : label}
      </Button>
    );
  };

  return (
    <main>
      <section className="bk-glow">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-2xl text-lg text-bk-muted">
            BambooKit is free to use on your PC. Pro removes the limits on your phone, adds more PCs and turns off ads in the Android app.
          </p>
          {isPro && (
            <Notice tone="ok" className="mt-6 max-w-2xl" icon={<Check className="size-4" />}>
              You&apos;re on Pro{proUntil ? ` until ${proUntil}` : ""}. Buying another pass extends it.{" "}
              <Link href="/account/#plan" className="underline underline-offset-2">
                See your plan
              </Link>
            </Notice>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        {loaded === "ok" && !plans.payments.configured && (
          <Notice tone="warn" className="mb-6" icon={<Clock className="size-4" />}>
            Payments are being set up — coming soon.
          </Notice>
        )}
        {loaded === "failed" && (
          <InlineError
            className="mb-6"
            error={plansError}
            message="Couldn't reach the BambooKit service, so buying is turned off for now. Prices below may be out of date."
            onRetry={load}
          />
        )}
        {buyError !== null && <InlineError className="mb-6" error={buyError} message={friendlyBuyError(buyError) ?? undefined} />}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-bk-line bg-bk-panel p-6">
            <h2 className="font-medium">Free</h2>
            <div className="mt-3 text-3xl font-semibold">{formatMoney(0)}</div>
            <p className="mt-1 text-sm text-bk-muted">Forever. The full Desktop agent and the phone remote.</p>
            <Link href="/#install" className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-bk-line px-4 py-2 text-sm font-medium text-bk-fg hover:bg-bk-raised">
              Download
            </Link>
          </div>
          <div className="rounded-2xl border border-bk-line bg-bk-panel p-6">
            <h2 className="font-medium">Pro monthly</h2>
            <div className="mt-3 text-3xl font-semibold">
              {formatMoney(month?.amount ?? 199, month?.currency)}
              <span className="text-base font-normal text-bk-muted"> / month</span>
            </div>
            <p className="mt-1 text-sm text-bk-muted">A {month?.days ?? 30}-day pass. Renew when you like.</p>
            <div className="mt-6">{buyButton(month, false)}</div>
          </div>
          <div className="bk-glow rounded-2xl border border-bk-accent/40 bg-bk-panel p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium">Pro yearly</h2>
              {saved > 0 && <Pill tone="ok">{saved} months free</Pill>}
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {formatMoney(year?.amount ?? 1999, year?.currency)}
              <span className="text-base font-normal text-bk-muted"> / year</span>
            </div>
            <p className="mt-1 text-sm text-bk-muted">A {year?.days ?? 365}-day pass. Best value.</p>
            <div className="mt-6">{buyButton(year, true)}</div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-bk-line bg-bk-panel/60 px-4 py-3 text-sm text-bk-muted">
          <PlayCircle className="mt-0.5 size-4 shrink-0 text-bk-fg" />
          <span>
            On Android, watch a short ad to get {plans.rewards.hours} h of Pro (up to {plans.rewards.maxPerDay} per day).
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Compare plans</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-bk-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-bk-line bg-bk-panel text-left">
                <th className="px-4 py-3 font-medium text-bk-fg">Feature</th>
                <th className="w-32 px-4 py-3 text-center font-medium text-bk-fg">Free</th>
                <th className="w-32 px-4 py-3 text-center font-medium text-bk-fg">Pro</th>
              </tr>
            </thead>
            <tbody>
              {rows(plans).map((r) => (
                <tr key={r.label} className="border-b border-bk-line last:border-0">
                  <td className="px-4 py-3 text-bk-muted">{r.label}</td>
                  <td className="px-4 py-3 text-center text-bk-muted">
                    <CellValue value={r.free} />
                  </td>
                  <td className="px-4 py-3 text-center text-bk-fg">
                    <CellValue value={r.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-bk-faint">
          Daily limits reset every day. Free accounts see ads only in the Android app; Desktop and this website have no ads. See{" "}
          <Link href="/docs/plans/" className="underline underline-offset-2 hover:text-bk-fg">
            Plans and billing
          </Link>
          .
        </p>
      </section>

      <section className="border-t border-bk-line bg-bk-panel/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <dl className="mt-6 divide-y divide-bk-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-medium text-bk-fg">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-bk-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
