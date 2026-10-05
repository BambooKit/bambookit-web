"use client";

import { apiGet, apiRequest } from "./api";

/** Pro passes and plan limits (GET /v1/billing/plans, GET /v1/me/plan). Payments go through Cashfree. */

export type ProductId = "pro-month" | "pro-year";
export type PlanName = "free" | "pro";

export interface BillingProduct {
  id: ProductId;
  name: string;
  /** Rupees, e.g. 199. */
  amount: number;
  currency: string;
  period: "month" | "year";
  days: number;
}

export interface PlanLimits {
  /** null means unlimited. */
  phoneMessagesPerDay: number | null;
  phoneSessionsPerDay: number | null;
  desktops: number;
}

export interface BillingPlans {
  products: BillingProduct[];
  limits: { free: PlanLimits; pro: PlanLimits };
  payments: { configured: boolean; environment: "sandbox" | "production" };
  rewards: { hours: number; maxPerDay: number };
}

export interface MyPlan {
  plan: PlanName;
  source: "payment" | "reward" | "admin" | null;
  proUntil: string | null;
  limits: PlanLimits;
  usage: { phoneMessagesToday: number; phoneSessionsToday: number; desktops: number };
  resetsAt: string | null;
  ads: boolean;
  rewards: { todayCount: number; maxPerDay: number; hours: number };
}

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface BillingOrder {
  id: string;
  status: OrderStatus;
  productId: ProductId | string;
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}

export interface CheckoutSession {
  orderId: string;
  paymentSessionId: string;
  environment: "sandbox" | "production";
  amount: number;
  currency: string;
  productId: ProductId;
}

/** Shown when the API can't be reached. Buying is disabled in that case. */
export const FALLBACK_PLANS: BillingPlans = {
  products: [
    { id: "pro-month", name: "Pro monthly", amount: 199, currency: "INR", period: "month", days: 30 },
    { id: "pro-year", name: "Pro yearly", amount: 1999, currency: "INR", period: "year", days: 365 },
  ],
  limits: {
    free: { phoneMessagesPerDay: 20, phoneSessionsPerDay: 3, desktops: 1 },
    pro: { phoneMessagesPerDay: null, phoneSessionsPerDay: null, desktops: 5 },
  },
  payments: { configured: false, environment: "production" },
  rewards: { hours: 24, maxPerDay: 2 },
};

export function fetchPlans(signal?: AbortSignal): Promise<BillingPlans> {
  return apiGet<BillingPlans>("/v1/billing/plans", null, signal);
}

export function formatMoney(amount: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function productLabel(id: string): string {
  if (id === "pro-month") return "Pro · 1 month";
  if (id === "pro-year") return "Pro · 1 year";
  return id;
}

export function sourceLabel(source: MyPlan["source"]): string {
  if (source === "payment") return "Paid pass";
  if (source === "reward") return "Rewarded ad";
  if (source === "admin") return "Granted by BambooKit";
  return "—";
}

export function limitLabel(n: number | null | undefined, unit: string): string {
  return n === null || n === undefined ? "Unlimited" : `${n} ${unit}`;
}

/** Whole months saved by the yearly pass compared with 12 monthly passes (e.g. 2). */
export function monthsFree(products: BillingProduct[]): number {
  const m = products.find((p) => p.id === "pro-month");
  const y = products.find((p) => p.id === "pro-year");
  if (!m || !y || m.amount <= 0) return 0;
  return Math.max(0, Math.round((12 * m.amount - y.amount) / m.amount));
}

/* ------------------------------------------------------------------------------ Cashfree JS SDK v3 */

const CASHFREE_SDK = "https://sdk.cashfree.com/js/v3/cashfree.js";

interface CashfreeCheckoutResult {
  error?: { message?: string; code?: string; type?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
}

interface CashfreeInstance {
  checkout(options: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement }): Promise<CashfreeCheckoutResult>;
}

type CashfreeFactory = (options: { mode: "sandbox" | "production" }) => CashfreeInstance;

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

let sdkPromise: Promise<CashfreeFactory> | null = null;

/** Load the official Cashfree checkout script once (only when someone buys). */
export function loadCashfree(): Promise<CashfreeFactory> {
  if (typeof window === "undefined") return Promise.reject(new Error("Checkout needs a browser."));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  sdkPromise ??= new Promise<CashfreeFactory>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CASHFREE_SDK;
    script.async = true;
    script.onload = () => (window.Cashfree ? resolve(window.Cashfree) : reject(new Error("The Cashfree checkout didn't load. Try again.")));
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error("The Cashfree checkout couldn't be loaded. Check your connection, or turn off a blocker for sdk.cashfree.com, and try again."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Create an order on the BambooKit API and open Cashfree checkout in this tab. Cashfree sends the
 * buyer back to /billing/return/?order_id=… afterwards. Resolves only if checkout did not navigate.
 */
export async function startCheckout(productId: ProductId, token: string | null): Promise<void> {
  const [session, factory] = await Promise.all([
    apiRequest<CheckoutSession>("POST", "/v1/billing/checkout", token, { body: { productId } }),
    loadCashfree(),
  ]);
  const cashfree = factory({ mode: session.environment === "production" ? "production" : "sandbox" });
  const result = await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: "_self" });
  if (result?.error) throw new Error(result.error.message || "Cashfree couldn't open the checkout. Try again.");
}
