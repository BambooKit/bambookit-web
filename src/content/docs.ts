export interface DocPage {
  slug: string;
  title: string;
  section: "Get started" | "Use BambooKit" | "Reference";
  body: string;
}

export const DOCS: DocPage[] = [
  {
    slug: "",
    title: "Introduction",
    section: "Get started",
    body: `
BambooKit is an AI coding workspace for Windows with a companion Android app.

- **BambooKit Desktop** runs the agent on your PC: chat, agents, files, diffs, terminal, Git, MCP servers, tools and model providers.
- **BambooKit Android** is the remote: follow sessions live, chat with the agent, approve actions, view changes and stop or continue work.
- **BambooKit Cloud** signs you in, pairs your devices and relays session updates between them. Your code stays on your PC.

## Next steps

- [Install BambooKit](/docs/install)
- [Quick start](/docs/quickstart)
- [Pair your phone](/docs/phone)
`,
  },
  {
    slug: "install",
    title: "Install",
    section: "Get started",
    body: `
## Windows (recommended)

Requirements: Windows 10 or 11, 64-bit.

Open PowerShell and run:

\`\`\`powershell
irm https://bambookit-web.onrender.com/install.ps1 | iex
\`\`\`

This downloads the latest **BambooKit Desktop** installer from GitHub Releases and starts it. You can also download it yourself from the [releases page](https://github.com/BambooKit/bambookit-desktop/releases/latest).

## Android

1. On your phone, download **BambooKit.apk** from the [releases page](https://github.com/BambooKit/bambookit-desktop/releases/latest).
2. Allow installing from your browser when Android asks, then open the file.
3. Sign in with the same account you use on the PC.

## From source {#from-source}

Install the tools once:

\`\`\`powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS -e        # Node 22.13 or newer
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Clone and start everything (API on port 8080 and BambooKit Desktop):

\`\`\`powershell
mkdir BambooKit; cd BambooKit
git clone https://github.com/BambooKit/bambookit-infrastructure
git clone https://github.com/BambooKit/bambookit-api
git clone https://github.com/BambooKit/bambookit-desktop opencode-bambookit
git clone https://github.com/BambooKit/bambookit-android
cd bambookit-api; npm install; copy .env.example .env; cd ..
cd opencode-bambookit; bun install; cd ..
.\\bambookit-infrastructure\\scripts\\start-bambookit.ps1
\`\`\`

Stop everything with \`.\\bambookit-infrastructure\\scripts\\stop-bambookit.ps1\`.

Before the first start, fill in the configuration described in [Configuration](/docs/configuration).

To build and install the Android app on a phone connected by USB (needs JDK 21 and the Android SDK):

\`\`\`powershell
.\\bambookit-infrastructure\\scripts\\start-bambookit.ps1 -Android
\`\`\`
`,
  },
  {
    slug: "quickstart",
    title: "Quick start",
    section: "Get started",
    body: `
1. **Open BambooKit Desktop** and sign in (email and password, or Google). You can also choose *Continue offline* to use the agent without phone features.
2. **Open a project**: choose a folder on your PC.
3. **Pick a model**. The **BambooKit** provider includes free models; no key is needed.
4. **Ask for something**, for example:

\`\`\`text
Create a file named hello.txt containing: Hello from BambooKit
\`\`\`

The agent edits files, runs commands and shows every change. When it wants to do something that needs permission, it asks first.

5. **Pair your phone** to follow along from anywhere. See [Phone](/docs/phone).
`,
  },
  {
    slug: "desktop",
    title: "Desktop",
    section: "Use BambooKit",
    body: `
## Sessions

Each conversation with the agent is a session in a project. Run several at once — in different projects or the same one.

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

## The BambooKit chip

The chip in the title bar shows your connection: account, cloud connection, realtime link and the local engine. Click it to manage paired phones or sign out.
`,
  },
  {
    slug: "phone",
    title: "Phone",
    section: "Use BambooKit",
    body: `
## Pair

1. On the PC: click the **BambooKit** chip → **Add mobile device**. A QR code appears.
2. On the phone: **Devices → Add device — scan QR**.
3. The phone shows **Connected to** your PC.

The QR code is valid once and for two minutes; a new one appears automatically. It never contains your password or session token. Both devices must be signed in to the **same account**.

## What you can do

| Screen | What it shows |
|---|---|
| Home | Your PCs and whether they are online, active sessions, approvals waiting, recently changed files |
| Projects | Every project open on your PCs and their sessions |
| Session | The live conversation, tool activity, changed files and diffs; send messages, **Stop**, **Continue**, **Retry** |
| Approvals | Permission requests from the agent: **Approve**, **Always**, **Reject** |
| Devices | Paired PCs; rename, disconnect or revoke |

Messages you send go to the agent on your PC. If the PC is offline, the request waits up to five minutes and is then dropped, so an old request never runs later.
`,
  },
  {
    slug: "models",
    title: "Models and providers",
    section: "Use BambooKit",
    body: `
## Free models

The **BambooKit** provider includes free models. Select one in the model picker; nothing to configure.

## Your own keys

**Settings → Providers → Connect** to add a provider: OpenAI, Anthropic, Google, OpenRouter, Groq, Mistral, xAI, local Ollama and many more. Keys are stored on your PC only.

Requests go straight from your PC to the provider. They never pass through BambooKit Cloud.
`,
  },
  {
    slug: "sharing",
    title: "Sharing a session",
    section: "Use BambooKit",
    body: `
Open the session menu → **Share** → **Publish**. You get a link like:

\`\`\`text
https://bambookit-web.onrender.com/share/AbC123xy
\`\`\`

Anyone with the link can read the conversation, tool steps and the list of changed files. Updates to the session appear on the page automatically. Choose **Unpublish** to delete the shared copy.

Shared sessions are stored by BambooKit Cloud. Only your PC, which holds the secret for that link, can change or delete it.
`,
  },
  {
    slug: "configuration",
    title: "Configuration",
    section: "Reference",
    body: `
These files hold public settings only. Never put a private key or service-role key in them.

## API — \`bambookit-api/.env\`

| Variable | Purpose |
|---|---|
| \`SUPABASE_URL\` | Your Supabase project URL |
| \`SUPABASE_ANON_KEY\` | Supabase anon (publishable) key |
| \`FIREBASE_PROJECT_ID\` | Firebase project used for Google sign-in |
| \`DATABASE_PATH\` | SQLite file, default \`./data/bambookit.db\` |
| \`PUBLIC_SHARE_BASE_URL\` | Origin used in share links, e.g. \`https://bambookit-web.onrender.com\` |
| \`CORS_ORIGINS\` | Allowed browser origins |

## Desktop — \`opencode-bambookit/packages/desktop/.env.bambookit\`

| Variable | Purpose |
|---|---|
| \`BAMBOOKIT_API_URL\` | API address (\`http://localhost:8080\` for local) |
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
    slug: "cli",
    title: "CLI",
    section: "Reference",
    body: `
The \`bamboo\` command-line tool talks to BambooKit Cloud.

\`\`\`powershell
cd bambookit-cli; npm install; npm run build
$env:BAMBOOKIT_BASE_URL = "http://localhost:8080"
$env:BAMBOOKIT_ACCESS_TOKEN = "<your session token>"
node dist/index.js doctor
\`\`\`

| Command | What it does |
|---|---|
| \`bamboo doctor\` | Checks the API and your sign-in |
| \`bamboo project list\` | Projects on your PCs |
| \`bamboo session list [--active]\` | Sessions |
| \`bamboo session show <id>\` | Conversation and changed files |
| \`bamboo session send <id> <text>\` | Send a message to the agent |
| \`bamboo session stop <id>\` | Stop the agent |
| \`bamboo approval list\` | Pending approvals |
| \`bamboo approval approve <id> [--always]\` | Approve |
| \`bamboo approval reject <id>\` | Reject |
| \`bamboo device list\` | Your PCs and phones |

Add \`--json\` to any command for machine-readable output.
`,
  },
  {
    slug: "security",
    title: "Security",
    section: "Reference",
    body: `
- **Your code stays local.** The agent runs on your PC. BambooKit Cloud receives project names, session titles and status, chat text, tool names and changed-file summaries. File contents are sent only when you open a diff on your phone or publish a share.
- **No open ports.** The local engine listens on 127.0.0.1 only. Phones reach your PC through BambooKit Cloud, never directly.
- **Device keys.** Each PC has its own Ed25519 key, stored encrypted by Windows. Every request from the PC is signed with it.
- **Pairing.** QR codes are single-use, expire after two minutes and only work for the same account.
- **Fixed remote actions.** Phones can send messages, stop/continue/retry, answer approvals and open diffs. There is no remote shell or file browser.
- **Approvals.** The agent's own permission rules decide what needs approval; a phone can only answer requests the agent made.
- **Revocation.** Revoke a phone or PC in Devices at any time; its access ends immediately.
`,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    section: "Reference",
    body: `
## "Can't reach BambooKit on your PC" on the phone

Debug builds reach the PC over USB at \`127.0.0.1:8080\`. Keep the phone connected and run \`.\\bambookit-infrastructure\\scripts\\start-bambookit.ps1\` — it starts a USB bridge that restores the connection whenever the cable reconnects. Check with:

\`\`\`powershell
& "$env:LOCALAPPDATA\\Android\\Sdk\\platform-tools\\adb.exe" reverse --list
\`\`\`

## Pairing says "different account"

Sign in to the same account on the PC and the phone.

## Pairing says the code expired or was used

Wait for the PC to show a new QR code (it refreshes automatically) and scan again.

## A model returns an error

Pick another model. Some free models are occasionally unavailable from their provider.

## The desktop window is blank

Close and reopen BambooKit Desktop. If you run it from source in development mode, start it with \`.\\bambookit-infrastructure\\scripts\\start-bambookit.ps1\` (production build) instead.

## "does not provide an export named 'BrowserWindow'"

Your terminal sets \`ELECTRON_RUN_AS_NODE\`. Start BambooKit with \`.\\bambookit-infrastructure\\scripts\\start-bambookit.ps1\`, which clears it.
`,
  },
];

export const SECTIONS: DocPage["section"][] = ["Get started", "Use BambooKit", "Reference"];

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((d) => d.slug === slug);
}
