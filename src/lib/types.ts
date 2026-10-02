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

export interface Approval {
  id: string;
  sessionId: string;
  sessionTitle: string | null;
  projectName: string | null;
  permission: string;
  title: string;
  patterns: string[];
  status: string;
  createdAt: string;
}

export interface Me {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  provider: string | null;
}

/** A realtime event as sent by GET /v1/realtime/stream. */
export interface StreamEvent {
  type: string;
  sessionId: string | null;
  deviceId: string | null;
  payload: any;
}
