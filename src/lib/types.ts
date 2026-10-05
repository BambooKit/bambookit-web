/** Shapes returned by bambookit-api (/v1). */

export type DeviceKind = "desktop" | "mobile";

export interface LinkedDevice {
  id: string;
  name: string;
  kind: DeviceKind;
  platform: string | null;
}

export interface Device {
  id: string;
  kind: DeviceKind;
  name: string;
  platform: string | null;
  appVersion: string | null;
  online: boolean;
  lastSeenAt: string | null;
  createdAt?: string;
  linkedDevices: LinkedDevice[];
  /** Desktop protocol version (desktops only; older APIs omit it). */
  protocol?: number | null;
  /** What this desktop can do, e.g. "relay.history" (desktops only; older APIs omit it). */
  capabilities?: string[] | null;
}

export type SessionStatus = "idle" | "busy" | "retry" | "error";

export interface Session {
  id: string;
  deviceId: string;
  projectId: string | null;
  projectName: string | null;
  opencodeSessionId: string;
  parentOpencodeSessionId?: string | null;
  directory: string | null;
  title: string | null;
  status: SessionStatus;
  statusMessage: string | null;
  agent: string | null;
  model: string | null;
  currentAction: string | null;
  remote: boolean;
  changes: { additions: number; deletions: number; files: number };
  pendingApprovals: number;
  /** Liked (kept by BambooKit only). Missing on older servers. */
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /v1/projects */
export interface Project {
  id: string;
  deviceId: string;
  deviceName: string | null;
  name: string;
  directory: string;
  branch: string | null;
  activeSessions: number;
  totalSessions: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  sessionId: string;
  messageId: string;
  role: "user" | "assistant";
  type: "text" | "reasoning" | "tool";
  text: string | null;
  tool: string | null;
  toolStatus: string | null;
  toolTitle: string | null;
  sortKey: string;
  updatedAt: string;
}

export interface ChangedFile {
  file: string;
  status?: string | null;
  additions: number;
  deletions: number;
}

export interface QuestionOption {
  label: string;
  description?: string;
}

export interface Question {
  header?: string;
  question: string;
  options?: QuestionOption[];
  /** More than one option may be chosen. */
  multiple?: boolean;
  /** A typed answer is allowed unless this is false. */
  custom?: boolean;
}

export type ApprovalKind = "permission" | "question";

export interface Approval {
  id: string;
  deviceId?: string;
  sessionId: string;
  sessionTitle: string | null;
  projectName: string | null;
  permission: string;
  title: string;
  patterns: string[];
  status: string;
  reply?: string | null;
  /** Missing on older servers: treat as "permission". */
  kind?: ApprovalKind;
  questions?: Question[] | null;
  /** One list of chosen labels (or typed text) per question, once answered. */
  answers?: string[][] | null;
  createdAt: string;
  resolvedAt?: string | null;
}

/** A notification as sent in the realtime 'notification' event. */
export interface AppNotification {
  id: string;
  type: "approval.required" | "question.asked" | "session.completed" | "session.failed" | string;
  title: string;
  body: string | null;
  data: { approvalId?: string; sessionId?: string; [key: string]: unknown } | null;
  readAt: string | null;
  createdAt: string;
}

export type SignInProvider = "email" | "google" | "other";

/** GET /v1/me */
export interface Me {
  id: string;
  email: string | null;
  /** Nickname if set, otherwise the name from the sign-in provider. */
  name: string | null;
  /** The BambooKit nickname (PATCH /v1/me { name }). */
  nickname?: string | null;
  avatarUrl: string | null;
  /** True when the photo is one the user uploaded (it can be removed). */
  avatarStored?: boolean;
  provider: SignInProvider | string | null;
  emailVerified?: boolean | null;
  createdAt?: string | null;
  lastActiveAt?: string | null;
  devices?: number;
  projects?: number;
  /** Profile photo uploads are available on this server. */
  cloudStorage?: boolean;
  /** Account deletion is available on this server. */
  accountDeletion?: boolean;
  /** This account may open the admin panel (the admin routes check again). */
  admin?: boolean;
}

/** POST /v1/me/avatar-upload */
export interface AvatarUpload {
  key: string;
  url: string;
  method: "PUT";
  headers?: Record<string, string>;
  expiresIn?: number;
}

/** Times in session history may be ISO strings or epoch milliseconds. */
export type HistoryTime = string | number;

export type TimelineKind =
  | "prompt"
  | "response"
  | "read"
  | "edit"
  | "write"
  | "patch"
  | "command"
  | "test"
  | "search"
  | "web"
  | "agent"
  | "plan"
  | "tool"
  | "error"
  | "completed";

export interface HistoryPrompt {
  messageId?: string;
  time?: HistoryTime;
  text?: string;
}

export interface TimelineItem {
  id?: string;
  time?: HistoryTime;
  kind?: TimelineKind | string;
  title?: string;
  detail?: string | null;
  file?: string | null;
  status?: string | null;
  messageId?: string | null;
}

export interface FileEdit {
  time?: HistoryTime;
  tool?: string;
  additions?: number;
  deletions?: number;
  patch?: string | null;
}

export type ChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface HistoryChange {
  file: string;
  status?: ChangeStatus | string;
  oldPath?: string | null;
  additions?: number;
  deletions?: number;
  edits?: FileEdit[];
}

export interface HistoryTest {
  time?: HistoryTime;
  command?: string;
  status?: "passed" | "failed" | "running" | "unknown" | string;
  exitCode?: number | null;
}

export interface HistorySummary {
  prompts?: number;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  testsPassed?: number;
  testsFailed?: number;
  durationMs?: number | null;
}

/** A session's history as recorded on the PC. Any field may be missing. */
export interface SessionHistory {
  sessionId?: string;
  title?: string | null;
  projectName?: string | null;
  directory?: string | null;
  branch?: string | null;
  baseCommit?: string | null;
  agent?: string | null;
  model?: string | null;
  status?: string | null;
  createdAt?: HistoryTime | null;
  updatedAt?: HistoryTime | null;
  durationMs?: number | null;
  prompts?: HistoryPrompt[];
  timeline?: TimelineItem[];
  changes?: HistoryChange[];
  tests?: HistoryTest[];
  summary?: HistorySummary;
}

/** GET /v1/sessions/:id/history */
export interface SessionHistoryResponse {
  /** "pc": read live from the PC. "cloud": the saved copy (kept 7 days). */
  source: "pc" | "cloud";
  savedAt: string | null;
  history: SessionHistory | null;
  approvals?: Approval[];
}

/** GET /v1/sessions/:id/file-versions?path= (live from the PC only) */
export interface FileVersions {
  path: string;
  status?: string | null;
  before?: string | null;
  after?: string | null;
  beforeSource?: "session" | "git" | null;
  note?: string | null;
  truncated?: boolean;
}

/** A realtime event as sent by GET /v1/realtime/stream. */
export interface StreamEvent {
  type: string;
  sessionId: string | null;
  deviceId: string | null;
  payload: any;
}

/* ---------------------------------------------------------------- profile statistics (GET /v1/me/stats) */

export type ProjectStatus = "active" | "completed" | "archived";

export interface ProjectStat {
  id: string;
  name: string;
  status: ProjectStatus;
  branch: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  sessions: number;
  tasks: number;
  filesChanged: number;
  codingMs: number;
}

export interface CodeStats {
  filesCreated: number;
  filesModified: number;
  filesDeleted: number;
  filesRenamed: number;
  linesAdded: number;
  linesDeleted: number;
  edits: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  commits: number;
  deployments: number;
}

export type AchievementTierName = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface AchievementTier {
  name: AchievementTierName;
  threshold: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

/**
 * One achievement. Tiered APIs send emoji, value, trackable, tiers, tier and nextTier; older APIs send only
 * the flat fields (title, description, progress, target, unit "count" | "ms", unlocked, unlockedAt).
 */
export interface Achievement {
  id: string;
  emoji?: string;
  title: string;
  description: string;
  /** lines, hours, days, nights, … ("count" / "ms" on older APIs). */
  unit: string;
  trackable?: boolean;
  /** Why an untrackable achievement shows no progress. */
  reason?: string;
  value?: number;
  tiers?: AchievementTier[];
  tier?: AchievementTierName | null;
  nextTier?: AchievementTierName | null;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementSummary {
  unlocked: number;
  total: number;
  tiersUnlocked: number;
  tiersTotal: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ProfileStats {
  timeZone: string;
  memberSince: string | null;
  projects: { total: number; active: number; completed: number; archived: number; list: ProjectStat[] };
  sessions: { total: number; withCompletedWork: number };
  tasks: { total: number; completed: number; failed: number; debugging: number };
  codingTime: { totalMs: number; thisWeekMs: number; thisMonthMs: number; nightMs: number; longestMs: number };
  code: CodeStats;
  rules: { codingTime: string; files: string; nightHours: string };
  streak?: { current: number; longest: number };
  achievements: Achievement[];
  /** Missing on APIs before tiered achievements. */
  achievementSummary?: AchievementSummary;
}

/* ---------------------------------------------------------------- service info */

export interface ApiMeta {
  service: string;
  apiVersion: string;
  protocol: number;
  desktopRequirements: Record<string, { since: string; capability: string; reason: string }>;
}

export type ReleasePlatform = "windows" | "android";

export interface Release {
  platform: ReleasePlatform;
  version: string;
  tag: string;
  name: string | null;
  publishedAt: string | null;
  notes: string;
  url: string;
  download: { name: string; url: string; size: number } | null;
}

/* ---------------------------------------------------------------- admin */

export interface AdminServerError {
  at: string;
  method: string;
  path: string;
  status: number;
  code: string;
  message: string;
  requestId: string;
  client: string | null;
}

/** GET /v1/admin/overview */
export interface AdminOverview {
  service: { version: string; commit: string | null; database: string; storage: boolean; telegram: boolean };
  health: {
    startedAt: string;
    uptimeSeconds: number;
    requests: number;
    serverErrors: number;
    clientErrors: number;
    memoryMb: number;
    recentErrors: AdminServerError[];
  };
  realtime: { streams: number; devices: number; web: number };
  users: { total: number; new24h: number; new7d: number; active24h: number; byProvider: Record<string, number> };
  devices: { desktops: number; desktopsOnline: number; phones: number; revoked: number; desktopVersions: Record<string, number> };
  projects: { total: number };
  sessions: { total: number; working: number; updated24h: number };
  approvals: { pending: number };
  work: { last7dMs: number; tasks7d: number; failed7d: number };
}

/** GET /v1/admin/users */
export interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: string | null;
  emailVerified: boolean | null;
  createdAt: string;
  lastSeenAt: string | null;
  devices: number;
  projects: number;
  sessions: number;
}
