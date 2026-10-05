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
- **BambooKit for Android** is the remote. Follow sessions live (todos, timeline, the live diagram, full diffs), answer the agent's approvals and questions, chat in a session after **Continue on PC**, rename and like sessions, add provider API keys to your PC, and see your profile statistics and achievements.
- **This website** shows your PCs, sessions with their history, approvals and questions when you sign in, and has your account page. It can answer approvals and questions, rename and like sessions and ask your PC to continue a session; chatting happens on the PC or the phone.

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
| Start a new session | Yes | Yes (in a project) | No |
| See PCs, projects and sessions | Yes | Yes | Yes |
| Session history: summary, prompts, timeline, diffs, before/after, tests | Yes | Yes | Yes |
| Live todos and live diagram | Yes | Yes | No |
| Read a session while its PC is off (7-day copy) | — | Yes | Yes |
| Project files and diagram | Yes | Yes | No |
| Answer approvals and questions | Yes | Yes | Yes |
| Stop a running agent | Yes | Yes | No |
| Send messages to the agent (choose the model) | Yes | Yes, after **Continue on PC** | No |
| Rename and like sessions | Yes | Yes | Yes |
| Add provider API keys | Yes | Yes (end-to-end encrypted to the PC) | No |
| Edit files | Yes | No | No |
| Profile: photo, nickname, statistics, achievements | — | Yes | Yes |
| Keep the PC awake while agents run (☕) | Yes | — | — |
| App lock | — | Yes | — |

## Versions

The newest version of each app, with its release notes, is listed under **Download and install** on the [home page](/#install) and on the **Updates** screen of the Android app. Requirements: Windows 10 or 11 (64-bit) for Desktop, Android 8.0 or newer for the phone app. When a feature needs a newer BambooKit Desktop than the one on your PC, the phone and this site say **Update BambooKit Desktop**; see [Desktop compatibility](/docs/updates#desktop-compatibility).

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
| **BambooKit Web** | [bambookit-web.onrender.com](https://bambookit-web.onrender.com) | Install, docs, your sessions, approvals and profile, shared session links |

## Where your data lives

| Data | Where |
|---|---|
| Messages, tool steps, reasoning, diffs, project files | Your PC only |
| Model API keys (including keys added from the phone, end-to-end encrypted on the way) | Your PC only |
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

The agent always runs on the PC. From the phone you can start a session in a project, chat in a session after **Continue on PC** (choosing the model), **Stop** a run, answer approvals and questions, rename and like sessions and add provider keys. This site can answer approvals and questions, rename and like sessions and ask the PC to continue a session. Each of these is a command your PC carries out, as shown above. Nobody can edit files or open a shell remotely.

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

1. Download **BambooKit-Setup .exe** with the **Download for Windows** button on the [home page](/#install), or from the [releases page](https://github.com/BambooKit/bambookit-application/releases/latest), and run it.
2. If Windows SmartScreen says **Windows protected your PC**, choose **More info → Run anyway**. The installer is not code-signed yet.
3. Open **BambooKit** from the Start menu and sign in (or create an account).
4. Choose **Add project** (\`Ctrl+O\`), pick a project folder and start a session.
5. Optional: click the **☕ keep-awake** button next to the update button so the PC doesn't go to sleep while agents run. It stays on until you click it again or close the window.

Or open PowerShell and run:

\`\`\`powershell
irm https://bambookit-web.onrender.com/install.ps1 | iex
\`\`\`

The script looks up the latest **BambooKit Desktop** release on GitHub, downloads \`BambooKit-Setup-<version>-x64.exe\`, checks its signature and starts it. The installer is not code-signed yet, so the script prints a warning and Windows SmartScreen may ask you to confirm (**More info → Run anyway**).

| What | Where |
|---|---|
| Program | \`%LOCALAPPDATA%\\Programs\\bambookit-desktop\\\` |
| Start menu entry | **BambooKit** |
| Settings, encrypted sign-in and device key | \`%APPDATA%\\BambooKit Desktop\\\` |

Updates install automatically; see [Updates](/docs/updates).

## Android

Requirements: Android 8.0 or newer.

1. On your phone, tap **Download for Android** on the [home page](/#install), or open the [BambooKit for Android releases](https://github.com/BambooKit/bambookit-android/releases/latest) and download **BambooKit-<version>.apk**.
2. Open the file. When Android asks, allow **Install unknown apps** for your browser, then go back.
3. Tap **Install** and open BambooKit.
4. Sign in with the same account you use on the PC (email and password).
5. Allow notifications when asked, then on the PC choose **BambooKit → Add mobile device** and scan the QR code ([Pairing your phone](/docs/pairing)).

New versions are offered inside the app (**Profile → App updates**).

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

When the agent needs permission (for example to run a command or edit a file), the phone plays the BambooKit sound and shows **Approval required**. Open **Approvals** and choose **Allow once**, **Always** or **Deny**. When the agent asks a question, tick an option (or several) or type your own answer and press **Submit**.

## 6. Chat from the phone

In a session press **Continue on PC** once. The PC opens the session, and from then on you can type messages on the phone and pick the model for each one.

## 7. Stop if needed

If the agent goes the wrong way, press **Stop** on the phone.
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
| Profile photo | — | Profile | Account |
| Delete account | — | Profile | Account |

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
- **Android:** **Profile → Sign out**.

Signing out does not remove the device from your account; revoke it for that.

## Profile photo

On this site open [Account](/account) → **Upload photo**, or on the phone **Profile → Change photo**. JPEG, PNG or WebP up to 2 MB. **Remove photo** goes back to your Google picture (if any). Photos are stored in private cloud storage and shown through links that expire after an hour.

## Email verification

The [Account](/account) page shows whether your email is verified and can **Send verification email** again.

## Delete your account

On this site: [Account](/account) → **Delete account**. On the phone: **Profile → Delete account…**. Type \`DELETE MY ACCOUNT\` to confirm.

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

## Keep the PC awake (☕)

The **☕** button next to the update button in the title bar keeps Windows from going to sleep while agents run, so long tasks finish and your phone can still reach the PC. It stays on until you click it again or close the window.

## What your phone can do on this PC

Requests from your phone and this website are carried out by Desktop on your behalf: answering approvals and questions, stopping a run, starting a session in a project, chatting in a session after **Continue on PC**, renaming a session and saving provider API keys. Desktop must be running and signed in for them to arrive.

## What Desktop shares with BambooKit Cloud

When you are signed in, Desktop sends a small index of your projects and sessions (titles, status, model, change counts), the agent's permission requests and questions, and per-session totals for your profile statistics (coding time, files and lines changed, tests). Chats, diffs and files are sent only when your phone or this site asks for them, and are not stored. After each finished turn, Desktop saves a compressed copy of the session history (prompts, timeline, changed lines, tests) to private cloud storage for 7 days, so you can read it while the PC is off. Desktop also pings the hosted service every 10 minutes so it does not fall asleep.

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
## Tabs

| Tab | What it shows |
|---|---|
| **Home** | Your PCs and whether they are online, sessions that are working, approvals waiting, and **Recent activity** with a **Clear** button |
| **Projects** | Every project on your PCs and its sessions; **New session** starts one on the project's PC |
| **Approvals** | Permission requests and questions from the agent, with a badge |
| **Devices** | Paired PCs (rename, disconnect, revoke), **Scan QR code**, this phone and **Profile and settings** |

## Inside a session

| Tab | What it shows |
|---|---|
| **Summary** | Status and current action, project, branch and base commit, agent, model, duration, prompts, files changed, lines, tests passed/failed, approvals |
| **Todos** | The agent's todo list, live from the PC: pending, in progress and done |
| **Prompts** | Every prompt you gave, with time |
| **Timeline** | Prompts, replies, file reads and edits, commands, test runs, searches, approvals and errors in time order |
| **Changes** | Every changed file with its full diff; open one for **Diff** (each recorded edit), **Before** and **After** |
| **Files** | The file map: every file the session created, edited, deleted or read |
| **Project** | A folder browser of the project; files open in the code viewer (search, copy) |
| **Diagram** | **Live**, **History** and **Project map**; see [Live diagram](/docs/diagram) |
| **Chat** | The live conversation, and a message box once the session is continued on the PC |

A badge says where the history comes from: **Live from** your PC, or **Saved copy** when the PC is offline (kept 7 days). Before, After, Todos, Project, Diagram and Chat need the PC online. Before is labelled with its source: the session's own record, or the last Git commit.

## Actions

| Action | When |
|---|---|
| **Stop** (asks to confirm) | While the agent is working |
| **Allow once / Always / Deny** | For pending approvals (commands, file edits and other tools that ask) |
| **Submit** / **Dismiss** | For the agent's questions: tick one or several options or type your own answer |
| **Continue on PC** | Opens the session in BambooKit on the PC; after that you can chat in it from the phone |
| Send a message, choose the model | After **Continue on PC** |
| **Rename** and **like** (★) | Any time; liked sessions are marked ★ everywhere and listed under **Liked** on this website. Renaming changes the title on the PC |
| **Reload** | Any time |

The phone does not edit files. If the PC is offline, actions wait up to 5 minutes (**PC offline, queued**) and are then dropped.

## Chat from the phone

1. Open the session and press **Continue on PC** (confirm). The PC opens the session in BambooKit.
2. The **Chat** tab now has a message box. Pick a model with the model picker (it lists the providers and models configured on that PC; the session's default is preselected) and send.
3. Replies stream in live, with the agent's tool steps, approvals and questions.

Sessions you start from **Projects → New session** are continued on the PC automatically, so you can keep chatting in them straight away.

## AI providers and API keys

**Profile → AI providers** lists, per PC, the providers configured in BambooKit Desktop and their models. To add a key, choose a provider, paste the key and press **Add key**:

- The key is **encrypted end-to-end to your PC** before it leaves the phone: an AES-256-GCM key encrypts it, and that key is wrapped with the PC's own RSA key (RSA-OAEP with SHA-256). Only that PC can decrypt it.
- BambooKit Cloud only passes the ciphertext along and deletes it as soon as the PC answers. The key is **never stored in the cloud** and never written to the event log.
- The field is cleared once sent, and the key is **never shown again**, on the phone or anywhere else. **Remove** deletes a key from the PC.

## Profile

Open **Profile** from the top bar or **Devices → Profile and settings**:

| Part | What it has |
|---|---|
| Header | Your photo (**Change photo**, **Remove**), name and member-since date |
| Nickname | The name shown on your devices and this website |
| Statistics | Projects, sessions, **Coding time** (this week, this month, total), code stats (files created and modified, lines added and removed, tests) and tasks completed |
| Achievements | Unlocked and in-progress achievements, such as First Project, 1,000 Lines, Night Coder or Marathon |
| Notifications, App lock, App updates, AI providers | Settings for this phone |
| Account, Danger zone | Sign-in method and verification, **Sign out**, **Delete account…** |
| Projects managed | At the bottom: every project with its PC, branch and coding time; mark it **Active**, **Completed** or **Archived** |

Coding time counts only while the agent is actually working on a task, not while the app is open. See [Profile and achievements](/docs/profile).

## Updates screen

**Profile → App updates** shows the installed version, the newest real release from the BambooKit for Android releases and its release notes (**What's new**), with **Update**, **Install** or **Skip this version**. See [Updates](/docs/updates).

## Recent activity

**Home → Recent activity** lists pairings, approvals, notifications and other account events. **Clear** (asks to confirm) removes recent activity and notifications for your account on **all your devices**; sessions and approvals are not affected.

## App lock

**Profile → App lock** asks for your fingerprint, face or screen lock when the app opens; see [App lock](/docs/app-lock).

## Sign-in

Email and password (sign in, create account, forgot password). Google sign-in is not available on the phone yet.

## Notifications and storage

Notifications for questions, approvals, finished sessions and errors play the **BambooKit sound**; see [Notifications](/docs/notifications). Your sign-in is stored encrypted with the Android Keystore and app data is excluded from backups.

## Permissions the app asks for

Internet, notifications (Android 13+), camera (QR scan), biometrics (App lock) and "install unknown apps" (only when you install an update; Android always asks you to confirm).

## When the PC app is too old

Some features need a recent BambooKit Desktop on the PC (for example todos, AI providers and the full approval details). If yours is older, the phone says **Update BambooKit Desktop** instead of failing; tap **ⓘ** for the details. See [Desktop compatibility](/docs/updates#desktop-compatibility).
`,
  },
  {
    slug: "web",
    title: "Website",
    section: "Apps",
    summary: "Your PCs, sessions, approvals and profile in the browser.",
    body: `
Sign in at [bambookit-web.onrender.com](https://bambookit-web.onrender.com/signin) with your BambooKit account (email and password, or Google).

| Page | What it shows |
|---|---|
| [Sessions](/sessions) | Your PCs with online status and every session: status, project, model, changes, pending approvals. Search, filter by PC or status, and show only **Liked** sessions |
| Session | Tabs **Summary**, **Prompts**, **Timeline**, **Changes** (Diff, Before, After), **Files** and **Chat**; updated live while the agent works. **Like** (★), **Rename** and **Continue on PC** |
| [Devices](/devices) | Your PCs and phones, online state and last seen |
| [Approvals](/approvals) | Permission requests and questions from the agent, pending and answered. Answer them here |
| [Account](/account) | Your profile, nickname, statistics, projects and achievements, sign-in method, email verification, profile photo, browser notifications, the latest releases and **Delete account** |
| [Setup](/welcome) | The steps to connect your first PC and phone |

## What you can do here

The website can answer approvals and questions, like and rename sessions, and a session's **Continue on PC** button asks your PC (when it is online) to open that session in BambooKit. It does not send chat messages, stop runs, browse the project tree or manage devices: chat in BambooKit on your PC or in the Android app. Your own account (nickname, photo, deletion) is managed on the [Account](/account) page.

While the website is open, notifications (questions, approvals, finished or failed sessions) appear in the corner of the page. Turn on browser notifications on the [Account](/account) page to also get them from your browser.

If a feature needs a newer BambooKit Desktop than the one on your PC, the page says **Update BambooKit Desktop** and lists what needs the newer version, which version is needed and how to update. See [Desktop compatibility](/docs/updates#desktop-compatibility).

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

Open the project in Desktop and send the first prompt there, or on the phone choose **Projects → the project → New session**, type the first prompt and pick a model. The PC that owns the project creates the session in the project's folder, so that PC must be online.

## Managing projects

At the bottom of your **Profile** (phone) and on the [Account](/account) page, **Projects managed** lists every project with its PC, branch and coding time. Mark a project **Active**, **Completed** or **Archived** to keep the list tidy; this is stored by BambooKit only and does not touch the folder on your PC.
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

## Todos

When the agent plans its work it keeps a todo list. The session's **Todos** tab on the phone shows it live from the PC: each item as pending, in progress or done, updating as the agent works.

## Full file changes

The **Changes** tab lists every changed file (added, modified, deleted, renamed) with lines added and removed. Open a file for its full **Diff** (each recorded edit, in order), and its whole **Before** and **After**.

## From the phone and the web

| Action | Phone | Web |
|---|---|---|
| **Stop** a running agent | Yes | No |
| Answer approvals and questions | Yes | Yes |
| **Continue on PC**, then chat and choose the model | Yes | Continue on PC only |
| **Rename** a session | Yes | Yes |
| **Like** (★) a session | Yes | Yes, with a **Liked** filter |

Messages need the session to be continued on the PC first: press **Continue on PC** once and the PC opens the session in BambooKit. Each message uses the model you pick in the model picker (the PC's configured providers and models). A rename is carried out by the PC, which owns the title; likes are kept by BambooKit only and never sent to the PC.

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

The phone and this site cannot change files directly. Edit in Desktop, or ask the agent from the phone after **Continue on PC**; its edits follow your permission rules.
`,
  },
  {
    slug: "diagram",
    title: "Live diagram and project diagram",
    section: "Features",
    summary: "Watch a session work as a live diagram, replay it, or see your project's structure.",
    body: `
On the phone a session's **Diagram** tab has three modes:

| Mode | Shows |
|---|---|
| **Live** | What the session is doing right now, as a diagram: account → PC → project → session → agent → model → tools used → files changed → Git → tests → todos → approvals. It is rebuilt from real state as events arrive (at most once a second) |
| **History** | The same diagram at a chosen point of the session's timeline, so you can step back through what happened |
| **Project map** | The project diagram described below |

Filter the Live and History diagrams by **All**, **Agents**, **Files**, **Tools**, **Git**, **Tests** or **Connections**. Tap a changed file to open its diff.

## Project map

The project diagram shows the project's folders or files as boxes and draws an arrow wherever code really references other code. It is computed on your PC each time you open it or press **Rescan**.

Where: Desktop review panel → **File map** → **Project diagram**; phone session → **Diagram → Project map**.

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
    title: "Approvals and questions",
    section: "Features",
    summary: "Answer the agent's permission requests and questions from your phone or this website.",
    body: `
The agent's permission rules decide what it may do on its own. When a rule says **ask**, for example before it runs a command or edits a file, the agent pauses and the request appears in Desktop, on your phone and on this website as an **approval**. The phone and the website can only answer requests the agent made; they cannot grant anything by themselves.

Each approval shows what the agent wants to do: the command it will run, or the file it will change with the proposed diff (the full details need a recent BambooKit Desktop).

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

Sometimes the agent asks a question instead, for example which option to use. You get a **BambooKit has a question** notification, and the question appears under **Approvals** on the phone and the website.

| Question type | How to answer |
|---|---|
| Single choice | Tick one option |
| Multiple choice | Tick every option that applies |
| Free text | Type your own answer in the box (offered alongside the options when the agent allows it) |

A request can hold several questions. **Submit** sends the answers once every question is answered; **Dismiss** tells the agent you won't answer. The agent continues on the PC with your answers.

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
| **Approval required** | The agent asks for permission (a command, a file edit, another tool set to Ask) |
| **BambooKit has a question** | The agent asks you a question |
| **Agent finished** | A session goes from working to idle |
| **Agent failed** | A session ends with an error |
| **Achievement unlocked** | You reach a new [achievement](/docs/profile) |

Notifications carry only ids and a short text, never code or secrets.

## On the phone

The app shows them as Android notifications and plays the **BambooKit sound** for questions, approvals, completions and errors. There are two channels: **Requests** (approvals and questions, high priority) and **Session updates** (finished or failed). Change the sound or turn a channel off in **Profile → Notifications → Sound and notification settings**. Tap a notification to open the session or the approval. They are also listed on **Home → Recent activity**. Allow notifications when the app asks (Android 13+), or later in Android Settings → Apps → BambooKit.

**Clear** on **Home → Recent activity** removes recent activity and notifications for your account on all your devices (phone and website). Sessions and approvals are not affected.

Notifications arrive over the app's live connection. Turn on **Profile → Notifications → Notify me in the background** to keep that connection open while the app is closed; Android then shows a quiet **Background connection** notification. There is no push service yet: if Android stops the app anyway, you see the notifications the next time you open it. Allowing BambooKit to run without battery restrictions (**Open battery settings**) helps.

## On the website

While the website is open, notifications appear in the corner of the page. Turn on browser notifications on the [Account](/account) page to also get them from your browser.

## On the PC

Desktop has its own notifications and sounds in **Settings → General** (Agent, Permissions, Errors), and tells you when a phone finishes pairing.
`,
  },
  {
    slug: "profile",
    title: "Profile and achievements",
    section: "Features",
    summary: "Your photo, nickname, statistics, achievements and projects.",
    body: `
Your profile is on the phone (**Profile**, from the top bar or **Devices → Profile and settings**) and on this website's [Account](/account) page.

## Photo and nickname

**Change photo** uploads a JPEG, PNG or WebP up to 2 MB; **Remove** goes back to your Google picture (if any). The **nickname** is the name shown on your devices and here. See [Accounts and sign-in](/docs/sign-in#profile-photo).

## Statistics

Everything is computed from real BambooKit records; nothing is estimated.

| Statistic | What counts |
|---|---|
| Projects | Projects you opened in BambooKit Desktop, by status (active, completed, archived) |
| Sessions | Sessions, and those where the agent completed work |
| Coding time | This week, this month and total. Only the time the agent is actually working on a task counts (from busy to idle or error), not the time an app is open. One task counts at most 6 hours |
| Code | Files created, modified, deleted and renamed, lines added and deleted, edits, tests run, passed and failed, commits and deployments |
| Tasks | Agent tasks completed and failed |

Your PC reports per-session totals computed from its own edit history, and each new report replaces the previous one for that session, so nothing is counted twice. A file edited several times in one session counts once as a file, and every edit counts in the line totals. Times are counted in your time zone.

## Achievements

Achievements unlock once and stay unlocked; you get an **Achievement unlocked** notification. Locked ones show your progress.

| Achievement | Goal |
|---|---|
| First Project | Open your first project in BambooKit |
| First Session | Complete your first AI coding session |
| First Change | Make your first code change through BambooKit |
| 100 Files | Create or modify 100 files |
| 1,000 Lines | Add 1,000 lines of code |
| Code Builder | Complete 10 agent tasks |
| Project Manager | Manage 5 projects |
| Night Coder | Code for 2 hours between 22:00 and 05:00 |
| Debugger | Complete 3 debugging sessions |
| Tester | Run 10 passing test commands |
| Ship It | Complete a deployment |
| Agent Commander | Run 10 agent sessions |
| Long Session | Keep the agent working on one task for an hour |
| Cleanup Crew | Remove 500 lines of obsolete code |
| Marathon | Reach 24 hours of total coding time |

## Projects managed

At the bottom of the profile, **Projects managed** lists every project with its PC, branch and coding time. Set each one to **Active**, **Completed** or **Archived**; BambooKit never changes the status by itself. See [Projects](/docs/projects#managing-projects).

## Updates

**Profile → App updates** on the phone shows your version, the newest release and its release notes. See [Updates](/docs/updates).
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

The app checks the BambooKit for Android releases at most every 6 hours and when you press **Check for updates** in **Profile → App updates**. The updates screen shows the version you have, the newest real release and its release notes (**What's new**). When a new version exists, a banner offers **Update** or **Skip this version**. The app downloads the APK (with progress) and opens Android's installer; you always confirm the install. The first time, Android asks you to allow BambooKit to install apps.

Every release is signed with the same BambooKit key, so updates install over the existing app and keep your sign-in.

## Website and cloud

This website and BambooKit Cloud are updated on the server; there is nothing to install. The [Account](/account) page and the [home page](/#install) list the latest Desktop and Android releases with their release notes and downloads.

## Desktop compatibility

New phone and website features sometimes need a newer BambooKit Desktop on the PC. Each PC reports which features it supports, so when yours is too old the phone and this site show **Update BambooKit Desktop** instead of an error, with details: what needs the update, the version you have and the version needed (on the phone, tap **ⓘ**).

| Feature | Needs BambooKit Desktop |
|---|---|
| Browse project files, view a file | 1.0.2 or newer |
| Session history, Before/After, todos, AI providers and models, full approval details | 1.0.3 or newer |

To update, restart BambooKit Desktop (it updates itself when it starts), choose **Check for Updates...** in the app menu, or install the latest version from the [home page](/#install).
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

Anyone with the link can read the conversation, tool steps and the list of changed files. The shared copy updates as the session continues on the PC. Choose **Unshare session** in Desktop to delete it. Sharing is done from Desktop only.

Publishing is the one case where a copy of a session is stored by BambooKit Cloud, and only until you unpublish it. Only your PC, which holds the secret for that link, can change or delete it. Deleting your account deletes your shared links.
`,
  },
  {
    slug: "app-lock",
    title: "App lock",
    section: "Features",
    summary: "Lock the Android app with your fingerprint, face or screen lock.",
    body: `
**BambooKit for Android** can lock the app with your fingerprint, face or the phone's screen lock (PIN, pattern or password). Desktop and this website have no app lock of their own; they rely on your Windows sign-in and browser.

## Turn it on

**Profile → App lock → Turn on App lock**, then confirm it's you. The phone must have a screen lock; if it has none, the app asks you to set one in Android Settings first.

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
    slug: "plans",
    title: "Plans and billing",
    section: "Features",
    summary: "Free and Pro, Pro passes, paying with Cashfree and rewarded ads on Android.",
    body: `
BambooKit is free to use on your PC. **Pro** removes the limits on your phone, lets you connect more PCs and turns off ads in the Android app. See [Pricing](/pricing).

## Free and Pro

| | Free | Pro |
|---|---|---|
| Desktop agent, your own API keys, free BambooKit models | Yes | Yes |
| Follow sessions, approve and answer questions from your phone | Yes | Yes |
| Chat from your phone | 20 messages a day | Unlimited |
| New sessions from your phone | 3 a day | Unlimited |
| PCs per account | 1 | 5 |
| Ads in the Android app | Yes | None |
| Priority support | No | Yes |

Daily limits reset once a day; the [Account](/account#plan) page shows today's usage and when it resets. Desktop and this website never show ads.

## Pro passes

Pro is sold as a pass: **₹199 for a month** or **₹1,999 for a year** (2 months free). Passes don't renew automatically, so there is nothing to cancel. When a pass ends you go back to Free; buy another pass to keep Pro. Buying while you already have Pro adds the new pass to the end of the current one.

## Buying Pro

1. Open [Pricing](/pricing) and choose **Get Pro** (sign in first if asked).
2. Cashfree's secure checkout opens. Pay with UPI, a card or netbanking.
3. You come back to this site, which waits for the payment to be confirmed and then shows **You're on Pro until** the end date.

Pro applies to your account, so all your devices get it right away; the Account page updates by itself. Prices are in Indian rupees and include taxes as applicable.

Payments are processed by **Cashfree Payments**. BambooKit never sees or stores your card or UPI details; it keeps only the order (product, amount, status and dates).

## Rewarded ads on Android

On the free plan, the Android app can show a short ad that gives you **24 hours of Pro**, up to **2 times a day**. In the EEA and the UK the app asks for your consent to ads first (Google's consent form).

## Billing history and refunds

**Account → Plan** lists your payments with their date, product, amount and status. If a payment went wrong, ask in [GitHub Discussions](https://github.com/BambooKit/bambookit-application/discussions) with the order ID (hover a row on the Account page to see it).

## If a payment is stuck

- **Processing** for more than a minute: the bank hasn't confirmed yet. Leave it; Pro is added as soon as Cashfree confirms, and the Account page updates by itself.
- **Failed** or **Expired**: you weren't charged for that order. Try again from [Pricing](/pricing).
- **Payments are being set up — coming soon** on the Pricing page means buying isn't open yet.
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

## Adding keys from your phone

On the phone open **Profile → AI providers**, choose the PC and the provider, paste the key and press **Add key**. The key is encrypted on the phone for that PC only (RSA-OAEP with SHA-256 wrapping an AES-256-GCM key) and only the PC can decrypt it. BambooKit Cloud sees only ciphertext, never stores it and deletes it as soon as the PC confirms. The key is never shown again; to change it, add a new one or **Remove** it. Listing providers from the phone needs BambooKit Desktop 1.0.3 or newer.

## Tuning

- \`Ctrl+Shift+D\` cycles the thinking effort of models that support it.
- \`Ctrl+.\` switches agent (Build, Plan, or your own).
- Messages sent from the phone use the model you pick in the phone's model picker, which lists the providers and models configured on that PC. The session's last model is preselected.
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
| Model API keys (also those added from the phone) | Your PC | Until you remove them |
| Profile statistics: coding-time intervals, per-session totals (files, lines, tests), achievements, project status | BambooKit Cloud | Until account deletion |
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
- **Fixed remote actions.** The phone can stop a run, answer approvals and questions, start a session in a project, chat in a session after **Continue on PC**, rename sessions and add or remove provider keys. This site can answer approvals and questions, rename sessions and ask the PC to continue one. There is no remote shell and no remote file editing; everything the agent does still follows your permission rules on the PC.
- **Provider keys from the phone** are encrypted end-to-end to the PC's own RSA key (RSA-OAEP-SHA256 wrapping an AES-256-GCM key). BambooKit Cloud only relays the ciphertext, never writes it to the event log or stores it, and deletes it as soon as the PC answers. The key is never shown again.
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
| Overview | \`GET /v1/overview\`, \`GET /v1/activity\`, \`DELETE /v1/activity\` (clear) |
| Statistics | \`GET /v1/me/stats\`, \`GET /v1/me/achievements\`, \`PATCH /v1/projects/:id\` (status) |
| Releases and service info | \`GET /v1/releases/latest?platform=windows\` (or \`android\`), \`GET /v1/meta\` |
| Devices and pairing | \`GET /v1/devices\`, \`PATCH /v1/devices/:id\`, \`POST /v1/devices/:id/revoke\`, \`POST /v1/devices/:id/unlink\`, \`POST /v1/pairing/claim\` |
| Projects and sessions | \`GET /v1/projects\`, \`POST /v1/projects/:id/sessions\`, \`GET /v1/sessions\`, \`GET /v1/sessions/:id\`, \`PATCH /v1/sessions/:id\` (like) |
| PC providers | \`GET /v1/devices/:id/providers\` (never includes keys) |
| Session history | \`GET /v1/sessions/:id/history\` (live, or the 7-day copy), \`GET /v1/sessions/:id/file-versions?path=\` (before/after) |
| Live from the PC | \`GET /v1/sessions/:id/parts\`, \`/todos\`, \`/changes\`, \`/filemap\`, \`/diagram\`, \`/tree?path=\`, \`/file?path=\` |
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
    slug: "admin",
    title: "Admin panel and Telegram bot",
    section: "Reference",
    summary: "Watch the health and usage of your BambooKit server from the website or from Telegram.",
    body: `
If you run your own BambooKit server, you can see how it is doing in two places: the **Admin** page on this website and a private **Telegram bot**. Both show figures and account metadata only (counts, versions, sign-up dates, server errors), never session content, files, sign-in tokens or keys.

## Set up on Render

Open the API service on Render, go to **Environment** and add:

| Variable | Secret | Purpose |
|---|---|---|
| \`ADMIN_EMAILS\` | No | Comma-separated emails of administrator accounts, e.g. \`you@example.com\` |
| \`TELEGRAM_BOT_TOKEN\` | **Yes** | The token BotFather gives you when you create the bot |
| \`TELEGRAM_ADMIN_CHAT_IDS\` | No | Comma-separated Telegram chat ids allowed to use the bot |

\`\`\`text
ADMIN_EMAILS=you@example.com
TELEGRAM_BOT_TOKEN=<bot-token-from-botfather>
TELEGRAM_ADMIN_CHAT_IDS=<your-chat-id>
\`\`\`

Save; Render restarts the API. An admin email must be verified with its sign-in method.

## The Admin page

Sign in with an administrator account and **Admin** appears in the navigation and in your account menu. Other accounts don't see it, and opening \`/admin/\` shows **Administrators only**.

The page shows:

- **Service**: API version, commit, database, cloud storage and Telegram on or off, uptime and memory.
- **Traffic** since the API started: requests, client errors (4xx) and server errors (5xx).
- **Live streams**: open realtime connections from devices and the website.
- **Users**: total, new today and this week, active in the last 24 hours, and by sign-in method.
- **Devices**: PCs (and how many are online), phones, and which BambooKit Desktop versions are in use.
- **Activity**: sessions and how many are working now, projects, pending approvals and work in the last 7 days.
- **Recent server errors**: time, route, status, code, request ID and client. Match the request ID with the API logs.
- **Users**, newest first, page by page.

It refreshes every 30 seconds while the tab is visible; use **Refresh** to update it now.

## The Telegram bot

1. Create a bot with **@BotFather** and put its token in \`TELEGRAM_BOT_TOKEN\`.
2. Send **/start** to your bot. Because your chat isn't allowed yet, it replies with your **chat id**.
3. Add that id to \`TELEGRAM_ADMIN_CHAT_IDS\` and save. After the restart, send **/start** again.

The bot answers with a button menu, so there is nothing to type:

| Button | Shows |
|---|---|
| **Status** | Version, commit, uptime, memory, database, storage, traffic and live streams |
| **Users** | Total, new today and this week, active in 24 hours, by sign-in method |
| **Devices** | PCs (online), phones and desktop versions |
| **Sessions** | Sessions, working now, projects, pending approvals and coding time in 7 days |
| **Errors** | The most recent server errors with their request IDs |
| **New sign-ups** | The newest accounts with sign-up time and method |
| **Alerts on/off** | Pause or resume alerts |

**Alerts** arrive on their own when the API starts, when someone signs up and when the server answers with an error (at most one error alert every 5 minutes). Turning alerts off lasts until you turn them on again or the API restarts.

Anyone else who messages the bot only learns their own chat id; it tells them nothing about your server.
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

Press **Continue on PC** in the session first (the PC must be online). After the PC opens the session, the Chat tab has a message box. This website does not send chat messages; use the phone or the PC.

## "Update BambooKit Desktop"

The feature you opened needs a newer BambooKit Desktop than the one on that PC. Tap **ⓘ** (phone) or read the notice (web) for the version needed, then restart Desktop on the PC (it updates itself when it starts) or install the latest version from the [home page](/#install). See [Desktop compatibility](/docs/updates#desktop-compatibility).

## A provider key from the phone didn't arrive

The PC must be online and on BambooKit Desktop 1.0.3 or newer. The encrypted key waits at most 5 minutes for the PC; after that, add it again. The key is never shown again, so keep your own copy with the provider.

## "Saved copy" instead of "Live from PC"

Your PC is offline, so you see the history copy it saved after its last turn (up to 7 days old). Before and After, the chat, the project browser and the diagram need the PC online.

## Profile photo upload fails on this site

The service's cloud storage must allow uploads from this website. Try again later or upload the photo from the phone (**Profile**).

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
    slug: "install-help",
    title: "Install and connection help",
    section: "Help",
    summary: "Fixes for installing BambooKit and connecting your phone to your PC.",
    body: `
## Windows says "Windows protected your PC"

That is SmartScreen. The BambooKit installer is not code-signed yet, so Windows doesn't recognise it. Choose **More info**, check that the file is **BambooKit-Setup-<version>-x64.exe** from the [releases page](https://github.com/BambooKit/bambookit-application/releases/latest), then **Run anyway**. The PowerShell installer prints a warning about the missing signature for the same reason.

## Android won't install the APK

Android blocks apps from outside the Play Store until you allow it per app:

1. Open the downloaded **BambooKit-<version>.apk**.
2. Android says your browser isn't allowed to install apps: tap **Settings** and turn on **Allow from this source** (**Install unknown apps**).
3. Go back and tap **Install**.

If it says **App not installed**, check that the phone runs Android 8.0 or newer and has free space. If an older BambooKit was installed from a different build (for example a debug build), uninstall it first; releases are all signed with the same key, so normal updates install over each other.

## The phone can't see my PC

Your phone only sees a PC that is **online and signed in to the same account**:

1. On the PC, start BambooKit Desktop and make sure it is signed in. Click the **BambooKit** chip: **BambooKit API**, **Realtime** and **Agent engine** should say connected.
2. Check that the phone uses the same account. Email/password and Google are separate accounts, even with the same address.
3. Make sure the PC isn't asleep. Use the **☕** keep-awake button while agents run.
4. Still missing? Pair again: on the PC choose **BambooKit → Add mobile device** and scan the new code.

## Re-pair a phone

On the PC open the **BambooKit** chip → **Paired phones** → **Disconnect**, or on the phone **Devices** → the PC → **Disconnect**. Then choose **Add mobile device** on the PC and scan the QR code. If the phone or PC was **revoked**, see [Troubleshooting](/docs/troubleshooting) to set it up again.

## The QR code doesn't scan

- Allow the camera when the app asks (Android Settings → Apps → BambooKit → Permissions).
- Scan from **Devices → Scan QR code** in the BambooKit app, not the phone's camera app.
- Make the code bigger on the PC screen, reduce glare and hold the phone 20–30 cm away.
- Codes expire after 2 minutes and work once. If it says **expired** or **already used**, scan the new code or press **New code**.
- **This desktop is signed in to a different BambooKit account** means the phone and PC use different accounts.

## "Update BambooKit Desktop"

The phone or this site needs a newer BambooKit Desktop on that PC for the feature you opened (for example todos, AI providers or full approval details). Tap **ⓘ** for details. Restart Desktop on the PC (it updates itself when it starts) or install the latest version from the [home page](/#install). See [Desktop compatibility](/docs/updates#desktop-compatibility).

## No notification sound

Notifications for questions, approvals, completions and errors play the BambooKit sound. If you hear nothing, open **Profile → Notifications → Sound and notification settings** and check the **Requests** and **Session updates** channels, and that the phone isn't in Do Not Disturb.

More: [Troubleshooting](/docs/troubleshooting) · [FAQ](/docs/faq)
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

The apps are free and the BambooKit provider includes free models. Your own provider keys are billed by that provider. The free plan has daily limits on chatting and starting sessions from the phone and allows one PC; **Pro** removes them. See [Plans and billing](/docs/plans).

## Can I start a session or chat from my phone?

Yes. **Projects → the project → New session** starts one on the project's PC. In an existing session press **Continue on PC** once, then type messages and pick the model. The PC must be online in both cases.

## Can I add my OpenAI or Anthropic key from my phone?

Yes, in **Profile → AI providers**. The key is encrypted end-to-end to your PC, never stored in the cloud and never shown again. See [Models and providers](/docs/models#adding-keys-from-your-phone).

## Will my PC go to sleep while the agent works?

Windows may. Click the **☕** keep-awake button next to the update button in BambooKit Desktop; the PC stays awake until you click it again or close the window.

## What does "Clear" in Recent activity do?

It removes recent activity and notifications for your account on all your devices. Sessions, approvals and your statistics are not affected.

## Can I read sessions while my PC is off?

Yes, for 7 days after the PC last saved them: the summary, prompts, timeline, changes with diffs and tests. The live chat, Before and After, project files and the diagram need the PC online.

## Is there an iPhone, Mac or Linux version?

No. Desktop is for Windows (64-bit) and the phone app is for Android.

## Can I use Google sign-in on the phone?

Not in the current version. Use an email account on all your devices if you want to use the phone.

## Does the phone need to be on the same Wi-Fi as the PC?

No. Both connect to BambooKit Cloud over the internet; no port forwarding or VPN.

## Is there a PIN or fingerprint lock?

Yes, on Android: **Profile → App lock**. See [App lock](/docs/app-lock).

## How do I delete my account?

On this site under [Account](/account), or on the phone under **Profile**. Sessions on your PCs are not affected. See [Accounts and sign-in](/docs/sign-in#delete-your-account).

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
