import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Trophy,
  History,
  Code2,
  ExternalLink,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  fetchLeaderboard,
  fetchMatches,
  SUPABASE_SQL_SCHEMA,
  LeaderboardEntry,
  MatchRecord,
} from '../lib/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [tab, setTab] = useState<'config' | 'leaderboard' | 'history' | 'sql'>('config');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [lb, m] = await Promise.all([fetchLeaderboard(), fetchMatches()]);
      setLeaderboard(lb);
      setMatches(m);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseCredentials(url, anonKey);
    onConfigChanged();
    handleTest();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        loadData();
      }
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Integração Supabase</h3>
              <p className="text-xs text-slate-400">Banco de Dados PostgreSQL & Realtime para o Jogo da Velha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20 gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('config')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'config'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Conexão & Chaves
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'leaderboard'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={14} />
            Placar Global
          </button>
          <button
            onClick={() => setTab('history')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'history'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={14} />
            Histórico
          </button>
          <button
            onClick={() => setTab('sql')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'sql'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            Schema SQL
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs sm:text-sm text-slate-300">
                <p>
                  Conecte seu projeto do <strong>Supabase</strong> para sincronizar placares na nuvem, salvar o histórico de partidas e habilitar salas multijogador em tempo real.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-emerald-400 hover:underline font-medium"
                >
                  Abrir Dashboard do Supabase <ExternalLink size={12} />
                </a>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500">
                    Definível também via variável <code className="text-slate-400">VITE_SUPABASE_URL</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500">
                    Definível via <code className="text-slate-400">VITE_SUPABASE_ANON_KEY</code> no Vercel/.env
                  </span>
                </div>
              </div>

              {/* Status de Teste */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>{testResult.message}</div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 text-sm"
                >
                  Salvar & Conectar
                </button>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                  <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'leaderboard' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Classificação Geral (3 pts por vitória, 1 por empate)</span>
                <button
                  onClick={loadData}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingData ? 'animate-spin' : ''} /> Atualizar
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-800/60 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Jogador</th>
                      <th className="py-2.5 px-3 text-center">V</th>
                      <th className="py-2.5 px-3 text-center">D</th>
                      <th className="py-2.5 px-3 text-center">E</th>
                      <th className="py-2.5 px-3 text-right">Pontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {leaderboard.map((item, idx) => (
                      <tr
                        key={item.player_name + idx}
                        className={`hover:bg-slate-900/60 transition-colors ${
                          idx === 0 ? 'bg-amber-500/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-medium">
                          {item.player_name}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold">{item.wins}</td>
                        <td className="py-2.5 px-3 text-center text-rose-400">{item.losses}</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">{item.draws}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-white">
                          {item.points}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Nenhum registro ainda. Jogue uma partida para inaugurar o placar!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Últimas 20 partidas registradas</span>
                <button
                  onClick={loadData}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingData ? 'animate-spin' : ''} /> Atualizar
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {matches.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{m.player_x || 'Jogador X'}</span>
                        <span className="text-slate-500 text-[10px]">vs</span>
                        <span>{m.player_o || 'Jogador O'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Modo: {m.mode} • {m.moves_count} jogadas •{' '}
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString() : 'Recente'}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-md font-bold text-[11px] ${
                          m.winner === 'X'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : m.winner === 'O'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {m.winner === 'Empate' ? 'Empate' : `Venceu: ${m.winner}`}
                      </span>
                    </div>
                  </div>
                ))}

                {matches.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Nenhuma partida registrada até o momento.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Script pronto com tabelas, índices e políticas de segurança RLS:
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[250px] leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <p className="text-[11px] text-slate-400">
                Como usar: Acesse o Supabase Dashboard &gt; <strong>SQL Editor</strong> &gt; Clique em <strong>New Query</strong> &gt; Cole o script acima &gt; Clique em <strong>Run</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
