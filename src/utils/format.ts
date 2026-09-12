import type { Account } from '@/types';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return brlFormatter.format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function timestamp(): string {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const IP_POOL = [
  '187.45.' + rnd(0, 255) + '.' + rnd(0, 255),
  '179.' + rnd(104, 126) + '.' + rnd(0, 255) + '.' + rnd(0, 255),
  '200.' + rnd(96, 143) + '.' + rnd(0, 255) + '.' + rnd(0, 255),
  '45.' + rnd(160, 239) + '.' + rnd(0, 255) + '.' + rnd(0, 255),
  '168.' + rnd(0, 255) + '.' + rnd(0, 255) + '.' + rnd(0, 255),
];

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomIp(): string {
  return IP_POOL[Math.floor(Math.random() * IP_POOL.length)];
}

export function randomProxy(): string {
  const a = rnd(2, 254);
  const b = rnd(2, 254);
  return `socks5://proxy${rnd(1, 99)}.${a}.${b}.com:1080`;
}

export function parseAccountsFile(content: string): Omit<
  Account,
  | 'id'
  | 'balanceBefore'
  | 'betAmount'
  | 'winnings'
  | 'rounds'
  | 'wins'
  | 'losses'
  | 'balanceAfter'
  | 'status'
  | 'ip'
  | 'proxy'
  | 'startedAt'
  | 'finishedAt'
  | 'currentStep'
>[] {
  // Need to import Account type but avoid circular — inline the shape
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const accounts: Omit<
    Account,
    | 'id'
    | 'balanceBefore'
    | 'betAmount'
    | 'winnings'
    | 'rounds'
    | 'wins'
    | 'losses'
    | 'balanceAfter'
    | 'status'
    | 'ip'
    | 'proxy'
    | 'startedAt'
    | 'finishedAt'
    | 'currentStep'
  >[] = [];
  for (const line of lines) {
    const [fieldsPart, domainPart] = line.split('|');
    const domain = (domainPart || '').trim();
    const fields = fieldsPart.trim().split(/\s+/);
    const acc: Record<string, string> = {};
    for (const f of fields) {
      const eq = f.indexOf('=');
      if (eq > -1) {
        acc[f.slice(0, eq)] = f.slice(eq + 1);
      }
    }
    if (acc.phone) {
      accounts.push({
        phone: acc.phone,
        password: acc.password || '',
        deviceType: acc.device_type || 'desktop',
        deviceId: acc.device_id || '',
        bearerToken: acc.bearer_token || '',
        xtag: acc.xtag || '',
        domain: domain || 'unknown.com',
      });
    }
  }
  return accounts;
}
