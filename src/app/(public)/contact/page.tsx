import { TextPage } from "@/components/site/TextPage";
import { LINKS } from "@/lib/config";

export const metadata = { title: "Contact" };

const BODY = `
## Support

- Questions, help and feedback: [GitHub Discussions](${LINKS.discussions})
- Bug reports: [report a bug](${LINKS.bugReport})
- Payments and refunds: post in Discussions with your **order ID** (never post card, UPI or bank details). We reply within 2 working days.

## Payments

Payments are processed by Cashfree Payments. See the [refund and cancellation policy](/refunds/) and the [delivery policy](/delivery/).
`;

export default function ContactPage() {
  return <TextPage title="Contact" updated="October 2026" body={BODY} />;
}
