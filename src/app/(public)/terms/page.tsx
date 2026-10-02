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

## Open source

BambooKit Desktop is based on open-source software published under the MIT license. Its license and notices are included with the app.
`;

export default function TermsPage() {
  return <TextPage title="Terms" updated="October 2026" body={BODY} />;
}
