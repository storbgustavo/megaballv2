import { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import type { LogEntry, LogLevel } from '@/types';

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  debugMode: boolean;
}

const levelConfig: Record<
  LogLevel,
  { color: string; prefix: string; bg: string }
> = {
  info: { color: 'text-ink-200', prefix: 'INFO', bg: '' },
  success: { color: 'text-win-DEFAULT', prefix: ' OK ', bg: 'bg-win-soft/30' },
  error: { color: 'text-loss-DEFAULT', prefix: 'FAIL', bg: 'bg-loss-soft/30' },
  warn: { color: 'text-warn-DEFAULT', prefix: 'WARN', bg: 'bg-warn-soft/30' },
  debug: { color: 'text-sky-300', prefix: 'DBG ', bg: '' },
  step: { color: 'text-brand-300', prefix: 'STEP', bg: '' },
};

export function LogPanel({ logs, onClear, debugMode }: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="card-surface flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-ink-100 uppercase tracking-wide">
            Live Log
          </h3>
          <span className="text-xs text-ink-400 font-mono">
            ({logs.length})
          </span>
          {debugMode && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono">
              DEBUG
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-ink-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-brand-500"
            />
            Auto-scroll
          </label>
          <button
            onClick={onClear}
            className="text-ink-400 hover:text-ink-200 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-0 min-h-0 font-mono"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-ink-400 text-xs">
            Waiting for bot activity...
          </div>
        ) : (
          logs.map((log) => {
            const cfg = levelConfig[log.level];
            return (
              <div
                key={log.id}
                className={`log-line flex items-start gap-2 rounded ${cfg.bg}`}
              >
                <span className="text-ink-500 shrink-0">
                  {log.timestamp}
                </span>
                <span
                  className={`shrink-0 font-bold ${cfg.color}`}
                >
                  [{cfg.prefix}]
                </span>
                <span className="shrink-0 text-ink-400 text-xs">
                  {log.category}
                </span>
                <span className={`flex-1 break-all ${cfg.color}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
