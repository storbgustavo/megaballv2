import { Loader2 } from 'lucide-react';

interface ProgressTrackerProps {
  processed: number;
  total: number;
  isRunning: boolean;
}

export function ProgressTracker({ processed, total, isRunning }: ProgressTrackerProps) {
  const pct = total > 0 ? (processed / total) * 100 : 0;

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
          <span className="text-sm font-semibold text-ink-200">
            Processing Progress
          </span>
        </div>
        <span className="text-sm font-mono text-ink-300">
          {processed} / {total}
          <span className="text-ink-400 ml-2">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-ink-900 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-300 transition-all duration-500 ease-out relative"
          style={{ width: `${pct}%` }}
        >
          {isRunning && (
            <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-40" />
          )}
        </div>
      </div>
    </div>
  );
}
