import { useCallback, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ConfigPanel } from '@/components/ConfigPanel';
import { AccountsTable } from '@/components/AccountsTable';
import { LogPanel } from '@/components/LogPanel';
import { BotEngine } from '@/engine/botEngine';
import type {
  Account,
  BotConfig,
  BotState,
  BotStats,
  LogEntry,
} from '@/types';
import { parseAccountsFile, shortId } from '@/utils/format';

const DEFAULT_CONFIG: BotConfig = {
  tokenFile: '',
  betAmount: 1.0,
  roundsPerAccount: 5,
  simultaneousAccounts: 3,
  debugMode: true,
  headless: true,
  proxyEnabled: false,
  proxyUrl: 'socks5://proxy.example.com:1080',
};

function createAccount(raw: Omit<
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
>): Account {
  return {
    ...raw,
    id: shortId(),
    balanceBefore: null,
    betAmount: 0,
    winnings: 0,
    rounds: 0,
    wins: 0,
    losses: 0,
    balanceAfter: null,
    status: 'pending',
    ip: '',
    proxy: '',
    startedAt: null,
    finishedAt: null,
    currentStep: '',
  };
}

function App() {
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [botState, setBotState] = useState<BotState>('idle');
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [fileName, setFileName] = useState('');
  const [maxLogs] = useState(500);

  const engineRef = useRef<BotEngine | null>(null);
  const accountsRef = useRef<Account[]>([]);

  // Keep ref in sync for engine callbacks
  const updateAccount = useCallback((updated: Account) => {
    accountsRef.current = accountsRef.current.map((a) =>
      a.id === updated.id ? updated : a
    );
    setAccounts([...accountsRef.current]);
  }, []);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > maxLogs ? next.slice(-maxLogs) : next;
    });
  }, []);

  const onProgress = useCallback((processed: number, total: number) => {
    setProgress({ processed, total });
  }, []);

  // Create engine once
  if (!engineRef.current) {
    engineRef.current = new BotEngine({
      onLog: addLog,
      onAccountUpdate: updateAccount,
      onStateChange: setBotState,
      onProgress,
    });
  }

  const stats: BotStats = useMemo(() => {
    const totalBet = accounts
      .filter((a) => a.status !== 'pending' && a.status !== 'error')
      .reduce((sum, a) => sum + a.betAmount * a.rounds, 0);
    const totalWon = accounts.reduce((sum, a) => sum + a.winnings, 0);
    return {
      totalAccounts: accounts.length,
      processed: accounts.filter(
        (a) => a.status === 'win' || a.status === 'loss' || a.status === 'suspended'
      ).length,
      wins: accounts.filter((a) => a.status === 'win').length,
      losses: accounts.filter((a) => a.status === 'loss').length,
      suspended: accounts.filter((a) => a.status === 'suspended').length,
      errors: accounts.filter((a) => a.status === 'error').length,
      totalBet,
      totalWon,
    };
  }, [accounts]);

  const handleFileUpload = (content: string, name: string) => {
    const parsed = parseAccountsFile(content);
    const newAccounts = parsed.map(createAccount);
    accountsRef.current = newAccounts;
    setAccounts(newAccounts);
    setFileName(name);
    setProgress({ processed: 0, total: newAccounts.length });
    setLogs([]);
    addLog({
      id: shortId(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      category: 'BOT',
      message: `Loaded ${newAccounts.length} accounts from ${name}`,
    });
  };

  const handleStart = () => {
    if (!engineRef.current) return;
    engineRef.current.setAccounts(accountsRef.current);
    engineRef.current.setConfig(config);
    setProgress({ processed: 0, total: accountsRef.current.length });
    engineRef.current.start();
  };

  const handleStop = () => {
    engineRef.current?.stop();
  };

  const handleClear = () => {
    accountsRef.current = [];
    setAccounts([]);
    setFileName('');
    setProgress({ processed: 0, total: 0 });
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <Header state={botState} accountCount={accounts.length} />

      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
        {/* Stats row */}
        <div className="mb-4">
          <StatsCards stats={stats} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <ProgressTracker
            processed={progress.processed}
            total={progress.total || accounts.length}
            isRunning={botState === 'running'}
          />
        </div>

        {/* Main content: config sidebar + table/logs */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          {/* Left sidebar: config */}
          <div className="flex flex-col gap-4">
            <ConfigPanel
              config={config}
              onConfigChange={setConfig}
              onFileUpload={handleFileUpload}
              onStart={handleStart}
              onStop={handleStop}
              onClear={handleClear}
              state={botState}
              accounts={accounts}
              fileName={fileName}
            />
          </div>

          {/* Right content: table + logs */}
          <div className="flex flex-col gap-4 min-h-0">
            <AccountsTable accounts={accounts} />
            <div className="h-[400px] lg:h-[350px]">
              <LogPanel
                logs={logs}
                onClear={handleClearLogs}
                debugMode={config.debugMode}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-3 border-t border-ink-700/40 bg-ink-900/40">
        <p className="text-xs text-ink-400 text-center">
          MegaBall Bot Dashboard · Evolution Gaming · For educational/testing
          purposes only
        </p>
      </footer>
    </div>
  );
}

export default App;
