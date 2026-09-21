'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, CheckCircle2, AlertTriangle, Terminal, FileCode2 } from 'lucide-react';
import { AgentEvent } from '@/types/domain';
import { DEMO_EVENTS } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function AgentReplay() {
  const [events] = useState<AgentEvent[]>(DEMO_EVENTS);
  const [currentIdx, setCurrentIdx] = useState(DEMO_EVENTS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeEvent = events[currentIdx];

  const handleNext = () => {
    if (currentIdx < events.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setIsPlaying(false);
  };

  return (
    <div className="rounded-lg border border-[#1c2529] bg-[#0c1012] overflow-hidden flex flex-col font-sans text-xs">
      {/* Replay Controls & Scrubber */}
      <div className="p-3 bg-[#0f1416] border-b border-[#1c2529] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#f1f5f9]">Agent Replay Timeline</span>
            <Badge variant="outline">
              Event {currentIdx + 1} of {events.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} title="Reset to start">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-[#10b981]" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrev} disabled={currentIdx === 0}>
              Step Back
            </Button>
            <Button variant="primary" size="sm" onClick={handleNext} disabled={currentIdx === events.length - 1}>
              Step Forward
            </Button>
          </div>
        </div>

        {/* Scrubber Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={events.length - 1}
            value={currentIdx}
            onChange={(e) => setCurrentIdx(Number(e.target.value))}
            className="w-full h-1.5 bg-[#1c2529] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
            <span>{events[0].timestamp} (Start)</span>
            <span>{events[events.length - 1].timestamp} (Gate)</span>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid for Current Event */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
        {/* Left: Event Stream List (5 cols) */}
        <div className="md:col-span-5 border-r border-[#1c2529] p-3 space-y-1.5 overflow-y-auto max-h-[340px] bg-[#0a0d0e]/60">
          {events.map((evt, idx) => {
            const isSelected = idx === currentIdx;
            const isPast = idx < currentIdx;

            return (
              <button
                key={evt.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-full text-left p-2 rounded border transition-all text-xs flex items-start gap-2 ${
                  isSelected
                    ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#f1f5f9]'
                    : isPast
                    ? 'border-transparent text-[#94a3b8] hover:bg-[#151b1e]'
                    : 'border-transparent text-[#475569] hover:bg-[#151b1e]/40'
                }`}
              >
                <span className="font-mono text-[10px] text-[#64748b] shrink-0 pt-0.5">{evt.timestamp}</span>
                <div className="truncate">
                  <div className="font-medium truncate">{evt.summary}</div>
                  <div className="text-[10px] font-mono text-[#64748b]">{evt.type}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: State Inspector (7 cols) */}
        <div className="md:col-span-7 p-4 space-y-4 bg-[#080b0c] overflow-y-auto max-h-[340px]">
          <div className="flex items-center justify-between border-b border-[#1c2529] pb-2">
            <div>
              <div className="text-[11px] font-mono text-[#64748b] uppercase">Inspecting State Snapshot</div>
              <div className="text-sm font-semibold text-[#f1f5f9] mt-0.5">{activeEvent.summary}</div>
            </div>
            <Badge variant={activeEvent.type.includes('approval') ? 'warning' : 'info'}>
              {activeEvent.type}
            </Badge>
          </div>

          {/* Specific Data Payload Renderers */}
          {activeEvent.data?.diff && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                <FileCode2 className="h-3.5 w-3.5 text-[#10b981]" /> File Modified:{' '}
                <code className="text-[#34d399]">{activeEvent.data.diff.file}</code>
              </div>
              <div className="p-3 bg-[#0a0d0e] border border-[#1c2529] rounded font-mono text-[11px] space-y-1">
                {activeEvent.data.diff.chunks[0].lines.map((l, i) => (
                  <div
                    key={i}
                    className={
                      l.type === 'add'
                        ? 'text-[#34d399]'
                        : l.type === 'remove'
                        ? 'text-[#f87171]'
                        : 'text-[#64748b]'
                    }
                  >
                    {l.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeEvent.data?.output && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                <Terminal className="h-3.5 w-3.5 text-[#10b981]" /> Command Execution Output:
              </div>
              <pre className="p-3 bg-[#0a0d0e] border border-[#1c2529] rounded font-mono text-[11px] text-[#cbd5e1] whitespace-pre-wrap">
                {activeEvent.data.output}
              </pre>
            </div>
          )}

          {activeEvent.data?.approval && (
            <div className="p-4 rounded-lg bg-[#14120a] border border-[#f59e0b]/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#fbbf24]">
                <AlertTriangle className="h-4 w-4" /> Dangerous Action Gate Intercepted
              </div>
              <p className="text-xs text-[#cbd5e1]">
                Task execution paused at {activeEvent.timestamp}. Requires user approval before proceeding with production
                traffic changes.
              </p>
            </div>
          )}

          {!activeEvent.data?.diff && !activeEvent.data?.output && !activeEvent.data?.approval && (
            <div className="p-3 rounded bg-[#0a0d0e] border border-[#1c2529] font-mono text-[11px] text-[#94a3b8]">
              Raw event timestamp: {activeEvent.timestamp} • Agent ID: {activeEvent.agentId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
