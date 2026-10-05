import { TextPage } from "@/components/site/TextPage";

export const metadata = { title: "Terms" };

const BODY = `
BambooKit is provided as is. It is a plain-language summary, not a substitute for legal advice.

## Your code and output

You own your code and everything the agent produces for you. You are responsible for reviewing changes and approvals before using them.

## Model providers

When you use a model provider, its own terms apply to your requests. Free BambooKit models are offered while available and may change.

## Acceptable use

Do not use BambooKit to attack systems you are not authorized to test, or to break the law.

## Pro passes and refunds

Plain-language summary: Pro is a prepaid pass for one month or one year, priced in Indian rupees including taxes as applicable. It does not renew automatically, so there is nothing to cancel; when it ends your account returns to the free plan. Payments are processed by Cashfree Payments. If you were charged for something you didn't get, or a payment went wrong, contact us through the Support link (GitHub Discussions) with your order ID and we will fix it or refund it. Full details: [refund and cancellation policy](/refunds/). Rewarded ads in the Android app grant short Pro time and have no cash value. Plans, limits and prices may change; a pass you already bought keeps its end date.

## Open source

BambooKit Desktop is based on open-source software published under the MIT license. Its license and notices are included with the app.
`;

export default function TermsPage() {
  return <TextPage title="Terms" updated="October 2026" body={BODY} />;
}
