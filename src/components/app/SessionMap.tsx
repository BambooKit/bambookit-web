import { Bot, Cpu, FileDiff, FlaskConical, FolderGit2, Laptop, MessagesSquare, User } from "lucide-react";
import { RoadmapLine, RoadmapNode, type RoadmapStatus } from "@/components/Roadmap";
import { agentLabel } from "./SessionHistory";
import type { ChangedFile, Session, SessionHistory } from "@/lib/types";

/** The live session diagram, roadmap.sh style:
 *  Account → Device → Project → Session → Agent → Model, with branches for files and tests.
 *  Check circles reflect live state (online / changed / passed). Same data as the other tabs. */
export function SessionMap({
  session,
  pcName,
  pcOnline,
  isLive,
  changes,
  history,
  accountLabel,
}: {
  session: Session;
  pcName: string;
  pcOnline: boolean;
  isLive: boolean;
  changes?: ChangedFile[];
  history?: SessionHistory;
  accountLabel: string;
}) {
  const h = history ?? {};
  const project = h.projectName ?? session.projectName;
  const agent = agentLabel(h.agent ?? session.agent);
  const model = h.model ?? session.model;

  const changedCount = changes?.length ?? h.changes?.length ?? 0;
  const passed = h.summary?.testsPassed ?? h.tests?.filter((t) => t.status === "passed").length ?? 0;
  const failed = h.summary?.testsFailed ?? h.tests?.filter((t) => t.status === "failed").length ?? 0;
  const testsRun = (h.tests?.length ?? 0) || passed + failed;

  const sessionStatus: RoadmapStatus =
    session.status === "error" ? "todo" : session.status === "busy" || session.status === "retry" ? "progress" : "done";
  const testStatus: RoadmapStatus = testsRun === 0 ? "todo" : failed > 0 ? "todo" : "done";

  const spine = [
    { key: "account", role: "primary" as const, icon: <User className="size-4" />, title: "Account", sub: accountLabel, status: "done" as RoadmapStatus },
    {
      key: "device",
      role: "primary" as const,
      icon: <Laptop className="size-4" />,
      title: pcName,
      sub: pcOnline ? (isLive ? "online · live" : "online") : "offline",
      status: (pcOnline ? "done" : "todo") as RoadmapStatus,
    },
    {
      key: "project",
      role: "primary" as const,
      icon: <FolderGit2 className="size-4" />,
      title: project || "Project",
      sub: h.branch ?? undefined,
      status: (project ? "done" : "todo") as RoadmapStatus,
    },
  ];

  const tail = [
    {
      key: "agent",
      role: "primary" as const,
      icon: <Bot className="size-4" />,
      title: agent || "Agent",
      status: (agent ? "done" : "todo") as RoadmapStatus,
    },
    {
      key: "model",
      role: "primary" as const,
      icon: <Cpu className="size-4" />,
      title: model || "Model",
      status: (model ? "done" : "todo") as RoadmapStatus,
    },
  ];

  return (
    <div className="flex flex-col items-center py-2">
      {spine.map((n) => (
        <div key={n.key} className="flex flex-col items-center">
          <RoadmapNode role={n.role} status={n.status} icon={n.icon} title={n.title} sub={n.sub} className="min-w-[13rem] max-w-[18rem]" />
          <RoadmapLine variant="solid" className="my-4 h-8" />
        </div>
      ))}

      {/* Session node with its live branches. */}
      <RoadmapNode
        role="primary"
        status={sessionStatus}
        icon={<MessagesSquare className="size-4" />}
        title={session.title || "Session"}
        sub={session.status}
        className="min-w-[13rem] max-w-[18rem]"
      />
      <RoadmapLine variant="dashed" className="h-5" />
      <div className="flex flex-wrap justify-center gap-3 px-1">
        <RoadmapNode
          role="secondary"
          status={changedCount > 0 ? "progress" : "todo"}
          icon={<FileDiff className="size-4" />}
          title="Files"
          sub={changedCount > 0 ? `${changedCount} changed` : "no changes"}
          className="min-w-[8.5rem]"
        />
        <RoadmapNode
          role="secondary"
          status={testStatus}
          icon={<FlaskConical className="size-4" />}
          title="Tests"
          sub={testsRun === 0 ? "none run" : failed > 0 ? `${failed} failed` : `${passed} passed`}
          className="min-w-[8.5rem]"
        />
      </div>
      <RoadmapLine variant="solid" className="my-4 h-8" />

      {tail.map((n, i) => (
        <div key={n.key} className="flex flex-col items-center">
          <RoadmapNode role={n.role} status={n.status} icon={n.icon} title={n.title} className="min-w-[13rem] max-w-[18rem]" />
          {i < tail.length - 1 && <RoadmapLine variant="solid" className="my-4 h-8" />}
        </div>
      ))}
    </div>
  );
}
