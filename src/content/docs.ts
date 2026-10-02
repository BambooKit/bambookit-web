export interface DocPage {
  slug: string;
  title: string;
  section: "Get started" | "Use BambooKit" | "Reference";
  /** One sentence shown under the title. */
  summary?: string;
  body: string;
}

export const SECTIONS: DocPage["section"][] = ["Get started", "Use BambooKit", "Reference"];

export const DOCS: DocPage[] = [
  {
    slug: "",
    title: "Introduction",
    section: "Get started",
    summary: "BambooKit is an AI coding app for Windows, with your phone as the remote.",
    body: `
BambooKit has three parts:

- **BambooKit Desktop** runs on your Windows PC. It is where you work with the agent: chat, files, diffs, terminal, Git, MCP servers, tools and models. Your sessions are stored here.
- **BambooKit for Android** is the remote. See your PCs and sessions, follow chats live, check changed files and answer the agent's permission requests.
- **This website** shows your PCs, sessions, chats and changed files when you sign in. It is view only.

All three use the same account. A small cloud service, BambooKit Cloud, signs you in, pairs your devices and relays live updates between them.

## Next steps

- [Install BambooKit](/docs/install)
- [Quick start](/docs/quickstart)
- [How BambooKit works](/docs/how-it-works)
- [Pair your phone](/docs/phone)
`,
  },
  {
    slug: "install",
    title: "Install",
    section: "Get started",
    summary: "Install BambooKit Desktop on Windows and the Android app on your phone.",
    body: `
## Windows

Requirements: Windows 10 or 11, 64-bit.

Open PowerShell and run:

\`\`\`powershell
irm https://bambookit-web.onrender.com/install.ps1 | iex
\`\`\`

This downloads the latest **BambooKit Desktop** installer from GitHub Releases, checks its signature and starts it. You can also download the installer yourself from the [releases page](https://github.com/BambooKit/bambookit-desktop/releases/latest).

## Android

1. On your phone, download **BambooKit.apk** from the [releases page](https://github.com/BambooKit/bambookit-desktop/releases/latest).
2. Allow installing from your browser when Android asks, then open the file.
3. Sign in with the same account you use on the PC.
4. Pair the phone with your PC: see [Phone](/docs/phone).

## From source {#from-source}

BambooKit is open source. To build and run everything yourself (API, Desktop and the Android app), follow the README in the [bambookit-infrastructure](https://github.com/BambooKit/bambookit-infrastructure) repository. Its \`start-bambookit.ps1\` script starts the API on port 8080 and BambooKit Desktop, and \`stop-bambookit.ps1\` stops them.

You need Git, Node.js 22.13 or newer and Bun; building the Android app also needs JDK 21 and the Android SDK.

Before the first start, fill in the settings described in [Configuration](/docs/configuration).
`,
  },
  {
    slug: "quickstart",
    title: "Quick start",
    section: "Get started",
    summary: "From install to your first agent session in a few minutes.",
    body: `
1. **Open BambooKit Desktop** and sign in with email and password, or with Google. You can also choose *Continue offline* to use the agent without phone and web features.
2. **Open a project**: choose a folder on your PC.
3. **Pick a model**. The **BambooKit** provider includes free models; no key is needed.
4. **Ask for something**, for example:

\`\`\`text
Create a file named hello.txt containing: Hello from BambooKit
\`\`\`

The agent edits files, runs commands and shows every change. When it wants to do something that needs permission, it asks first.

5. **Follow along elsewhere.** Sign in on this website to see the session, or [pair your phone](/docs/phone).
`,
  },
  {
    slug: "how-it-works",
    title: "How BambooKit works",
    section: "Get started",
    summary: "Your sessions live on your PC. The cloud keeps a small index and relays chats live.",
    body: `
## The parts

| Part | Where it runs | What it does |
|---|---|---|
| **BambooKit Desktop** | Your Windows PC | The app you work in. Runs the agent, its tools and permission rules, and stores your sessions |
| **BambooKit Cloud** | [bambookit-api.onrender.com](https://bambookit-api.onrender.com/health) | Sign-in check, devices and pairing, the session index, approvals and live relay |
| **BambooKit for Android** | Your phone | The remote: sessions, chats, changed files, approvals |
| **BambooKit Web** | [bambookit-web.onrender.com](https://bambookit-web.onrender.com) | This site: install, docs, and a view-only window on your sessions |

## Where your sessions are stored

Sessions (every message, tool call and file change) are stored **only on your PC**.

BambooKit Cloud keeps just enough to list them:

- a **session index**: title, status, project, model, change counts and times;
- **pending approvals**, so your phone can answer them.

## How your phone and this site see a chat

When you open a session on your phone or here, BambooKit Cloud asks your PC for the chat and passes the answer straight through. Nothing is stored on the way. While the session is open, new messages, tool steps and file changes are relayed live as the agent works.

If your PC is **offline** (switched off, asleep, or BambooKit Desktop is closed), the session still appears in your list, but its chat and changed files cannot be shown until the PC is back.

## Who can do what

| Action | Desktop | Phone | Web |
|---|---|---|---|
| Start a new session | Yes | No | No |
| See sessions, chats and changed files | Yes | Yes | Yes |
| Answer approvals | Yes | Yes | No (view only) |
| Chat, stop, continue or retry | Yes | After you continue the session on the PC | No |

New sessions always start on the PC. A session becomes available for chatting from your phone after you **continue it on your PC**, that is, after you send a message in it in BambooKit Desktop while you are signed in.

## Where models come from

- **Free BambooKit models** are built in. No key is needed.
- **Your own keys** (OpenAI, Anthropic, Google and others) are stored on your PC and used directly from your PC.

BambooKit Cloud never sees model keys or model traffic.

## The hosted service on the free plan

The hosted API sleeps after about 15 minutes without traffic; the first request after that can take up to a minute while it wakes. BambooKit Desktop keeps it awake while it runs.
`,
  },
  {
    slug: "sign-in",
    title: "Accounts and sign-in",
    section: "Get started",
    summary: "Use one account on your PC, your phone and this website.",
    body: `
Use the **same account** on BambooKit Desktop, BambooKit for Android and this website.

| Method | Notes |
|---|---|
| Email and password | Create the account in the app or on this site, confirm your email, then sign in |
| Google | Available in the apps, and on this site when the deployment enables it |

An email/password account and a Google account are **separate accounts**, even with the same address. Pick one and use it everywhere; pairing and session lists only work within one account.

## Forgot your password?

Use [Reset password](/forgot) on this site. You get an email with a link to choose a new password; use the new password on all your devices.
`,
  },
  {
    slug: "desktop",
    title: "Desktop",
    section: "Use BambooKit",
    summary: "Where the agent runs and your sessions live.",
    body: `
## Sessions

Each conversation with the agent is a session in a project. Run several at once, in different projects or the same one. New sessions always start here.

## Agents

- **Build** writes code, runs commands and edits files.
- **Plan** analyses and proposes changes without editing.

Switch with **Tab** in the prompt.

## Changes and diffs

Every file the agent touches appears in the review panel with a diff. Revert a step if you do not like the result.

## Terminal and Git

The built-in terminal runs in your project folder. Git status, diffs and history are shown in the side panel.

## MCP servers and tools

Add MCP servers in **Settings → MCP** to give the agent more tools.

## The BambooKit menu

The BambooKit chip in the title bar shows your account and connection status. Use it to add a mobile device, see paired phones or sign out.
`,
  },
  {
    slug: "sessions",
    title: "Sessions",
    section: "Use BambooKit",
    summary: "What a session is, where it is stored and what its status means.",
    body: `
A **session** is one conversation with the agent in one project.

## Where they are stored

- The full history (messages, tool calls, file changes) is stored **only on your PC**.
- BambooKit Cloud keeps a small index so your phone and this site can list your sessions: title, status, project, model, change counts and times.
- Chats and changed files are read live from your PC whenever you open a session elsewhere. If the PC is offline they cannot be shown.

## Statuses

| Status | Meaning |
|---|---|
| Working | The agent is running |
| Retrying | The model provider failed and the agent is retrying |
| Error | The last run failed; the message explains why |
| Idle | Waiting for your next message |

## Continuing a session from your phone

Your phone can always view a session. To chat in it from your phone, first **continue it on your PC**: send a message in it in BambooKit Desktop. From then on you can chat, stop, continue or retry it from your phone.
`,
  },
  {
    slug: "phone",
    title: "Phone",
    section: "Use BambooKit",
    summary: "Pair your Android phone and use it as the remote.",
    body: `
## Pair

1. On the PC: click the **BambooKit** chip → **Add mobile device**. A QR code appears.
2. On the phone: **Devices → Add device — scan QR**.
3. The phone shows **Connected to** your PC.

The QR code works once and for two minutes; a new one appears automatically. It never contains your password or session token. Both devices must be signed in to the **same account**.

## What you can do

| Screen | What it shows |
|---|---|
| Home | Your PCs and whether they are online, active sessions and approvals waiting |
| Projects | Every project on your PCs and their sessions |
| Session | The live chat, tool activity and changed files. Chat, **Stop**, **Continue** and **Retry** once the session was continued on the PC |
| Approvals | Permission requests from the agent: **Approve**, **Always**, **Reject** |
| Devices | Paired PCs; rename, disconnect or revoke |

New sessions start on the PC. Messages you send from the phone go to the agent on your PC; if the PC is offline, the request waits up to five minutes and is then dropped, so an old request never runs later.
`,
  },
  {
    slug: "web",
    title: "Website",
    section: "Use BambooKit",
    summary: "A view-only window on your PCs and sessions.",
    body: `
Sign in at [bambookit-web.onrender.com](https://bambookit-web.onrender.com/signin) with your BambooKit account.

| Page | What it shows |
|---|---|
| [Sessions](/sessions) | Your PCs with their online status, and every session: status, project, model, changes and pending approvals. Search and filter by PC or status |
| Session | The chat, tool steps and changed files, updated live while the agent works |
| [Devices](/devices) | Your PCs and phones, whether they are online and when they were last seen |
| [Approvals](/approvals) | Permission requests waiting for an answer |
| [Setup](/welcome) | The steps to connect your first PC and phone |

## View only

The website does not send messages or answer approvals. Chat in BambooKit Desktop, or on your phone after continuing the session on your PC; answer approvals on either.

## When a chat does not load

Chats and changed files are read from your PC when you open them. If the page says your PC is offline, open BambooKit Desktop on that PC and sign in; the session loads by itself when the PC is back, or press **Retry**.
`,
  },
  {
    slug: "models",
    title: "Models and providers",
    section: "Use BambooKit",
    summary: "Free models out of the box, or bring your own keys.",
    body: `
## Free models

The **BambooKit** provider includes free models. Select one in the model picker; there is nothing to configure.

## Your own keys

**Settings → Providers → Connect** to add a provider: OpenAI, Anthropic, Google, OpenRouter, Groq, Mistral, xAI, local Ollama and many more. Keys are stored on your PC only.

Requests go straight from your PC to the provider. They never pass through BambooKit Cloud.
`,
  },
  {
    slug: "sharing",
    title: "Sharing a session",
    section: "Use BambooKit",
    summary: "Publish a read-only copy of a session with a link.",
    body: `
Open the session menu → **Share** → **Publish**. You get a link like:

\`\`\`text
https://bambookit-web.onrender.com/share/AbC123xy
\`\`\`

Anyone with the link can read the conversation, tool steps and the list of changed files. The page refreshes as the session continues. Choose **Unpublish** to delete the shared copy.

Publishing is the one case where a copy of a session is stored by BambooKit Cloud, and only until you unpublish it. Only your PC, which holds the secret for that link, can change or delete it.
`,
  },
  {
    slug: "security",
    title: "Security",
    section: "Reference",
    summary: "How BambooKit protects your code, devices and account.",
    body: `
- **Your sessions stay local.** The agent runs on your PC and sessions are stored there. BambooKit Cloud keeps a small session index and pending approvals, and relays chats live without storing them.
- **No open ports.** The local agent listens on 127.0.0.1 only. Phones and this website reach your PC through BambooKit Cloud, never directly.
- **Device keys.** Each PC has its own Ed25519 key, stored encrypted by Windows. Every request from the PC is signed with it.
- **Pairing.** QR codes are single-use, expire after two minutes and only work for the same account.
- **Fixed remote actions.** Phones can send messages, stop, continue or retry (in sessions continued on the PC), answer approvals and open diffs. There is no remote shell or file browser. The website is view only.
- **Approvals.** The agent's own permission rules decide what needs approval; a phone can only answer requests the agent made.
- **Revocation.** Revoke a phone or PC at any time; its access ends immediately.
`,
  },
  {
    slug: "configuration",
    title: "Configuration",
    section: "Reference",
    summary: "Settings for running your own copy of BambooKit.",
    body: `
These settings hold public values only. Never put a private key or service-role key in them.

## API — \`bambookit-api/.env\`

| Variable | Purpose |
|---|---|
| \`SUPABASE_URL\` | Your Supabase project URL |
| \`SUPABASE_ANON_KEY\` | Supabase anon (publishable) key |
| \`FIREBASE_PROJECT_ID\` | Firebase project used for Google sign-in |
| \`POSTGRES_URL\` | Postgres connection string. Required on Render, whose disk is wiped on restart |
| \`DATABASE_PATH\` | SQLite file for local use, default \`./data/bambookit.db\` |
| \`PUBLIC_SHARE_BASE_URL\` | Origin used in share links, e.g. \`https://bambookit-web.onrender.com\` |
| \`CORS_ORIGINS\` | Allowed browser origins, e.g. \`https://bambookit-web.onrender.com,http://localhost:3000\` |

## Website — build-time environment

The website is a static site; these values are baked in by \`npm run build\`.

| Variable | Purpose |
|---|---|
| \`NEXT_PUBLIC_API_URL\` | API address, default \`https://bambookit-api.onrender.com\` |
| \`NEXT_PUBLIC_SUPABASE_URL\`, \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\` | Email sign-in |
| \`NEXT_PUBLIC_FIREBASE_API_KEY\`, \`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\`, \`NEXT_PUBLIC_FIREBASE_PROJECT_ID\` | Optional Google sign-in |

## Desktop — \`packages/desktop/.env.bambookit\` in the desktop repository

| Variable | Purpose |
|---|---|
| \`BAMBOOKIT_API_URL\` | API address: \`https://bambookit-api.onrender.com\` (hosted) or \`http://localhost:8080\` (local) |
| \`BAMBOOKIT_SUPABASE_URL\`, \`BAMBOOKIT_SUPABASE_ANON_KEY\` | Sign-in |
| \`BAMBOOKIT_FIREBASE_API_KEY\`, \`BAMBOOKIT_FIREBASE_PROJECT_ID\`, \`BAMBOOKIT_FIREBASE_AUTH_DOMAIN\` | Google sign-in |

## Android — \`bambookit-android/local.properties\`

| Key | Purpose |
|---|---|
| \`bambookit.supabaseUrl\`, \`bambookit.supabaseAnonKey\` | Sign-in |
| \`bambookit.apiUrl.debug\` | API for debug builds, default \`http://127.0.0.1:8080\` over USB |
| \`bambookit.apiUrl.release\` | API for release builds |

## Agent settings

Models, agents, MCP servers and permissions are configured in **Settings** inside BambooKit Desktop.
`,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    section: "Reference",
    summary: "Fixes for the most common problems.",
    body: `
## "Your PC is offline" when opening a session

Chats and changed files are stored on your PC and read from it live. Turn the PC on, open BambooKit Desktop and make sure it is signed in to the same account. The session loads by itself when the PC reconnects.

## The website or app is slow to load the first time

The hosted service sleeps when it has been idle; the first request can take up to a minute while it wakes.

## I can't chat in a session from my phone

Continue the session on your PC first: send a message in it in BambooKit Desktop. New sessions also have to be started on the PC.

## Pairing says "different account"

Sign in to the same account on the PC and the phone. Email and Google accounts are separate accounts.

## Pairing says the code expired or was used

Wait for the PC to show a new QR code (it refreshes automatically) and scan again.

## A model returns an error

Pick another model. Some free models are occasionally unavailable from their provider.

## The desktop window is blank

Close and reopen BambooKit Desktop.

## Debug builds: "Can't reach BambooKit on your PC" on the phone

Debug builds reach the PC over USB at \`127.0.0.1:8080\`. Keep the phone connected and start everything with \`start-bambookit.ps1\`, which keeps a USB bridge running.
`,
  },
];

/** Docs in sidebar order (section by section). Used for the sidebar and previous/next links. */
export const ORDERED_DOCS: DocPage[] = SECTIONS.flatMap((section) => DOCS.filter((d) => d.section === section));

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((d) => d.slug === slug);
}
