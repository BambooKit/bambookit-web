import { TextPage } from "@/components/site/TextPage";

export const metadata = { title: "Privacy" };

const BODY = `
This page describes what BambooKit stores. It is a plain-language summary, not a substitute for legal advice.

## On your PC

Your sessions (chats, tool calls and file changes), source code, terminal output and model API keys stay on your PC. The AI agent runs locally and sends prompts directly to the model provider you choose.

## In BambooKit Cloud

| Data | Why | Retention |
|---|---|---|
| Account email and name | Sign-in (handled by Supabase / Firebase) | Until you delete your account |
| Device names and public keys | Pairing and signed requests | Until you revoke the device |
| Session index: project names and folders, session titles, status, model, change counts and times | Listing your sessions on your phone and the website | While the session exists on your PC |
| Pending approvals | Answering the agent's requests from your phone | Until answered, then kept as history |
| Notifications and activity events | History | Events: 14 days |
| Shared sessions | Only when you choose Publish | Until you unpublish |

| Plan and payments: plan, Pro end date, daily phone usage counts, orders (product, amount, status, dates, Cashfree order ID) | Your plan and billing history | Usage counts: reset daily. Orders: as long as needed for accounting and tax |

Chats, tool output and changed files are **not stored** by BambooKit Cloud. When you open a session on your phone or on the website, they are read from your PC and passed through live.

BambooKit does not sell your data and does not use it to train models.

## Payments

Pro passes are paid through **Cashfree Payments**, our payment processor. You enter your card, UPI or netbanking details on Cashfree's checkout, and Cashfree handles them under its own privacy policy. BambooKit never sees or stores your card or UPI details; we send Cashfree only the order and the contact details it needs to create it, and receive back the result (paid or not, amount and dates).

## Ads in the Android app

The free Android app shows ads from **Google AdMob**, including optional rewarded ads that give you Pro for a short time. AdMob may use your device's advertising ID and collect data as described in Google's privacy policy. In the EEA and the UK the app asks for your consent with Google's consent form (UMP) before showing personalised ads. Pro removes ads. BambooKit Desktop and this website show no ads.

## Your choices

- Use **Continue offline** in BambooKit Desktop to use the agent without BambooKit Cloud.
- Revoke devices at any time in **Devices**.
- Unpublish shared sessions from the session's Share menu.
- Pro turns off ads in the Android app.
`;

export default function PrivacyPage() {
  return <TextPage title="Privacy" updated="October 2026" body={BODY} />;
}
