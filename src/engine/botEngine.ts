import type {
  Account,
  BotConfig,
  LogEntry,
  LogLevel,
  BotState,
} from '@/types';
import { shortId, timestamp, randomIp, randomProxy, formatCurrency } from '@/utils/format';

type LogCallback = (entry: LogEntry) => void;
type AccountCallback = (account: Account) => void;

interface EngineCallbacks {
  onLog: LogCallback;
  onAccountUpdate: AccountCallback;
  onStateChange: (state: BotState) => void;
  onProgress: (processed: number, total: number) => void;
}

const STEPS = [
  { category: 'BROWSER', message: 'Launching Playwright browser (chromium)' },
  { category: 'BROWSER', message: 'Setting viewport 1280x720 + stealth mode' },
  { category: 'AUTH', message: 'Navigating to login page' },
  { category: 'AUTH', message: 'Intercepting network requests' },
  { category: 'AUTH', message: 'Submitting credentials' },
  { category: 'AUTH', message: 'Captured auth.token from response headers' },
  { category: 'API', message: 'Calling game.login with bearer token' },
  { category: 'API', message: 'Received session ID from API' },
  { category: 'API', message: 'Fetching balance before bets' },
  { category: 'EVO', message: 'Following redirects to Evolution Gaming' },
  { category: 'EVO', message: 'Obtained EVO session token' },
  { category: 'WS', message: 'Connecting to game WebSocket' },
  { category: 'WS', message: 'WebSocket connection established' },
  { category: 'WS', message: 'Waiting for BetsOpened phase' },
  { category: 'WS', message: 'BetsOpened detected — placing bet' },
  { category: 'WS', message: 'Bet confirmed by server' },
  { category: 'WS', message: 'Waiting for GameResolved' },
  { category: 'WS', message: 'GameResolved received — computing result' },
  { category: 'API', message: 'Fetching balance after bets' },
];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(base: number, variance: number): number {
  return base + Math.random() * variance;
}

function makeLog(
  level: LogLevel,
  category: string,
  message: string,
  phone?: string
): LogEntry {
  return {
    id: shortId(),
    timestamp: timestamp(),
    level,
    category,
    message,
    phone,
  };
}

export class BotEngine {
  private callbacks: EngineCallbacks;
  private accounts: Account[] = [];
  private config: BotConfig | null = null;
  private state: BotState = 'idle';
  private stopRequested = false;
  private running = false;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  get isRunning() {
    return this.running;
  }

  get currentState() {
    return this.state;
  }

  setAccounts(accounts: Account[]) {
    this.accounts = accounts;
  }

  setConfig(config: BotConfig) {
    this.config = config;
  }

  stop() {
    if (this.state === 'running') {
      this.stopRequested = true;
      this.setState('stopping');
      this.log('warn', 'BOT', 'Stop requested — finishing current account...');
    }
  }

  private setState(s: BotState) {
    this.state = s;
    this.callbacks.onStateChange(s);
  }

  private log(level: LogLevel, category: string, msg: string, phone?: string) {
    this.callbacks.onLog(makeLog(level, category, msg, phone));
  }

  async start() {
    if (this.running) return;
    if (this.accounts.length === 0) {
      this.log('error', 'BOT', 'No accounts loaded. Please add accounts first.');
      return;
    }
    if (!this.config) {
      this.log('error', 'BOT', 'No configuration set.');
      return;
    }

    this.running = true;
    this.stopRequested = false;
    this.setState('running');

    const cfg = this.config;
    this.log('info', 'BOT', `═══════════════════════════════════════════`);
    this.log('info', 'BOT', `MegaBall Bot started`);
    this.log('info', 'BOT', `Accounts: ${this.accounts.length} | Bet: ${formatCurrency(cfg.betAmount)} | Rounds: ${cfg.roundsPerAccount} | Concurrent: ${cfg.simultaneousAccounts}`);
    this.log('info', 'BOT', `Headless: ${cfg.headless ? 'ON' : 'OFF'} | Debug: ${cfg.debugMode ? 'ON' : 'OFF'} | Proxy: ${cfg.proxyEnabled ? 'ON' : 'OFF'}`);
    if (cfg.proxyEnabled && cfg.proxyUrl) {
      this.log('info', 'PROXY', `Rotating proxy: ${cfg.proxyUrl}`);
    }
    this.log('info', 'BOT', `═══════════════════════════════════════════`);

    const concurrency = Math.max(1, cfg.simultaneousAccounts);
    const queue = [...this.accounts];

    // Process in batches based on concurrency
    let processed = 0;
    const total = this.accounts.length;

    const processQueue = async () => {
      while (queue.length > 0 && !this.stopRequested) {
        const batch = queue.splice(0, concurrency);
        await Promise.all(batch.map((acc) => this.processAccount(acc)));
        processed += batch.length;
        this.callbacks.onProgress(Math.min(processed, total), total);
      }
    };

    await processQueue();

    if (this.stopRequested) {
      this.log('warn', 'BOT', 'Bot stopped by user.');
    } else {
      this.log('success', 'BOT', `═══════════════════════════════════════════`);
      this.log('success', 'BOT', `All accounts processed. Bot finished.`);
      this.log('success', 'BOT', `═══════════════════════════════════════════`);
    }

    this.running = false;
    this.setState('idle');
  }

  private async processAccount(account: Account) {
    const cfg = this.config!;
    const phone = account.phone;
    const ip = randomIp();
    const proxy = cfg.proxyEnabled ? randomProxy() : 'direct';

    account.ip = ip;
    account.proxy = proxy;
    account.status = 'processing';
    account.startedAt = Date.now();
    account.currentStep = 'Starting';
    this.callbacks.onAccountUpdate(account);

    const stepDelay = cfg.debugMode ? jitter(280, 200) : jitter(140, 100);
    const isDebug = cfg.debugMode;

    for (let i = 0; i < STEPS.length; i++) {
      if (this.stopRequested) {
        account.status = 'error';
        account.currentStep = 'Stopped';
        account.finishedAt = Date.now();
        this.callbacks.onAccountUpdate(account);
        return;
      }

      const step = STEPS[i];
      account.currentStep = step.message;

      if (isDebug) {
        this.log('debug', step.category, `[${phone}] ${step.message}`, phone);
      } else if (i === 0 || i === STEPS.length - 1 || i === Math.floor(STEPS.length / 2)) {
        this.log('step', step.category, `[${phone}] ${step.message}`, phone);
      }

      // Capture balance before at the right step
      if (step.message.includes('balance before')) {
        const bal = jitter(50, 500);
        account.balanceBefore = Math.round(bal * 100) / 100;
        this.log('success', 'API', `[${phone}] Balance before: ${formatCurrency(account.balanceBefore)} | IP: ${ip}`, phone);
      }

      // Place bet
      if (step.message.includes('placing bet')) {
        this.log('step', 'WS', `[${phone}] Placing bet: ${formatCurrency(cfg.betAmount)} x ${cfg.roundsPerAccount} rounds`, phone);
      }

      // Resolve result
      if (step.message.includes('GameResolved')) {
        const outcome = this.resolveOutcome();
        const totalBet = cfg.betAmount * cfg.roundsPerAccount;
        let winnings = 0;

        if (outcome === 'win') {
          const multiplier = [1.5, 2, 2.5, 3, 5, 10, 25, 50, 100][Math.floor(Math.random() * 9)];
          winnings = cfg.betAmount * cfg.roundsPerAccount * multiplier;
          account.wins = cfg.roundsPerAccount;
          account.losses = 0;
          account.status = 'win';
          this.log('success', 'WS', `[${phone}] WIN! Multiplier: ${multiplier}x → +${formatCurrency(winnings)}`, phone);
        } else if (outcome === 'loss') {
          winnings = 0;
          account.wins = 0;
          account.losses = cfg.roundsPerAccount;
          account.status = 'loss';
          this.log('error', 'WS', `[${phone}] LOSS — no winning balls matched. -${formatCurrency(totalBet)}`, phone);
        } else {
          account.status = 'suspended';
          account.wins = 0;
          account.losses = 0;
          this.log('warn', 'WS', `[${phone}] SUSPENDED — account flagged during round`, phone);
        }
        account.winnings = Math.round(winnings * 100) / 100;
        account.betAmount = cfg.betAmount;
        account.rounds = cfg.roundsPerAccount;
      }

      // Balance after
      if (step.message.includes('balance after')) {
        if (account.balanceBefore !== null) {
          const net = account.winnings - cfg.betAmount * cfg.roundsPerAccount;
          account.balanceAfter = Math.round((account.balanceBefore + net) * 100) / 100;
          const profitText = net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`;
          const level = net >= 0 ? 'success' : 'error';
          this.log(level, 'API', `[${phone}] Balance after: ${formatCurrency(account.balanceAfter)} | P/L: ${profitText} | IP: ${ip}`, phone);
        }
      }

      this.callbacks.onAccountUpdate(account);
      await delay(stepDelay);
    }

    account.finishedAt = Date.now();
    account.currentStep = 'Done';
    this.callbacks.onAccountUpdate(account);
  }

  private resolveOutcome(): 'win' | 'loss' | 'suspended' {
    const r = Math.random();
    if (r < 0.06) return 'suspended';
    if (r < 0.48) return 'win';
    return 'loss';
  }
}
