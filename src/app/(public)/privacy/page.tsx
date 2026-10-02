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

Chats, tool output and changed files are **not stored** by BambooKit Cloud. When you open a session on your phone or on the website, they are read from your PC and passed through live.

BambooKit does not sell your data and does not use it to train models.

## Your choices

- Use **Continue offline** in BambooKit Desktop to use the agent without BambooKit Cloud.
- Revoke devices at any time in **Devices**.
- Unpublish shared sessions from the session's Share menu.
`;

export default function PrivacyPage() {
  return <TextPage title="Privacy" updated="October 2026" body={BODY} />;
}
