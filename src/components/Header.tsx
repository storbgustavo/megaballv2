import { Activity, Radio } from 'lucide-react';
import type { BotState } from '@/types';

interface HeaderProps {
  state: BotState;
  accountCount: number;
}

const stateConfig: Record<BotState, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'IDLE', color: 'text-ink-300 bg-ink-700', pulse: false },
  running: { label: 'RUNNING', color: 'text-brand-400 bg-brand-500/10 border border-brand-500/30', pulse: true },
  paused: { label: 'PAUSED', color: 'text-warn-DEFAULT bg-warn-soft', pulse: false },
  stopping: { label: 'STOPPING', color: 'text-warn-DEFAULT bg-warn-soft', pulse: true },
};

export function Header({ state, accountCount }: HeaderProps) {
  const cfg = stateConfig[state];
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-ink-700/60 bg-ink-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Activity className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
          </div>
          {state === 'running' && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-400 animate-pulse-glow ring-2 ring-ink-900" />
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-ink-100 tracking-tight leading-none">
            MegaBall Bot
          </h1>
          <p className="text-xs text-ink-400 mt-0.5">
            Evolution Gaming · Automated Betting
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-ink-400">
          <Radio className="w-3.5 h-3.5" />
          <span>{accountCount} accounts loaded</span>
        </div>
        <span
          className={`status-dot font-mono ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? 'bg-brand-400' : 'bg-ink-300'}`} />
          {cfg.label}
        </span>
      </div>
    </header>
  );
}
