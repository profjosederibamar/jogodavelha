import React from 'react';
import { Database, GitBranch, Triangle, ShieldCheck, Settings } from 'lucide-react';

interface IntegrationsBarProps {
  isSupabaseConfigured: boolean;
  onOpenSupabase: () => void;
  onOpenGitHub: () => void;
  onOpenVercel: () => void;
}

export const IntegrationsBar: React.FC<IntegrationsBarProps> = ({
  isSupabaseConfigured,
  onOpenSupabase,
  onOpenGitHub,
  onOpenVercel,
}) => {
  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            Integrações Cloud Ativas
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
            Pronto para Produção
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Supabase */}
          <button
            onClick={onOpenSupabase}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer group ${
              isSupabaseConfigured
                ? 'bg-emerald-950/30 border-emerald-800/60 hover:border-emerald-500'
                : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-1.5 rounded-lg ${
                  isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                }`}
              >
                <Database size={14} />
              </div>
              <div className="truncate">
                <div className="font-semibold text-slate-200 text-xs truncate">Supabase</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="truncate">{isSupabaseConfigured ? 'Online' : 'Configurar'}</span>
                </div>
              </div>
            </div>
            <Settings size={12} className="text-slate-500 group-hover:text-slate-300 shrink-0" />
          </button>

          {/* GitHub */}
          <button
            onClick={onOpenGitHub}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-700 text-slate-200">
                <GitBranch size={14} />
              </div>
              <div className="truncate">
                <div className="font-semibold text-slate-200 text-xs truncate">GitHub</div>
                <div className="text-[10px] text-slate-400 truncate">Código & Sync</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono">git</span>
          </button>

          {/* Vercel */}
          <button
            onClick={onOpenVercel}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-black text-white border border-slate-700">
                <Triangle size={14} className="fill-white" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-slate-200 text-xs truncate">Vercel</div>
                <div className="text-[10px] text-emerald-400 truncate">1-Click Deploy</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold">▲</span>
          </button>
        </div>
      </div>
    </div>
  );
};
