import { TextPage } from "@/components/site/TextPage";

export const metadata = { title: "Refund and cancellation policy" };

const BODY = `
## Cancellation

BambooKit Pro is a prepaid pass for one month or one year. It does not renew automatically, so there is no subscription to cancel. When the pass ends, your account returns to the free plan and nothing else is charged.

## Refunds

- If a payment was charged but Pro was not added to your account, contact us with your order ID and we will add it or refund the full amount.
- If you were charged twice for the same order, the duplicate payment is refunded in full.
- If you request a refund within 7 days of buying a pass, we refund it in full.
- After 7 days, passes are not refundable, except where the law requires otherwise.

Approved refunds are made to the original payment method through Cashfree Payments, usually within 5–7 working days, depending on your bank.

## Rewarded ads

Pro time earned by watching rewarded ads in the Android app is free and has no cash value, so it cannot be refunded or exchanged.

## How to ask

See the [contact page](/contact/). Please include your order ID, which is shown on your account page under Billing history.
`;

export default function RefundsPage() {
  return <TextPage title="Refund and cancellation policy" updated="October 2026" body={BODY} />;
}
