export interface DocPage {
  slug: string;
  title: string;
  section: "Get started" | "Apps" | "Features" | "Desktop tools" | "Reference" | "Help";
  /** One sentence shown under the title. */
  summary?: string;
  body: string;
}

export const SECTIONS: DocPage["section"][] = ["Get started", "Apps", "Features", "Desktop tools", "Reference", "Help"];

/**
 * The user-facing documentation rendered at /docs. The complete documentation (architecture, API,
 * SDK, CLI, deployment and release process) lives in the bambookit-docs repository.
 */
export const DOCS: DocPage[] = [
  {
    slug: "",
    title: "Introduction",
    section: "Get started",
    summary: "BambooKit is an AI coding app for Windows, with your phone as the remote.",
    body: `
BambooKit has three parts that share one account:

- **BambooKit Desktop** runs on your Windows PC. You work with the coding agent there: chat, files, diffs, terminal, Git, MCP servers and models. Your sessions and project files stay on the PC.
- **BambooKit for Android** is the remote. Follow sessions live, read their history (prompts, timeline, changes with before and after, tests), browse the project, see its diagram, stop a run and answer the agent's permission requests.
- **This website** shows your PCs, sessions with their history, and approvals when you sign in, and has your account page. It is view only.

A small cloud service, **BambooKit Cloud** (the BambooKit API), signs you in, pairs your devices, keeps a short index of your sessions and relays live data between your PC and your other devices. It never connects to your PC; your PC connects out to it.

\`\`\`Diagram
 Phone ──┐                                   ┌── Your PC
         ├──► BambooKit Cloud (API) ◄────────┤   BambooKit Desktop
 Web   ──┘    sign-in, pairing, index,       │   agent + sessions + files
              live relay                     └── (outbound connection only)
\`\`\`

## What each device can do

| Action | Desktop | Phone | Web |
|---|---|---|---|
| Start a new session | Yes | No | No |
| See PCs, projects and sessions | Yes | Yes | Yes |
| Session history: summary, prompts, timeline, diffs, before/after, tests | Yes | Yes | Yes |
| Read a session while its PC is off (7-day copy) | — | Yes | Yes |
| Project files and diagram | Yes | Yes | No |
| Answer approvals and questions | Yes | Yes | Yes |
| Stop a running agent | Yes | Yes | No |
| Send messages to the agent | Yes | No | No |
| Edit files | Yes | No | No |
| Profile photo, delete account | — | Yes | Yes |
| App lock | — | Yes | — |

## Versions

| App | Version |
|---|---|
| BambooKit Desktop (Windows 10/11, 64-bit) | 1.0.2 |
| BambooKit for Android (Android 8.0+) | 1.0.3 |
| BambooKit Cloud (API) | 1.0.1 |

## Next steps

- [Install BambooKit](/docs/install)
- [Quick start](/docs/quickstart)
- [How BambooKit works](/docs/how-it-works)
- [Pair your phone](/docs/pairing)

## Credits

BambooKit is created and maintained by Satyam Pote. BambooKit Desktop is built on [OpenCode](https://github.com/anomalyco/opencode) (MIT License), which provides the agent engine, its tools and the free models; BambooKit adds the account, device pairing, the phone remote, the live relay, the file map and project diagram, and this website.
`,
  },
  {
    slug: "how-it-works",
    title: "How BambooKit works",
    section: "Get started",
    summary: "Your sessions live on your PC. The cloud keeps a small index and relays the rest live.",
    body: `
## The parts

| Part | Where it runs | What it does |
|---|---|---|
| **BambooKit Desktop** | Your Windows PC | Runs the agent on 127.0.0.1, stores sessions, executes actions you send from the phone |
| **BambooKit Cloud** | [bambookit-api.onrender.com](https://bambookit-api.onrender.com/health) | Checks sign-ins, registers devices, pairs phones, keeps the session index and approvals, relays live data |
| **BambooKit for Android** | Your phone | The remote |
| **BambooKit Web** | [bambookit-web.onrender.com](https://bambookit-web.onrender.com) | Install, docs, view-only window on your sessions, shared session links |

## Where your data lives

| Data | Where |
|---|---|
| Messages, tool steps, reasoning, diffs, project files | Your PC only |
| Model API keys | Your PC only |
| Session index: title, status, project name and folder, model, change counts, times | BambooKit Cloud |
| Approvals: what the agent asked (e.g. the command) and your answer | BambooKit Cloud |
| Devices: name, platform, app version, the PC's public key | BambooKit Cloud |
| Realtime events | BambooKit Cloud, 14 days |
| Session history copy (prompts, timeline, changed lines, tests) | Private cloud storage, 7 days after the PC last saved it |
| Sessions you publish with Share | BambooKit Cloud, until you unpublish |

## How your phone reads a chat

\`\`\`Diagram
Phone ── GET chat ──► Cloud ── "send me this chat" ──► PC (over the PC's own connection)
Phone ◄── chat ────── Cloud ◄── chat ───────────────── PC      nothing is stored on the way
\`\`\`

While a session is open, new messages, tool steps and file changes are pushed live as the agent works. If the PC does not answer within 20 seconds you see "Your PC didn't answer in time"; if it is not connected at all, "Your PC is offline". For the session history, the phone and this site then show the copy your PC saved after its last turn (kept 7 days).

## How an action reaches your PC

\`\`\`Diagram
Phone: Stop ──► Cloud stores the command ──► PC gets it instantly ──► agent stops
Phone ◄── "Stop: done on your PC" ◄── Cloud ◄── PC reports the result
\`\`\`

A command your PC has not picked up within 5 minutes fails and is never run later.

## Who can do what

New sessions always start on the PC, and you chat with the agent on the PC. The phone and this site are view only; the phone can also **Stop** a running agent and answer approvals.

## Where models come from

- **Free BambooKit models** are built in; no key needed.
- **Your own keys** (OpenAI, Anthropic, Google, OpenRouter, local models and more) are stored on your PC.

Model requests go straight from your PC to the provider. BambooKit Cloud never sees model keys or model traffic.

## The hosted service on the free plan

The hosted API runs on a free plan that sleeps after about 15 minutes without traffic. It pings itself every 10 minutes and BambooKit Desktop keeps it awake while it runs; if it was asleep anyway, the first request can take up to a minute.
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

The script looks up the latest **BambooKit Desktop** release on GitHub, downloads \`BambooKit-Setup-<version>-x64.exe\`, checks its signature and starts it. The installer is not code-signed yet, so the script prints a warning and Windows SmartScreen may ask you to confirm (**More info → Run anyway**).

You can also download the installer yourself from the [releases page](https://github.com/BambooKit/bambookit-application/releases/latest).

| What | Where |
|---|---|
| Program | \`%LOCALAPPDATA%\\Programs\\bambookit-desktop\\\` |
| Start menu entry | **BambooKit** |
| Settings, encrypted sign-in and device key | \`%APPDATA%\\BambooKit Desktop\\\` |

Updates install automatically; see [Updates](/docs/updates).

## Android

Requirements: Android 8.0 or newer.

1. On your phone, open the [BambooKit for Android releases](https://github.com/BambooKit/bambookit-android/releases/latest) and download **BambooKit-<version>.apk**.
2. Open the file. Allow installing from your browser when Android asks.
3. Sign in with the same account you use on the PC (email and password).
4. Allow notifications when asked, then [pair your phone](/docs/pairing).

New versions are offered inside the app (**Devices → Check for updates**).

## From source {#from-source}

BambooKit is open source. To build and run everything yourself (API, Desktop and the Android app), see **Local development** in the [BambooKit documentation repository](https://github.com/BambooKit/bambookit-docs). The [bambookit-infrastructure](https://github.com/BambooKit/bambookit-infrastructure) repository has \`start-bambookit.ps1\` (Desktop on the hosted API; \`-LocalApi\` also runs the API on port 8080; \`-Android\` installs the debug app on a USB phone) and \`stop-bambookit.ps1\`.

You need Git, Node.js 22.13 or newer and Bun; building the Android app also needs a JDK (17 or newer) and the Android SDK. Fill in the settings described in [Configuration](/docs/configuration) first.

Desktop only:

\`\`\`powershell
git clone https://github.com/BambooKit/bambookit-application.git
cd bambookit-application
bun install
cd packages/desktop
copy .env.bambookit.example .env.bambookit
$env:OPENCODE_CHANNEL = "prod"
bun ./scripts/prebuild.ts
bun run build
bun run package:win
\`\`\`

## Uninstall

- **Windows:** Settings → Apps → BambooKit → Uninstall. To remove the saved sign-in and device key too, delete \`%APPDATA%\\BambooKit Desktop\\bambookit\\\`.
- **Android:** uninstall the app.
- Then revoke the device from another device so it disappears from your account.
`,
  },
  {
    slug: "quickstart",
    title: "Quick start",
    section: "Get started",
    summary: "From install to answering the agent from your phone in a few minutes.",
    body: `
## 1. Sign in on the PC

Open **BambooKit** from the Start menu and choose one:

- **Sign in** with email and password, or **Create account** and confirm the email first.
- **Continue with Google** opens your browser to finish the Google sign-in.
- **Continue offline** uses the agent without phone and web features.

Click the **BambooKit** chip in the title bar: **BambooKit API**, **Realtime** and **Agent engine** should all say connected.

## 2. Open a project and prompt

Choose **Add project** (\`Ctrl+O\`) and pick a folder. Open the model picker (\`Ctrl+'\`); the **BambooKit** provider has free models. Then ask for something:

\`\`\`text
Create a file named hello.txt containing: Hello from BambooKit
\`\`\`

Changed files appear in the review panel (\`Ctrl+Shift+R\`).

## 3. Pair your phone

1. PC: **BambooKit** chip → **Add mobile device**. A QR code appears; it refreshes itself every two minutes.
2. Phone: sign in with the **same account**, then **Devices → Scan QR code**.
3. The PC shows "your phone is now connected".

## 4. Follow along

On the phone open **Projects → your project → the session**. **Summary** shows status, duration, files changed and tests; **Timeline** and **Chat** update live; **Changes** shows each file's diff and its Before and After; **Files**, **Project** and **Diagram** show what the session touched and the project's structure. On the web, open [Sessions](/sessions).

## 5. Answer an approval

When the agent needs permission (for example to run a command), the phone shows **Approval required**. Open **Approvals** and choose **Allow once**, **Always** or **Deny**.

## 6. Stop if needed

If the agent goes the wrong way, press **Stop** on the phone. Continue the conversation in BambooKit Desktop.
`,
  },
  {
    slug: "sign-in",
    title: "Accounts and sign-in",
    section: "Get started",
    summary: "One account on your PC, your phone and this website.",
    body: `
Use the **same account** on BambooKit Desktop, BambooKit for Android and this website.

## Sign-in methods

| Method | Desktop | Android | Web |
|---|---|---|---|
| Email and password | Yes | Yes | Yes |
| Google | Yes | Not yet | Yes |
| Continue without an account | Yes ("Continue offline") | No | No |
| Profile photo | — | Devices → Profile | Account |
| Delete account | — | Devices → Profile | Account |

**An email/password account and a Google account are two separate accounts, even with the same email address.** Pick one method and use it everywhere: pairing and session lists only work within one account. If you want to use the phone, use an email account, because the Android app does not offer Google sign-in yet.

## Create an account

Choose **Create account**, enter your email and a password (and a name in Desktop). You receive a confirmation email; open the link, then sign in.

## Forgot your password?

Choose **Forgot password?** in any app or use [Reset password](/forgot) here. The email link opens this website, where you choose a new password. Use it on all your devices. Google accounts have no BambooKit password.

## Google sign-in on the PC

Desktop opens a small sign-in page at \`http://localhost:54329\` in your browser. Finish the Google sign-in there and return to the app. If nothing happens, check that no other program uses port 54329.

## Where your sign-in is stored

| App | Storage |
|---|---|
| Desktop | Encrypted by Windows for your user (DPAPI) |
| Android | Encrypted with the Android Keystore |
| Web | The browser's session for this site |

BambooKit never sees your password: sign-ins are handled by Supabase (email) and Google/Firebase (Google), and BambooKit Cloud only checks the signed tokens.

## Sign out

- **Desktop:** BambooKit chip → **Sign out of BambooKit**.
- **Android:** **Devices → Sign out**.

Signing out does not remove the device from your account; revoke it for that.

## Profile photo

On this site open [Account](/account) → **Upload photo**, or on the phone **Devices → Profile → Change photo**. JPEG, PNG or WebP up to 2 MB. **Remove photo** goes back to your Google picture (if any). Photos are stored in private cloud storage and shown through links that expire after an hour.

## Email verification

The [Account](/account) page shows whether your email is verified and can **Send verification email** again.

## Delete your account

On this site: [Account](/account) → **Delete account**. On the phone: **Devices → Profile → Delete account…**. Type \`DELETE MY ACCOUNT\` to confirm.

| Deleted | Not deleted |
|---|---|
| Your profile and profile photo | Sessions, chats and project files on your PCs |
| The session list and the 7-day history copies | BambooKit Desktop and the phone app themselves |
| Links to your PCs and phones (they are signed out) | Your Google account (only its BambooKit sign-in is removed) |
| Approvals, notifications, activity records, shared session links | |
| Your sign-in (email account, or the Google sign-in for BambooKit) | |

It cannot be undone. If the service is not configured for deletion, nothing is deleted and you see a message.
`,
  },
  {
    slug: "desktop",
    title: "Desktop",
    section: "Apps",
    summary: "Where the agent runs and your sessions live.",
    body: `
## Layout and shortcuts

| Area | Shortcut |
|---|---|
| Command palette | \`Ctrl+K\` or \`Ctrl+Shift+P\` |
| Sidebar (projects, sessions) | \`Ctrl+B\` |
| Open project / new session | \`Ctrl+O\` / \`Ctrl+Shift+S\` |
| Review panel (changes, File map) | \`Ctrl+Shift+R\` |
| File tree / open file | \`Ctrl+\\\` / \`Ctrl+P\` |
| Terminal / new terminal | \`Ctrl+Backtick\` / \`Ctrl+Alt+T\` |
| Choose model / thinking effort | \`Ctrl+'\` / \`Ctrl+Shift+D\` |
| Next / previous agent | \`Ctrl+.\` / \`Ctrl+Shift+.\` |
| MCP servers | \`Ctrl+;\` |
| Settings | \`Ctrl+,\` |

## Sessions and agents

Each conversation is a session in a project; run several at once. **Build** writes code and runs commands, **Plan** analyses and proposes changes without editing. **Undo** and **Redo** in the command palette rewind or restore the last message. New sessions always start here, and this is where you chat with the agent.

## The BambooKit chip

The chip in the title bar shows your account. Click it for:

| Row | Meaning |
|---|---|
| Device | This PC's name in your account |
| BambooKit API | The PC is registered |
| Realtime | The PC's live connection is open: this is what makes it "online" for your phone |
| Agent engine | The local agent is running and BambooKit can see it |

Below are **Paired phones** (with **Disconnect**), **Add mobile device** and **Sign out of BambooKit**.

## What Desktop shares with BambooKit Cloud

When you are signed in, Desktop sends a small index of your projects and sessions (titles, status, model, change counts) and the agent's permission requests. Chats, diffs and files are sent only when your phone or this site asks for them, and are not stored. After each finished turn, Desktop saves a compressed copy of the session history (prompts, timeline, changed lines, tests) to private cloud storage for 7 days, so you can read it while the PC is off. Desktop also pings the hosted service every 10 minutes so it does not fall asleep.

## Help menu

**Documentation** opens these docs; **Support Forum** opens GitHub Discussions; **Export logs** saves logs for a bug report; **Share feedback** and **Report a Bug** open GitHub forms.
`,
  },
  {
    slug: "phone",
    title: "Android",
    section: "Apps",
    summary: "The remote for the agent on your PC.",
    body: `
This page describes **BambooKit for Android 1.0.3**.

## Tabs

| Tab | What it shows |
|---|---|
| **Home** | Your PCs and whether they are online, sessions that are working, approvals waiting, recent notifications |
| **Projects** | Every project on your PCs and its sessions |
| **Approvals** | Permission requests from the agent, with a badge |
| **Devices** | Paired PCs (rename, disconnect, revoke), **Scan QR code**, **App lock**, **Check for updates**, **Profile**, **Sign out** |

## Inside a session

Sessions are **view only**. The tabs:

| Tab | What it shows |
|---|---|
| **Summary** | Status and current action, project, branch and base commit, agent, model, duration, prompts, files changed, lines, tests passed/failed, approvals |
| **Prompts** | Every prompt you gave, with time |
| **Timeline** | Prompts, replies, file reads and edits, commands, test runs, searches, approvals and errors in time order |
| **Changes** | Changed files; open one for **Diff** (each recorded edit), **Before** and **After** |
| **Files** | The file map: every file the session created, edited, deleted or read |
| **Project** | A folder browser of the project; files open in the code viewer (search, copy) |
| **Diagram** | The project drawn as components with their real references; **Rescan** |
| **Chat** | The live conversation |

A badge says where the history comes from: **Live from** your PC, or **Saved copy** when the PC is offline (kept 7 days). Before, After, Project, Diagram and Chat need the PC online. Before is labelled with its source: the session's own record, or the last Git commit.

## Actions

| Action | When |
|---|---|
| **Stop** (asks to confirm) | While the agent is working |
| **Allow once / Always / Deny** | For pending approvals |
| **Reload** | Any time |

That is all: the phone does not send messages, start sessions, edit files or share. If the PC is offline, Stop waits up to 5 minutes (**PC offline, queued**).

## Profile and App lock

**Devices → Profile** shows your name, email, sign-in method and verification, lets you change or remove your photo, sign out, or delete the account. **Devices → App lock** asks for your fingerprint, face or screen lock when the app opens; see [App lock](/docs/app-lock).

## Sign-in

Email and password (sign in, create account, forgot password). Google sign-in is not available on the phone yet.

## Notifications and storage

Notifications (Approval required, Agent finished, Agent failed) arrive while the app is running; see [Notifications](/docs/notifications). Your sign-in is stored encrypted with the Android Keystore and app data is excluded from backups.

## Permissions the app asks for

Internet, notifications (Android 13+), camera (QR scan), biometrics (App lock) and "install unknown apps" (only when you install an update; Android always asks you to confirm).

## Earlier version (1.0.2)

Android 1.0.2 had a Chat view with a message box, Continue, Retry, Rewind and Share for sessions continued on the PC, and no history tabs, profile or app lock. Update from **Devices → Check for updates**.
`,
  },
  {
    slug: "web",
    title: "Website",
    section: "Apps",
    summary: "A view-only window on your PCs, sessions and approvals.",
    body: `
Sign in at [bambookit-web.onrender.com](https://bambookit-web.onrender.com/signin) with your BambooKit account (email and password, or Google).

| Page | What it shows |
|---|---|
| [Sessions](/sessions) | Your PCs with online status and every session: status, project, model, changes, pending approvals. Search and filter by PC or status |
| Session | Tabs **Summary**, **Prompts**, **Timeline**, **Changes** (Diff, Before, After), **Files** and **Chat**; updated live while the agent works |
| [Devices](/devices) | Your PCs and phones, online state and last seen |
| [Approvals](/approvals) | Permission requests and questions from the agent, pending and answered. Answer them here |
| [Account](/account) | Your profile, nickname, sign-in method, email verification, profile photo, browser notifications and **Delete account** |
| [Setup](/welcome) | The steps to connect your first PC and phone |

## View only

The website does not send messages, stop runs, browse the project tree or manage devices. Chat in BambooKit on your PC or in the Android app. The website can answer approvals and questions, and a session's **Continue on PC** button asks your PC (when it is online) to open that session in BambooKit. Your own account (nickname, photo, deletion) is managed on the [Account](/account) page.

While the website is open, notifications (questions, approvals, finished or failed sessions) appear in the corner of the page. Turn on browser notifications on the [Account](/account) page to also get them from your browser.

## Session history

A badge shows **Live from PC** or **Saved copy · time · kept 7 days**. When your PC is offline, the history comes from the copy it saved after its last turn; Before and After and the live chat need the PC online. Before is labelled **From the session record** or **From Git, as committed before this session**.

## When a chat does not load

| Message | Meaning | What to do |
|---|---|---|
| Your PC is offline | The PC is off, asleep, or BambooKit Desktop is closed or signed out, and no saved copy from the last 7 days exists | Start Desktop and sign in; the page reloads by itself when the PC is back |
| Your PC didn't answer in time | No answer within 20 seconds | Press **Retry** |
| Couldn't load the chat | Another error, shown on the page | **Retry**; see [Troubleshooting](/docs/troubleshooting) |

## Shared sessions

Links like \`https://bambookit-web.onrender.com/share/AbC123xy\` open a read-only copy of a published session without signing in. See [Sharing a session](/docs/sharing).
`,
  },
  {
    slug: "pairing",
    title: "Pairing your phone",
    section: "Features",
    summary: "Link your phone to your PC with a one-time QR code.",
    body: `
## Pair

1. On the PC: click the **BambooKit** chip → **Add mobile device**. A QR code appears with a countdown.
2. On the phone: **Devices → Scan QR code** (or **Pair a PC** on Home).
3. The PC shows a notification that the phone is connected, and the phone lists the PC.

Both devices must be signed in to the **same account**.

## The QR code

| Property | Value |
|---|---|
| Content | \`bambookit://pair?t=<random one-time token>\` |
| Valid for | 2 minutes; a new code appears automatically, or press **New code** |
| Uses | Once. Creating a new code cancels the previous unused one |
| Contains | No password and no session token. BambooKit Cloud stores only a hash of it |

## How devices prove who they are

- Each PC creates its own device key the first time it starts and keeps it encrypted by Windows. Every request from the PC is signed with that key, so nobody can impersonate your PC with a copied password or token.
- Each phone gets a random installation id. A phone can only send actions to PCs it is paired with.

\`\`\`Diagram
PC ── "give me a pairing code" (signed) ──► Cloud ── code (2 min, one use) ──► PC shows QR
Phone ── scans QR, sends code ──────────► Cloud checks: valid, unused, same account
Cloud ── "paired" ──► PC and phone
\`\`\`

## Disconnect, rename, revoke

| Action | Where | Effect |
|---|---|---|
| Disconnect | PC: Paired phones. Phone: Devices | Removes the pairing; scan a new code to pair again |
| Rename | Phone: Devices | Changes the name shown everywhere |
| Revoke | Phone: Devices | Removes the device from your account immediately and for good |

A revoked PC shows "This desktop was revoked from your BambooKit account". See [Troubleshooting](/docs/troubleshooting) to set it up again.

## Pairing errors

| Message | Fix |
|---|---|
| This QR code has expired | Scan the new code |
| This QR code was already used | Press **New code** on the PC |
| This desktop is signed in to a different BambooKit account | Use the same account (email and Google are different accounts) |
| That is not a BambooKit pairing code | Scan the code from **Add mobile device** |
`,
  },
  {
    slug: "projects",
    title: "Projects",
    section: "Features",
    summary: "Folders on your PC that you work in.",
    body: `
A **project** is a folder you opened in BambooKit Desktop (**Add project**, \`Ctrl+O\`). Each project belongs to the PC it was opened on.

BambooKit Cloud knows only the project's name, its folder path on the PC and its current Git branch, so the phone and this site can list it. No file contents are stored.

## On the phone and the web

- **Phone → Projects** lists every project with its PC and branch, and the sessions in it. In a session, the **Project** view browses the project's folders and files live from the PC.
- **Web → Sessions** shows each session's project.

## Git branch and worktrees

For Git repositories the current branch is shown and updates when it changes. When starting a session in Desktop you can run it in the project folder or **Create new worktree**, which isolates the agent's work on its own branch. A project without Git can get one with **Create Git repository** in the review panel.

## Starting work

New sessions start only on the PC. Open the project in Desktop and send the first prompt there.
`,
  },
  {
    slug: "sessions",
    title: "Sessions and history",
    section: "Features",
    summary: "What a session is, where its history lives and what its status means.",
    body: `
A **session** is one conversation with the agent in one project.

## Where the history is stored

- The full session (your prompts, the agent's replies and reasoning, every tool step and file change) is stored **on your PC**.
- BambooKit Cloud keeps a small index so your phone and this site can list sessions: title, status, project, model, agent, change counts, what the agent is doing right now, and times.
- When you open a session elsewhere, its history and chat are read live from your PC.
- After each finished turn, your PC also saves a **compressed copy of the history** to private cloud storage, kept **7 days** after the last save. When the PC is offline, the phone and this site show that copy (marked **Saved copy**).

## Statuses

| Status | Meaning |
|---|---|
| Working | The agent is running. The current action is shown, e.g. Running npm test, Editing src/app.ts, Waiting for approval |
| Retrying | The model provider failed and the agent is retrying |
| Error | The last run failed; the message explains why |
| Idle | Waiting for your next message |

You get a notification when a session finishes (**Agent finished**) or fails (**Agent failed**).

## What the history contains

| Part | Content |
|---|---|
| Summary | Status, project, branch and the commit it started from, agent, model, duration (active work time), prompts, files changed, lines added and removed, tests passed and failed |
| Prompts | Everything you asked, with times |
| Timeline | Prompts, replies, file reads and edits, commands, test runs, searches, sub-agents, errors, in time order |
| Changes | Each changed file (added, modified, deleted, renamed) with every edit's diff |
| Tests | Test commands the agent ran (npm test, pytest, go test, cargo test and similar) with passed or failed by exit code |

Everything comes from what the agent recorded on your PC; nothing is estimated.

## Before and After

For a changed file, **Before** and **After** show the whole file. After is the file as it is now on your PC. Before is rebuilt by undoing the session's own recorded edits; if that is not possible exactly (the file also changed outside the session), it is the version in the last Git commit, and labelled so. New files have no Before. Before and After are read live and need the PC online; they are never stored in the cloud.

## Changes when change tracking is off

When the agent's own change tracking (snapshots) is off, BambooKit builds the change list from the agent's edits, so it still works.

## Rewind

In Desktop, **Undo** and **Redo** in the command palette rewind or restore the last message. Rewinding returns the conversation (and, where the agent keeps snapshots, the files) to before that message.

## From the phone

The phone and this site are view only. The phone can **Stop** a running agent and answer approvals; you chat with the agent on the PC.

## Deleting

Delete a session in Desktop; it disappears from the phone and this site. Its saved copy is removed within 7 days.
`,
  },
  {
    slug: "files",
    title: "Files and project browser",
    section: "Features",
    summary: "See which files a session touched and browse the project, read-only.",
    body: `
Everything here is read live from your PC when you open it and is not stored by BambooKit Cloud. Files are **view only** from the phone and the website.

## File map

The file map lists every file a session touched: created, edited, deleted or only read, with line counts and the turns in which it was touched. In Desktop it is the **File map** tab of the review panel (with **Changed** and **Read only** filters); on the phone and this site it is the session's **Files** tab.

## Project browser and code viewer (phone)

The session's **Project** view browses the project folder. Tap a file to open it in the code viewer, which has syntax colouring, **Find in file**, **Copy path** and **Copy all**.

| Rule | Behaviour |
|---|---|
| Folder boundary | Only files inside the session's project folder can be opened, also through links |
| Hidden | The \`.git\` folder |
| Large folders | The first 2,000 entries are shown |
| File size | Up to 1 MB; open larger files on the PC |
| Binary files | Not shown |

## Before and After

For files a session changed, the session's **Changes** tab on the phone and on this site shows the full file before and after the session, read live from the PC. See [Sessions and history](/docs/sessions#before-and-after).

## No remote editing

The phone and this site cannot change files. Edit in Desktop.
`,
  },
  {
    slug: "diagram",
    title: "Project diagram",
    section: "Features",
    summary: "Your project drawn as components and the references between them.",
    body: `
The project diagram shows the project's folders or files as boxes and draws an arrow wherever code really references other code. It is computed on your PC each time you open it or press **Rescan**.

Where: Desktop review panel → **File map** → **Project diagram**; phone session → **Diagram**.

\`\`\`Diagram
   index.html            entry points (nothing points at them) on top
       │ 2
     src/  ──1──►  styles/
       │ 5          arrow label = number of references
     lib/
\`\`\`

## How it is built

- Up to 800 source files are collected; folders such as node_modules, .git, dist, build, .next, target, vendor and virtual environments are skipped.
- References are read from the first 300 files: JavaScript/TypeScript imports and requires, HTML script/link/a/iframe sources, CSS @import and Python imports.
- Small projects (up to 40 files) show every file; larger ones are grouped by top-level folder.
- Components that nothing points at come first, then what they use.
- On the phone, components containing files the session touched are highlighted.

## Limits

References are found by pattern matching, not a compiler: path aliases (like @/lib) and package imports are not resolved. Languages without a rule (Go, Rust, Java, Kotlin and others) appear as boxes without arrows. Very large projects may take longer than the 20-second answer limit; press **Retry**.
`,
  },
  {
    slug: "approvals",
    title: "Approvals and permissions",
    section: "Features",
    summary: "Answer the agent's permission requests from your phone.",
    body: `
The agent's permission rules decide what it may do on its own. When a rule says **ask**, the agent pauses and the request appears in Desktop and on your phone as an **approval**. The phone can only answer requests the agent made; it cannot grant anything by itself.

## Set the rules

In Desktop, **Settings → Permissions** sets each tool to **Allow**, **Ask** or **Deny**. Typical tools that ask: running shell commands, editing files, fetching URLs.

## Answer

| Button | Effect |
|---|---|
| **Allow once** | This one action proceeds |
| **Always** | This action and matching ones are allowed for the rest of the session |
| **Deny** | The action is refused and the agent is told |

Answer on the phone in the **Approvals** tab or from the notification, or on this website's [Approvals](/approvals) page (also at the top of the session page).

## Questions

Sometimes the agent asks a question instead, for example which option to use. A question shows one or more prompts with options (choose one, or several when allowed) and, when allowed, a box to type your own answer. **Submit** sends the answers once every question is answered; **Dismiss** tells the agent you won't answer.

\`\`\`Diagram
Agent asks ──► PC ──► Cloud: "Approval required" ──► phone notification
Phone: Allow once ──► Cloud ──► PC ──► agent continues ──► approval shows "Allowed once"
\`\`\`

## Statuses

| Status | Meaning |
|---|---|
| Pending | Waiting for an answer |
| Responding | Your answer is on its way to the PC |
| Approved / Rejected | The agent confirmed your answer |
| Expired | The request no longer exists on the PC (answered there, stopped, or Desktop restarted) |

If you answer while the PC is offline, the answer waits up to 5 minutes. If the approval then stays at Responding, answer it in Desktop on the PC.
`,
  },
  {
    slug: "notifications",
    title: "Notifications",
    section: "Features",
    summary: "Know when the agent needs you or is done.",
    body: `
| Notification | When |
|---|---|
| **Approval required** | The agent asks for permission |
| **BambooKit has a question** | The agent asks you a question |
| **Agent finished** | A session goes from working to idle |
| **Agent failed** | A session ends with an error |

Notifications carry only ids and a short text, never code or secrets.

## On the phone

The app shows them as Android notifications in the **Agent activity** channel; tap one to open the session. They are also listed on **Home**. Allow notifications when the app asks (Android 13+), or later in Android Settings → Apps → BambooKit.

Notifications arrive over the app's live connection, so the app must be running. There is no push service yet: if Android stopped the app in the background, you see the notifications the next time you open it. Disabling battery optimisation for BambooKit helps.

## On the PC

Desktop has its own notifications and sounds in **Settings → General** (Agent, Permissions, Errors), and tells you when a phone finishes pairing.
`,
  },
  {
    slug: "updates",
    title: "Updates",
    section: "Features",
    summary: "How Desktop and the Android app stay up to date.",
    body: `
## Desktop

BambooKit Desktop checks GitHub Releases when it starts, downloads a newer version in the background and then asks you to **Restart** (or later). You can also choose **Check for Updates...** in the app menu. Pre-releases are ignored.

## Android

The app checks the BambooKit for Android releases at most every 6 hours and when you press **Devices → Check for updates**. When a new version exists, a banner offers **Update** or **Skip this version**. The app downloads the APK (with progress) and opens Android's installer; you always confirm the install. The first time, Android asks you to allow BambooKit to install apps.

Every release is signed with the same BambooKit key, so updates install over the existing app and keep your sign-in.

## Website and cloud

This website and BambooKit Cloud are updated on the server; there is nothing to install.
`,
  },
  {
    slug: "sharing",
    title: "Sharing a session",
    section: "Features",
    summary: "Publish a read-only copy of a session with a link.",
    body: `
In Desktop open the command palette → **Share session** (the link is copied). You get a link like:

\`\`\`text
https://bambookit-web.onrender.com/share/AbC123xy
\`\`\`

Anyone with the link can read the conversation, tool steps and the list of changed files. The shared copy updates as the session continues on the PC. Choose **Unshare session** in Desktop to delete it. (Android 1.0.2 could also publish and unpublish; Android 1.0.3 is view only.)

Publishing is the one case where a copy of a session is stored by BambooKit Cloud, and only until you unpublish it. Only your PC, which holds the secret for that link, can change or delete it. Deleting your account deletes your shared links.
`,
  },
  {
    slug: "app-lock",
    title: "App lock",
    section: "Features",
    summary: "Lock the Android app with your fingerprint, face or screen lock.",
    body: `
**BambooKit for Android 1.0.3** can lock the app with your fingerprint, face or the phone's screen lock (PIN, pattern or password). Desktop and this website have no app lock of their own; they rely on your Windows sign-in and browser.

## Turn it on

**Devices → App lock → Turn on App lock**, then confirm it's you. The phone must have a screen lock; if it has none, the app asks you to set one in Android Settings first.

## How it works

\`\`\`Diagram
App opens ─────────────────────────────► locked
In background, back within 30 seconds ─► stays unlocked
In background, back after 30 seconds ──► locked
Locked: Unlock → fingerprint, face or screen lock → app
\`\`\`

- Android does the check; BambooKit stores only whether App lock is on and never sees your fingerprint, face or PIN.
- While locked, the whole app is covered and hidden from accessibility services. Notifications and the live connection keep working.
- If you later remove the phone's screen lock, the app asks you to set one again or turn App lock off.

## Other protection

| Layer | Desktop | Android |
|---|---|---|
| Device lock | Your Windows password | Your phone's screen lock, plus App lock |
| Stored sign-in | Encrypted by Windows for your user | Encrypted with the Android Keystore |
| Backups | — | App data is excluded from Android backups |

## If a phone is lost

1. On another device, **revoke** it: its access ends immediately.
2. Change your password with **Forgot password?** (email accounts), or remove access in your Google account.
`,
  },
  {
    slug: "models",
    title: "Models and providers",
    section: "Desktop tools",
    summary: "Free models out of the box, or bring your own keys.",
    body: `
## Free models

The **BambooKit** provider includes free models. Select one in the model picker (\`Ctrl+'\`); there is nothing to configure. Models that are listed by the free service but cannot currently answer are hidden. Free models can be busy; if one fails, pick another.

## Your own keys

**Settings → Providers**, or command palette → **Connect provider**. Choose a provider (OpenAI, Anthropic, Google, OpenRouter, Groq, Mistral, xAI, local Ollama and many more) and paste the key.

| Shown as | Meaning |
|---|---|
| Environment | The key comes from an environment variable on your PC, e.g. \`OPENAI_API_KEY\` |
| Config | The provider is defined in the agent's configuration file |
| Custom | Added with **Add an OpenAI-compatible provider by base URL** |

Keys are stored on your PC only. Requests go straight from your PC to the provider and never pass through BambooKit Cloud.

## Tuning

- \`Ctrl+Shift+D\` cycles the thinking effort of models that support it.
- \`Ctrl+.\` switches agent (Build, Plan, or your own).
- Messages sent from the phone use the model and agent of the session's last prompt.
`,
  },
  {
    slug: "mcp-tools",
    title: "MCP servers and tools",
    section: "Desktop tools",
    summary: "The agent's tools, and adding more with MCP servers.",
    body: `
## Built-in tools

| Tool | What it does | Shown on the phone as |
|---|---|---|
| read | Read a file | Reading path |
| write | Create or overwrite a file | Editing path |
| edit, multiedit | Change text in a file | Editing path |
| apply_patch | Change several files at once | Editing … |
| bash | Run a command in the project | Running command |
| grep, glob | Search contents or file names | Searching pattern |

Every tool follows your rules in **Settings → Permissions** (Allow, Ask, Deny). An Ask becomes an [approval](/docs/approvals) you can answer from your phone. BambooKit never runs commands itself: actions from the phone are passed to the agent, so its tools and rules stay in charge.

## MCP servers

MCP servers give the agent extra tools, such as databases, browsers or issue trackers. Open the MCP list with \`Ctrl+;\` (**Toggle MCPs**): it shows each server as connected, failed, needs auth or disabled. Toggle servers there, and click **needs auth** to sign in to servers that use OAuth.

Add servers in the agent's configuration file (the **Settings → MCP** page is not editable yet). Example:

\`\`\`json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "C:\\\\Users\\\\me\\\\code"],
      "enabled": true
    },
    "issues": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer <YOUR_TOKEN>" }
    }
  }
}
\`\`\`

There is one global configuration file for your Windows user and, optionally, one in a project's root folder; their exact locations are listed under **Agent engine → Configuration files** in the [BambooKit documentation repository](https://github.com/BambooKit/bambookit-docs/blob/main/docs/architecture/agent-engine.md#configuration-files). MCP servers run on your PC with your user's rights; the phone sees their tool calls but cannot add or start servers. Keep tokens out of files you commit.
`,
  },
  {
    slug: "terminal-git",
    title: "Terminal and Git",
    section: "Desktop tools",
    summary: "The built-in terminal and Git review, on the PC only.",
    body: `
## Terminal

Toggle the terminal with \`Ctrl+Backtick\` and open more tabs with \`Ctrl+Alt+T\`. Terminals start in the project folder. What you type there is not permission-checked and does not appear in the session; commands the agent runs appear as tool steps. The phone and this site never get a shell.

## Git review

Open the review panel with \`Ctrl+Shift+R\`. For Git projects it compares in three modes:

| Mode | Shows |
|---|---|
| Uncommitted | Working-tree changes |
| Branch | Changes on the current branch against the default branch |
| Last turn | What the agent changed in its latest turn |

Projects without Git show **Create Git repository**.

## Worktrees

When starting a session you can choose **Create new worktree** to run it on its own branch in a separate folder, keeping your checkout untouched. A project can have a startup script (for example \`bun install\`) that runs in each new worktree.

## What BambooKit does not do

BambooKit does not commit, push or pull by itself. The agent may run Git commands through its shell tool, under your permission rules (for example, ask before \`git push\`).
`,
  },
  {
    slug: "security",
    title: "Security and privacy",
    section: "Reference",
    summary: "What BambooKit stores, where, and how your devices and account are protected.",
    body: `
## What is stored where

| Data | Where | Kept |
|---|---|---|
| Chats, tool steps, diffs, project files | Your PC | Until you delete them |
| Model API keys | Your PC | Until you remove them |
| Sign-in | Each device, encrypted (Windows DPAPI, Android Keystore) | Until sign-out |
| Session index: titles, project names and folder paths, status, model, change counts | BambooKit Cloud | Until deleted on the PC or account deletion |
| Approvals: what the agent asked (e.g. the command) and your answer | BambooKit Cloud | Kept as history |
| Devices: name, platform, version, the PC's public key | BambooKit Cloud | Until revoked or account deletion |
| Actions sent from the phone | BambooKit Cloud | Message text removed when done; record deleted after 15 minutes |
| Realtime events | BambooKit Cloud | 14 days |
| Shared sessions | BambooKit Cloud, public with the link | Until you unpublish |
| Profile photo | Private cloud storage under your account's folder | Until removed |
| Session history copy: prompts, timeline, changed lines (diffs), test commands | Private cloud storage under your account's folder, saved by your PC after each turn | 7 days after the last save |

Chats, full files and Before/After versions that your phone or this site reads pass through BambooKit Cloud in memory and are not saved. The history copy is the one place where your prompts and the changed lines are stored in the cloud, for 7 days.

## How it is protected

- **No open ports.** The agent listens on 127.0.0.1 only. Your PC connects out to BambooKit Cloud; phones and this site never connect to the PC.
- **Verified sign-ins.** Every request carries a signed token from Supabase or Google (Firebase), checked against their public keys. BambooKit never sees your password.
- **Device keys.** Each PC signs every request with its own Ed25519 key, stored encrypted by Windows and never sent anywhere.
- **Pairing.** QR codes work once, for two minutes, and only for the same account. A phone can only act on PCs it is paired with.
- **Fixed remote actions.** The phone can Stop a run and answer approvals; everything else on the phone and this site is read only. There is no remote shell, no remote file editing and no remote session start.
- **Stale actions never run.** An action not delivered within 5 minutes is dropped.
- **Folder boundary.** Remote file views are limited to the session's project folder, including through links.
- **Cloud storage.** Only BambooKit Cloud holds the storage credentials; devices get links that expire after 5 minutes (photos: 1 hour), limited to their own account's folder.
- **Revocation.** Revoke a phone or PC at any time; its access ends immediately.
- **Website.** A static site with no server code, served with anti-framing and no-sniff headers. Shared-session pages escape all content.

## Report a security problem

Do not open a public issue. Email **bambookit.support@gmail.com** with the details.
`,
  },
  {
    slug: "realtime",
    title: "Live updates",
    section: "Reference",
    summary: "How changes reach your phone and this site in real time.",
    body: `
Every signed-in device keeps one live connection (Server-Sent Events) to BambooKit Cloud. Your PC sends changes as they happen; the cloud forwards them to your other devices.

## What is live

| Update | Saved? |
|---|---|
| Session status, title, current action, change counts | Yes, in the index |
| New and answered approvals | Yes |
| Notifications | Yes |
| Devices coming online or going offline, pairing, revocation | Yes |
| Chat text as the agent writes, tool steps, changed-file lists | No, live only |

Saved updates are numbered. When a device reconnects it asks for everything after the last number it saw, so nothing saved is lost while it was offline (up to 14 days). Live-only updates are not replayed; the app simply reloads the chat from the PC.

## Online and offline

- A PC is **online** while its live connection is open, which requires BambooKit Desktop running and signed in. Sleep, hibernation and network loss make it offline.
- A phone is online while its app is connected, or for 2 minutes after its last request.
- A connection sends a heartbeat every 20 seconds and reconnects by itself (after 1 to 30 seconds).

## Reading from the PC

When you open a chat, file, diff, file map or diagram, BambooKit Cloud asks your PC over its connection and passes the answer back within 20 seconds. Nothing is saved on the way.
`,
  },
  {
    slug: "developers",
    title: "For developers",
    section: "Reference",
    summary: "The BambooKit API, SDK and command-line tool.",
    body: `
The complete developer documentation (every API route with request and response examples, architecture diagrams, deployment, environment variables and the release process) is in the [bambookit-docs repository](https://github.com/BambooKit/bambookit-docs).

## API

Base URL \`https://bambookit-api.onrender.com\`. Send \`Authorization: Bearer <access token>\` (the Supabase access token of an email account, or the Firebase ID token of a Google account). Responses are \`{"data": …}\`; errors are \`{"error": {"code", "message"}, "requestId"}\`.

| Area | Routes |
|---|---|
| Health | \`GET /health\`, \`GET /ready\` |
| Profile | \`GET /v1/me\`, \`POST /v1/me/avatar-upload\`, \`POST /v1/me/avatar\`, \`DELETE /v1/me/avatar\`, \`DELETE /v1/me\` |
| Overview | \`GET /v1/overview\`, \`GET /v1/activity\` |
| Devices and pairing | \`GET /v1/devices\`, \`PATCH /v1/devices/:id\`, \`POST /v1/devices/:id/revoke\`, \`POST /v1/devices/:id/unlink\`, \`POST /v1/pairing/claim\` |
| Projects and sessions | \`GET /v1/projects\`, \`GET /v1/sessions\`, \`GET /v1/sessions/:id\` |
| Session history | \`GET /v1/sessions/:id/history\` (live, or the 7-day copy), \`GET /v1/sessions/:id/file-versions?path=\` (before/after) |
| Live from the PC | \`GET /v1/sessions/:id/parts\`, \`/changes\`, \`/filemap\`, \`/diagram\`, \`/tree?path=\`, \`/file?path=\` |
| Actions | \`POST /v1/sessions/:id/commands\`, \`GET /v1/commands/:id\` |
| Approvals | \`GET /v1/approvals\`, \`POST /v1/approvals/:id/respond\` |
| Notifications | \`GET /v1/notifications\`, \`POST /v1/notifications/read-all\` |
| Live updates | \`GET /v1/realtime/stream?after=<seq>\` |

Example:

\`\`\`powershell
curl.exe https://bambookit-api.onrender.com/v1/sessions?active=true -H "Authorization: Bearer <access token>"
\`\`\`

## SDK

\`@bambookit/sdk\` is a typed TypeScript client (build it from the [bambookit-sdk](https://github.com/BambooKit/bambookit-sdk) repository):

\`\`\`ts
import { BambooKit } from "@bambookit/sdk";
const bk = new BambooKit({ baseUrl: "https://bambookit-api.onrender.com", accessToken: "<access token>" });
const busy = await bk.sessions.list({ active: true });
const pending = await bk.approvals.list();
\`\`\`

## Command-line tool

\`bamboo\` (from [bambookit-cli](https://github.com/BambooKit/bambookit-cli)) uses \`BAMBOOKIT_BASE_URL\` and \`BAMBOOKIT_ACCESS_TOKEN\`:

| Command | Does |
|---|---|
| \`bamboo doctor\` | Checks the API and your token |
| \`bamboo project list\` | Projects |
| \`bamboo session list -a\` | Working sessions |
| \`bamboo session show <id>\` | Chat and changed files |
| \`bamboo session send <id> <text>\` / \`stop <id>\` | Message or stop |
| \`bamboo approval list\` / \`approve <id> [--always]\` / \`reject <id>\` | Approvals |
| \`bamboo device list\` / \`revoke <id>\` | Devices |

Add \`--json\` for machine-readable output.
`,
  },
  {
    slug: "configuration",
    title: "Configuration",
    section: "Reference",
    summary: "Settings for running your own copy of BambooKit.",
    body: `
Values marked **secret** belong only in the API's server environment. Everything else is public and may be built into apps; never put a secret into an app or website setting. Use placeholders like the ones below; the full list is in the developer documentation.

## API — environment

| Variable | Secret | Purpose |
|---|---|---|
| \`SUPABASE_URL\` | No | Supabase project URL (verifies email sign-ins) |
| \`SUPABASE_ANON_KEY\` | No | Only for older projects that sign tokens with a shared secret |
| \`FIREBASE_PROJECT_ID\` | No | Accept Google (Firebase) sign-ins of this project |
| \`POSTGRES_URL\` | **Yes** | Database; required on hosts whose disk is wiped on restart |
| \`DATABASE_PATH\` | No | SQLite file for local use, default \`./data/bambookit.db\` |
| \`CORS_ORIGINS\` | No | Allowed browser origins, e.g. \`https://bambookit-web.onrender.com,http://localhost:3000\` |
| \`PUBLIC_SHARE_BASE_URL\` | No | Origin used in share links |
| \`CLOUDFLARE_ACCOUNT_ID\`, \`R2_BUCKET_NAME\` | No | Cloud storage location |
| \`R2_ACCESS_KEY_ID\`, \`R2_SECRET_ACCESS_KEY\` | **Yes** | Cloud storage credentials |
| \`SESSION_SNAPSHOT_DAYS\` | No | Days history copies are kept, default 7 |
| \`SUPABASE_SERVICE_ROLE_KEY\` | **Yes** | Needed to delete email accounts |
| \`FIREBASE_API_KEY\` | No | Needed to delete Google accounts |

\`\`\`text
SUPABASE_URL=https://<your-project-ref>.supabase.co
POSTGRES_URL=postgresql://<user>:<password>@<host>:5432/postgres
R2_SECRET_ACCESS_KEY=<r2-secret>
\`\`\`

## Website — build time

| Variable | Purpose |
|---|---|
| \`NEXT_PUBLIC_API_URL\` | API address, default \`https://bambookit-api.onrender.com\` |
| \`NEXT_PUBLIC_SUPABASE_URL\`, \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\` | Email sign-in |
| \`NEXT_PUBLIC_FIREBASE_API_KEY\`, \`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\`, \`NEXT_PUBLIC_FIREBASE_PROJECT_ID\` | Google sign-in (all three, or the button is hidden) |

## Desktop — \`packages/desktop/.env.bambookit\`

| Variable | Purpose |
|---|---|
| \`BAMBOOKIT_API_URL\` | API address; default \`https://bambookit-api.onrender.com\` (\`http://localhost:8080\` for development builds) |
| \`BAMBOOKIT_SUPABASE_URL\`, \`BAMBOOKIT_SUPABASE_ANON_KEY\` | Email sign-in |
| \`BAMBOOKIT_FIREBASE_API_KEY\`, \`BAMBOOKIT_FIREBASE_PROJECT_ID\`, \`BAMBOOKIT_FIREBASE_AUTH_DOMAIN\` | Google sign-in |

## Android — \`local.properties\`

| Key | Purpose |
|---|---|
| \`bambookit.supabaseUrl\`, \`bambookit.supabaseAnonKey\` | Sign-in |
| \`bambookit.apiUrl.release\` | API for release builds, default the hosted API |
| \`bambookit.apiUrl.debug\` | API for debug builds, e.g. \`http://127.0.0.1:8080\` over USB |

Release signing keys live outside the repository in \`~/.gradle/gradle.properties\`.

## Agent settings

Models, agents, MCP servers and permission rules are configured in **Settings** inside BambooKit Desktop and in the agent's configuration file.
`,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    section: "Help",
    summary: "Fixes for the most common problems.",
    body: `
Start with the **BambooKit** chip in Desktop: **BambooKit API**, **Realtime** and **Agent engine** should all say connected.

\`\`\`Diagram
"PC offline" on phone or web?
 ├─ Desktop running and signed in on that PC?   no → start it and sign in
 ├─ Chip shows Realtime connected?              no → check internet; wait a minute (service waking up)
 └─ Same account on both devices?               no → email and Google are different accounts
\`\`\`

## "Your PC is offline" when opening a session

Chats, files and Before/After are stored on your PC and read from it live, and no saved history copy from the last 7 days exists for this session. Turn the PC on, open BambooKit Desktop and make sure it is signed in to the same account. Sleep counts as offline. The session loads by itself when the PC reconnects.

## "Your PC didn't answer in time"

The PC took more than 20 seconds, usually for the diagram of a very large project or on a slow connection. Press **Retry**.

## The website or app is slow the first time

The hosted service sleeps when idle; the first request can take up to a minute while it wakes.

## I can't type in a session on my phone

The phone and this site are view only: chat with the agent in BambooKit Desktop. From the phone you can Stop a run and answer approvals.

## "Saved copy" instead of "Live from PC"

Your PC is offline, so you see the history copy it saved after its last turn (up to 7 days old). Before and After, the chat, the project browser and the diagram need the PC online.

## Profile photo upload fails on this site

The service's cloud storage must allow uploads from this website. Try again later or upload the photo from the phone (**Devices → Profile**).

## An action stays "PC offline, queued"

Your PC is not connected. If it does not reconnect within 5 minutes the action is dropped and never runs later; send it again when the PC is back.

## An approval stays "Responding"

You answered while the PC was offline. Answer it in Desktop on the PC.

## No PCs or sessions on my phone

You are probably signed in to the other account: email and Google are separate accounts, and the phone supports only email for now. Sign in on the PC with the same email account.

## Pairing errors

| Message | Fix |
|---|---|
| This QR code has expired | Codes last 2 minutes; scan the new one |
| This QR code was already used | Press **New code** on the PC |
| This desktop is signed in to a different BambooKit account | Use the same account on both |
| This phone was revoked | Uninstall and reinstall the app, then pair again |

## "This desktop was revoked from your BambooKit account"

The PC was revoked from another device and its key cannot be used again. Sign out, quit Desktop, delete the file \`%APPDATA%\\BambooKit Desktop\\bambookit\\device-identity.bin\`, start Desktop and sign in. The PC gets a new identity; pair your phone again.

## Google sign-in on the PC fails

| Message | Fix |
|---|---|
| Cannot start the sign-in page | Another program uses port 54329; close it |
| Google sign-in was cancelled | Try again and finish in the browser |
| Google sign-in timed out | Finish within 5 minutes |

## No notifications on the phone

Allow notifications for BambooKit in Android settings. The app must be running to receive them; turning off battery optimisation for BambooKit helps.

## A model returns an error

Pick another model. Free models are sometimes busy; for your own provider, check the key in Settings → Providers.

## Realtime keeps reconnecting on the PC

Check the internet connection and any proxy or firewall that blocks \`bambookit-api.onrender.com\`. Make sure the Windows clock is correct: requests signed with a clock more than 5 minutes off are rejected.

## Reporting a bug

Use Help → **Export logs** in Desktop and attach the file to a [bug report](https://github.com/BambooKit/bambookit-application/issues/new?template=bug_report.yml). If an error showed a request id, include it.
`,
  },
  {
    slug: "faq",
    title: "FAQ",
    section: "Help",
    summary: "Short answers to common questions.",
    body: `
## Does BambooKit upload my code?

No. Project files and chats stay on your PC. When your phone opens one, it is passed through BambooKit Cloud without being saved. The cloud does keep a small index: session titles, project names and folder paths, status, and the approvals the agent asked for.

## Does BambooKit see my model keys?

No. Keys stay on your PC and model requests go directly from your PC to the provider.

## Is it free?

The apps are free and the BambooKit provider includes free models. Your own provider keys are billed by that provider.

## Can I start a session from my phone?

No. Start and chat on the PC; from the phone you can follow a session, stop it and answer approvals.

## Can I read sessions while my PC is off?

Yes, for 7 days after the PC last saved them: the summary, prompts, timeline, changes with diffs and tests. The live chat, Before and After, project files and the diagram need the PC online.

## Is there an iPhone, Mac or Linux version?

No. Desktop is for Windows (64-bit) and the phone app is for Android.

## Can I use Google sign-in on the phone?

Not in the current version. Use an email account on all your devices if you want to use the phone.

## Does the phone need to be on the same Wi-Fi as the PC?

No. Both connect to BambooKit Cloud over the internet; no port forwarding or VPN.

## Is there a PIN or fingerprint lock?

Yes, on Android: **Devices → App lock**. See [App lock](/docs/app-lock).

## How do I delete my account?

On this site under [Account](/account), or on the phone under **Devices → Profile**. Sessions on your PCs are not affected. See [Accounts and sign-in](/docs/sign-in#delete-your-account).

## Where can I get help?

Ask in [GitHub Discussions](https://github.com/BambooKit/bambookit-application/discussions), [report a bug](https://github.com/BambooKit/bambookit-application/issues/new?template=bug_report.yml) or [suggest a feature](https://github.com/BambooKit/bambookit-application/issues/new?template=feature_request.yml). A BambooKit Discord community is planned; until it opens, GitHub Discussions is the place for questions.
`,
  },
];

/** Docs in sidebar order (section by section). Used for the sidebar and previous/next links. */
export const ORDERED_DOCS: DocPage[] = SECTIONS.flatMap((section) => DOCS.filter((d) => d.section === section));

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((d) => d.slug === slug);
}
