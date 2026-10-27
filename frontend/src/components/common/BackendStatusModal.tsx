import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, X, Globe, Copy, Check } from 'lucide-react';
import { api, getBaseUrl, setCustomApiUrl, getCustomApiUrl } from '../../services/api';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
}) => {
  const currentUrl = getBaseUrl();
  const [inputUrl, setInputUrl] = useState<string>(getCustomApiUrl() || '');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    latencyMs?: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(getCustomApiUrl() || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (urlToTest?: string) => {
    const target = urlToTest !== undefined ? urlToTest : (inputUrl.trim() || currentUrl);
    setTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await api.checkHealth(target);
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        message: `Connected successfully! (${latency}ms)`,
        details: res,
        latencyMs: latency,
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. Please check the URL or wait if Render is booting.',
        latencyMs: latency,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!inputUrl.trim()) {
      setCustomApiUrl(null);
    } else {
      setCustomApiUrl(inputUrl.trim());
    }
    if (onConnectionSuccess) onConnectionSuccess();
    onClose();
    window.location.reload();
  };

  const handleReset = () => {
    setCustomApiUrl(null);
    setInputUrl('');
    if (onConnectionSuccess) onConnectionSuccess();
    onClose();
    window.location.reload();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Backend Connection & Deployment</h2>
              <p className="text-xs text-slate-400">Connect Vercel frontend to your Render Python backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Current Status */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active API Base URL:</span>
              <span className="font-mono text-yellow-400 font-semibold truncate max-w-[280px]">
                {currentUrl}
              </span>
            </div>
            {getCustomApiUrl() && (
              <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                <span>⚠️ Using browser localStorage override.</span>
                <button onClick={handleReset} className="underline hover:text-amber-300">
                  Reset to default
                </button>
              </div>
            )}
          </div>

          {/* Connect Live Form */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-300">
              Quick Connect to Render Backend URL:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://your-service-name.onrender.com"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleTestConnection()}
                disabled={testing}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste the public URL from your Render Dashboard. The <code>/api</code> suffix will be appended automatically if omitted.
            </p>
          </div>

          {/* Test Result Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.details && (
                    <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                      <div>Dataset: {testResult.details.dataset_name}</div>
                      <div>Total Records: {testResult.details.total_records?.toLocaleString()}</div>
                      <div>Olympic Editions: {testResult.details.editions_count}</div>
                    </div>
                  )}
                  {!testResult.success && (
                    <div className="text-[11px] text-slate-300/80 pt-1">
                      💡 <strong>Render Free Tier Note:</strong> If the service has been idle for 15+ minutes, it spins down. The first ping takes 30-50s to wake up the container. Please wait 20s and click Test again!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permanent Vercel Configuration Guide */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>Permanent Production Setup (Vercel):</span>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
              >
                Vercel Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
              <li>
                In your Vercel Project, go to <strong className="text-slate-200">Settings &gt; Environment Variables</strong>.
              </li>
              <li>
                Add variable:
                <div className="mt-1 flex items-center gap-2 font-mono bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-200">
                  <span className="text-yellow-400">VITE_API_URL</span>
                  <span className="text-slate-500">=</span>
                  <span className="truncate">{inputUrl || 'https://<your-render-app>.onrender.com/api'}</span>
                  <button
                    onClick={() => copyToClipboard('VITE_API_URL')}
                    className="ml-auto text-slate-400 hover:text-white"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
              <li>
                Go to <strong className="text-slate-200">Deployments</strong>, click the 3 dots on the latest deployment, and choose <strong className="text-slate-200">Redeploy</strong>.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Clear override
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-lg shadow-sm transition-colors"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
