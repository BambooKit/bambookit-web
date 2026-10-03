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
