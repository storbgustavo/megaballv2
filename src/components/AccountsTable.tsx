import { CheckCircle2, XCircle, Clock, Ban, Loader2, AlertCircle } from 'lucide-react';
import type { Account, AccountStatus } from '@/types';
import { formatCurrency } from '@/utils/format';

interface AccountsTableProps {
  accounts: Account[];
}

const statusConfig: Record<
  AccountStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bg: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-ink-300',
    bg: 'bg-ink-700/50',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    color: 'text-warn-DEFAULT',
    bg: 'bg-warn-soft',
  },
  win: {
    label: 'WIN',
    icon: CheckCircle2,
    color: 'text-win-DEFAULT',
    bg: 'bg-win-soft',
  },
  loss: {
    label: 'LOSS',
    icon: XCircle,
    color: 'text-loss-DEFAULT',
    bg: 'bg-loss-soft',
  },
  suspended: {
    label: 'Suspended',
    icon: Ban,
    color: 'text-warn-DEFAULT',
    bg: 'bg-warn-soft',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    color: 'text-err-DEFAULT',
    bg: 'bg-err-soft',
  },
};

export function AccountsTable({ accounts }: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="card-surface p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-ink-700/50 flex items-center justify-center mb-3">
          <Clock className="w-7 h-7 text-ink-400" />
        </div>
        <p className="text-sm text-ink-300 font-medium">No accounts loaded</p>
        <p className="text-xs text-ink-400 mt-1">
          Upload a .txt token file to load accounts
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700/50 bg-ink-900/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Phone
              </th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Balance Before
              </th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Bet
              </th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Winnings
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Rounds
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                W / L
              </th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Balance After
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                IP
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, idx) => {
              const sc = statusConfig[acc.status];
              const StatusIcon = sc.icon;
              const pl =
                acc.balanceBefore !== null && acc.balanceAfter !== null
                  ? acc.balanceAfter - acc.balanceBefore
                  : null;

              return (
                <tr
                  key={acc.id}
                  className={`border-b border-ink-800/50 hover:bg-ink-800/30 transition-colors duration-100 ${
                    acc.status === 'processing' ? 'bg-warn-soft/20' : ''
                  } ${idx % 2 === 0 ? '' : 'bg-ink-900/20'}`}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-ink-100">
                      {acc.phone}
                    </span>
                    {acc.status === 'processing' && acc.currentStep && (
                      <p className="text-xs text-warn-DEFAULT/70 mt-0.5 truncate max-w-[180px]">
                        {acc.currentStep}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-ink-200">
                    {formatCurrency(acc.balanceBefore)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-ink-300">
                    {acc.betAmount > 0 ? formatCurrency(acc.betAmount * acc.rounds) : '—'}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono text-xs font-medium ${
                      acc.winnings > 0
                        ? 'text-win-DEFAULT'
                        : acc.winnings === 0 && acc.status === 'loss'
                        ? 'text-loss-DEFAULT'
                        : 'text-ink-400'
                    }`}
                  >
                    {acc.status === 'pending' ? '—' : formatCurrency(acc.winnings)}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-xs text-ink-300">
                    {acc.rounds > 0 ? acc.rounds : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {acc.status === 'pending' ? (
                      <span className="text-ink-500 text-xs font-mono">—</span>
                    ) : (
                      <span className="font-mono text-xs">
                        <span className="text-win-DEFAULT">{acc.wins}</span>
                        <span className="text-ink-500 mx-1">/</span>
                        <span className="text-loss-DEFAULT">{acc.losses}</span>
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono text-xs font-medium ${
                      pl !== null && pl !== 0
                        ? pl > 0
                          ? 'text-win-DEFAULT'
                          : 'text-loss-DEFAULT'
                        : 'text-ink-200'
                    }`}
                  >
                    {formatCurrency(acc.balanceAfter)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}
                    >
                      <StatusIcon
                        className={`w-3 h-3 ${acc.status === 'processing' ? 'animate-spin' : ''}`}
                      />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-ink-300">
                      {acc.ip || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
