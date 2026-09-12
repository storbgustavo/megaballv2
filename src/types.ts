export type AccountStatus =
  | 'pending'
  | 'processing'
  | 'win'
  | 'loss'
  | 'suspended'
  | 'error';

export interface Account {
  id: string;
  phone: string;
  password: string;
  deviceType: string;
  deviceId: string;
  bearerToken: string;
  xtag: string;
  domain: string;
  balanceBefore: number | null;
  betAmount: number;
  winnings: number;
  rounds: number;
  wins: number;
  losses: number;
  balanceAfter: number | null;
  status: AccountStatus;
  ip: string;
  proxy: string;
  startedAt: number | null;
  finishedAt: number | null;
  currentStep: string;
}

export type LogLevel = 'info' | 'success' | 'error' | 'warn' | 'debug' | 'step';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  phone?: string;
}

export interface BotConfig {
  tokenFile: string;
  betAmount: number;
  roundsPerAccount: number;
  simultaneousAccounts: number;
  debugMode: boolean;
  headless: boolean;
  proxyEnabled: boolean;
  proxyUrl: string;
}

export interface BotStats {
  totalAccounts: number;
  processed: number;
  wins: number;
  losses: number;
  suspended: number;
  errors: number;
  totalBet: number;
  totalWon: number;
}

export type BotState = 'idle' | 'running' | 'paused' | 'stopping';
