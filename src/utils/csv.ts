import type { Account } from '@/types';

export function exportAccountsCsv(accounts: Account[]): void {
  const headers = [
    'phone',
    'balance_before',
    'bet_amount',
    'winnings',
    'rounds',
    'wins',
    'losses',
    'balance_after',
    'profit_loss',
    'status',
    'ip',
    'proxy',
  ];

  const rows = accounts.map((a) => {
    const pl =
      a.balanceBefore !== null && a.balanceAfter !== null
        ? (a.balanceAfter - a.balanceBefore).toFixed(2)
        : '';
    return [
      a.phone,
      a.balanceBefore?.toFixed(2) ?? '',
      a.betAmount.toFixed(2),
      a.winnings.toFixed(2),
      a.rounds.toString(),
      a.wins.toString(),
      a.losses.toString(),
      a.balanceAfter?.toFixed(2) ?? '',
      pl,
      a.status,
      a.ip,
      a.proxy,
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `megaball-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
