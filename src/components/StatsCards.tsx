import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import type { BotStats } from '@/types';
import { formatCurrency } from '@/utils/format';

interface StatsCardsProps {
  stats: BotStats;
}

interface CardDef {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Users;
  accent: string;
  iconBg: string;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const profitLoss = stats.totalWon - stats.totalBet;
  const winRate =
    stats.processed > 0 ? (stats.wins / stats.processed) * 100 : 0;

  const cards: CardDef[] = [
    {
      label: 'Total Accounts',
      value: stats.totalAccounts.toString(),
      sub: `${stats.processed} processed`,
      icon: Users,
      accent: 'text-ink-100',
      iconBg: 'bg-ink-700/60 text-ink-200',
    },
    {
      label: 'Wins',
      value: stats.wins.toString(),
      sub: `${winRate.toFixed(1)}% win rate`,
      icon: Trophy,
      accent: 'text-win-DEFAULT',
      iconBg: 'bg-win-soft text-win-DEFAULT',
    },
    {
      label: 'Losses',
      value: stats.losses.toString(),
      sub: stats.suspended > 0 ? `${stats.suspended} suspended` : undefined,
      icon: TrendingDown,
      accent: 'text-loss-DEFAULT',
      iconBg: 'bg-loss-soft text-loss-DEFAULT',
    },
    {
      label: 'Profit / Loss',
      value: formatCurrency(profitLoss),
      sub: `Bet: ${formatCurrency(stats.totalBet)} · Won: ${formatCurrency(stats.totalWon)}`,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
      accent: profitLoss >= 0 ? 'text-win-DEFAULT' : 'text-loss-DEFAULT',
      iconBg:
        profitLoss >= 0
          ? 'bg-win-soft text-win-DEFAULT'
          : 'bg-loss-soft text-loss-DEFAULT',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="card-surface card-surface-hover p-4 flex items-start justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs text-ink-400 font-medium uppercase tracking-wide">
                {c.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${c.accent}`}>
                {c.value}
              </p>
              {c.sub && (
                <p className="text-xs text-ink-400 mt-1 truncate">{c.sub}</p>
              )}
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
