import { TextPage } from "@/components/site/TextPage";

export const metadata = { title: "Privacy" };

const BODY = `
This page describes what BambooKit stores. It is a plain-language summary, not a substitute for legal advice.

## On your PC

Your source code, terminal output and model API keys stay on your PC. The AI agent runs locally and sends prompts directly to the model provider you choose.

## In BambooKit Cloud

| Data | Why | Retention |
|---|---|---|
| Account email and name | Sign-in (handled by Supabase / Firebase) | Until you delete your account |
| Device names and public keys | Pairing and signed requests | Until you revoke the device |
| Project names and folder paths, session titles and status | Showing your work on the phone | While the session exists |
| Chat text, tool names and titles, changed-file names and line counts | The phone's live session view | While the session exists |
| Diff contents | Only when you open a diff on the phone | Stored with that request |
| Approvals, notifications and activity events | Approvals and history | Events: 14 days |
| Shared sessions | Only when you choose Publish | Until you unpublish |

BambooKit does not sell your data and does not use it to train models.

## Your choices

- Use **Continue offline** in BambooKit Desktop to use the agent without BambooKit Cloud.
- Revoke devices at any time in **Devices**.
- Unpublish shared sessions from the session's Share menu.
`;

export default function PrivacyPage() {
  return <TextPage title="Privacy" updated="October 2026" body={BODY} />;
}
