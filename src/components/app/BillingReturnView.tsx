"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { Button, ButtonLink, Card, Spinner } from "@/components/ui";
import { InlineError } from "@/components/ErrorInfo";
import { ApiError, apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney, productLabel, type BillingOrder, type MyPlan } from "@/lib/billing";

const POLL_MS = 2000;
const POLL_FOR_MS = 60_000;

type View =
  | { kind: "missing" }
  | { kind: "processing"; order: BillingOrder | null }
  | { kind: "paid"; order: BillingOrder; proUntil: string | null }
  | { kind: "failed"; order: BillingOrder }
  | { kind: "timeout"; order: BillingOrder | null }
  | { kind: "error"; error: unknown };

function longDate(iso: string): string {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? iso : new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/** /billing/return/?order_id=…: Cashfree sends the buyer here; poll the order until it settles. */
export function BillingReturnView() {
  const { getToken } = useAuth();
  const [orderId, setOrderId] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<View>({ kind: "processing", order: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("order_id"));
  }, []);

  useEffect(() => {
    if (orderId === undefined) return;
    if (!orderId) {
      setView({ kind: "missing" });
      return;
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    setView({ kind: "processing", order: null });

    const poll = async () => {
      let order: BillingOrder | null = null;
      try {
        const token = await getToken();
        order = await apiGet<BillingOrder>(`/v1/billing/orders/${encodeURIComponent(orderId)}`, token);
        if (stopped) return;
        if (order.status === "PAID") {
          let proUntil: string | null = null;
          try {
            proUntil = (await apiGet<MyPlan>("/v1/me/plan", token)).proUntil;
          } catch {
            // The order is paid; the date is a nice-to-have.
          }
          if (!stopped) setView({ kind: "paid", order, proUntil });
          return;
        }
        if (order.status === "FAILED" || order.status === "EXPIRED") {
          setView({ kind: "failed", order });
          return;
        }
        setView({ kind: "processing", order });
      } catch (err) {
        if (stopped) return;
        // A missing order or a sign-in problem won't fix itself; network blips might.
        if (err instanceof ApiError && (err.status === 404 || err.status === 401 || err.status === 403)) {
          setView({ kind: "error", error: err });
          return;
        }
        if (Date.now() - started >= POLL_FOR_MS) {
          setView({ kind: "error", error: err });
          return;
        }
      }
      if (Date.now() - started >= POLL_FOR_MS) {
        setView({ kind: "timeout", order });
        return;
      }
      timer = setTimeout(() => void poll(), POLL_MS);
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, attempt, getToken]);

  const retry = () => setAttempt((a) => a + 1);
  const order = "order" in view ? view.order : null;

  return (
    <div className="mx-auto max-w-lg py-6">
      <Card className="p-6 text-center sm:p-8">
        {view.kind === "processing" && (
          <>
            <Spinner className="mx-auto size-8 text-bk-muted" />
            <h1 className="mt-4 text-xl font-semibold">Processing your payment…</h1>
            <p className="mt-2 text-sm text-bk-muted">This usually takes a few seconds. Keep this page open.</p>
          </>
        )}
        {view.kind === "paid" && (
          <>
            <CircleCheck className="mx-auto size-10 text-bk-ok" />
            <h1 className="mt-4 text-xl font-semibold">{view.proUntil ? `You're on Pro until ${longDate(view.proUntil)}` : "You're on Pro"}</h1>
            <p className="mt-2 text-sm text-bk-muted">Thanks for supporting BambooKit. Your phone and PCs pick up the new limits automatically.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/account/#plan" variant="primary">
                See your plan
              </ButtonLink>
              <ButtonLink href="/sessions/">Go to sessions</ButtonLink>
            </div>
          </>
        )}
        {view.kind === "failed" && (
          <>
            <CircleX className="mx-auto size-10 text-bk-err" />
            <h1 className="mt-4 text-xl font-semibold">{view.order.status === "EXPIRED" ? "The payment expired" : "The payment didn't go through"}</h1>
            <p className="mt-2 text-sm text-bk-muted">You weren&apos;t charged for this order. If money left your account, it is returned by your bank automatically.</p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/pricing/" variant="primary">
                Try again
              </ButtonLink>
            </div>
          </>
        )}
        {view.kind === "timeout" && (
          <>
            <Clock className="mx-auto size-10 text-bk-warn" />
            <h1 className="mt-4 text-xl font-semibold">Still waiting for confirmation</h1>
            <p className="mt-2 text-sm text-bk-muted">
              The payment hasn&apos;t been confirmed yet. If you paid, Pro is added as soon as Cashfree confirms it, and the{" "}
              <Link href="/account/#plan" className="underline underline-offset-2">
                Account page
              </Link>{" "}
              updates by itself.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={retry}>
                Check again
              </Button>
              <ButtonLink href="/pricing/">Back to pricing</ButtonLink>
            </div>
          </>
        )}
        {view.kind === "missing" && (
          <>
            <CircleX className="mx-auto size-10 text-bk-faint" />
            <h1 className="mt-4 text-xl font-semibold">No order to check</h1>
            <p className="mt-2 text-sm text-bk-muted">This page is opened after a payment. Your purchases are listed on the Account page.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/account/#plan" variant="primary">
                Your plan
              </ButtonLink>
              <ButtonLink href="/pricing/">Pricing</ButtonLink>
            </div>
          </>
        )}
        {view.kind === "error" && (
          <>
            <CircleX className="mx-auto size-10 text-bk-err" />
            <h1 className="mt-4 text-xl font-semibold">Couldn&apos;t check the payment</h1>
            <InlineError className="mt-4 text-left" error={view.error} onRetry={retry} />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/account/#plan">Your plan</ButtonLink>
              <ButtonLink href="/pricing/">Back to pricing</ButtonLink>
            </div>
          </>
        )}
        {order && (
          <p className="mt-6 border-t border-bk-line pt-4 text-xs text-bk-faint">
            {productLabel(order.productId)} · {formatMoney(order.amount, order.currency)} · Order <span className="font-mono">{order.id}</span>
          </p>
        )}
        {!order && orderId && view.kind !== "missing" && (
          <p className="mt-6 border-t border-bk-line pt-4 text-xs text-bk-faint">
            Order <span className="font-mono">{orderId}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
