import { useRef } from 'react';
import {
  Settings,
  FileUp,
  Bug,
  EyeOff,
  Network,
  Play,
  Square,
  Download,
  Trash2,
} from 'lucide-react';
import type { BotConfig, BotState } from '@/types';
import { exportAccountsCsv } from '@/utils/csv';
import type { Account } from '@/types';

interface ConfigPanelProps {
  config: BotConfig;
  onConfigChange: (config: BotConfig) => void;
  onFileUpload: (content: string, filename: string) => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  state: BotState;
  accounts: Account[];
  fileName: string;
}

export function ConfigPanel({
  config,
  onConfigChange,
  onFileUpload,
  onStart,
  onStop,
  onClear,
  state,
  accounts,
  fileName,
}: ConfigPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isRunning = state === 'running' || state === 'stopping';

  const update = <K extends keyof BotConfig>(key: K, value: BotConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onFileUpload(reader.result as string, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div className="card-surface p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-ink-700/50">
        <Settings className="w-4 h-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-ink-100 uppercase tracking-wide">
          Configuration
        </h3>
      </div>

      {/* File upload */}
      <div>
        <label className="text-xs font-medium text-ink-400 mb-1.5 block">
          Token File (.txt)
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isRunning}
            className="flex-1 btn-ghost flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <FileUp className="w-4 h-4" />
            <span className="truncate">{fileName || 'Choose file...'}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">
          Format: phone=X password=X device_type=X device_id=X bearer_token=X xtag=X |domain.com
        </p>
      </div>

      {/* Numeric inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ink-400 mb-1.5 block">
            Valor da aposta (BRL)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-400">
              R$
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={config.betAmount}
              onChange={(e) => update('betAmount', parseFloat(e.target.value) || 0)}
              disabled={isRunning}
              className="input-dark w-full pl-10"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-400 mb-1.5 block">
            Rounds / Account
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={config.roundsPerAccount}
            onChange={(e) => update('roundsPerAccount', parseInt(e.target.value) || 1)}
            disabled={isRunning}
            className="input-dark w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-400 mb-1.5 block">
            Simultaneous Accounts
          </label>
          <input
            type="number"
            min={1}
            max={20}
            step={1}
            value={config.simultaneousAccounts}
            onChange={(e) => update('simultaneousAccounts', parseInt(e.target.value) || 1)}
            disabled={isRunning}
            className="input-dark w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-400 mb-1.5 block">
            Proxy URL
          </label>
          <input
            type="text"
            value={config.proxyUrl}
            onChange={(e) => update('proxyUrl', e.target.value)}
            disabled={isRunning || !config.proxyEnabled}
            placeholder="socks5://host:port"
            className="input-dark w-full"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2.5">
        <ToggleSwitch
          label="Debug Mode"
          icon={Bug}
          checked={config.debugMode}
          onChange={(v) => update('debugMode', v)}
          disabled={isRunning}
        />
        <ToggleSwitch
          label="Headless"
          icon={EyeOff}
          checked={config.headless}
          onChange={(v) => update('headless', v)}
          disabled={isRunning}
        />
        <ToggleSwitch
          label="Rotating Proxy"
          icon={Network}
          checked={config.proxyEnabled}
          onChange={(v) => update('proxyEnabled', v)}
          disabled={isRunning}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onStart}
          disabled={isRunning || accounts.length === 0}
          className="btn-primary flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Play className="w-4 h-4 shrink-0" fill="currentColor" />
          <span className="truncate">Iniciar Bot</span>
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          className="btn-danger flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Square className="w-4 h-4 shrink-0" fill="currentColor" />
          <span className="truncate">Parar</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => exportAccountsCsv(accounts)}
          disabled={accounts.length === 0}
          className="btn-ghost flex-1 min-w-0 flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Exportar CSV</span>
        </button>
        <button
          onClick={onClear}
          disabled={isRunning || accounts.length === 0}
          className="btn-ghost flex-1 min-w-0 flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Limpar</span>
        </button>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  icon: typeof Bug;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ label, icon: Icon, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 disabled:opacity-40 ${
        checked
          ? 'bg-brand-500/10 border-brand-500/40 text-brand-300'
          : 'bg-ink-900 border-ink-700 text-ink-400'
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 text-xs font-medium text-left">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="leading-tight">{label}</span>
      </span>
      <span
        className={`relative w-8 h-4 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-500' : 'bg-ink-600'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
