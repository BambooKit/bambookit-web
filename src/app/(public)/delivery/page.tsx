import { TextPage } from "@/components/site/TextPage";

export const metadata = { title: "Delivery policy" };

const BODY = `
BambooKit sells digital services only. Nothing is shipped physically.

## When Pro starts

BambooKit Pro is added to your account right after Cashfree Payments confirms your payment, usually within a few seconds. It works at once in BambooKit Desktop, the Android app and this website when you are signed in with the same account.

## If it doesn't appear

Open the [account page](/account/#plan) to see your plan and billing history. If a payment succeeded but Pro is not active after 30 minutes, see the [contact page](/contact/) and include your order ID.
`;

export default function DeliveryPage() {
  return <TextPage title="Delivery policy" updated="October 2026" body={BODY} />;
}
