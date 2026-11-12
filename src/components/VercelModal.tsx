import React, { useState } from 'react';
import {
  X,
  Triangle,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  FileCode,
  Key,
} from 'lucide-react';

interface VercelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelModal: React.FC<VercelModalProps> = ({ isOpen, onClose }) => {
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const vercelJsonContent = JSON.stringify(
    {
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      framework: 'vite',
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html',
        },
      ],
    },
    null,
    2
  );

  const envVariables = [
    'VITE_SUPABASE_URL=https://seu-projeto.supabase.co',
    'VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica',
  ].join('\n');

  if (!isOpen) return null;

  const handleCopyVercelJson = () => {
    navigator.clipboard.writeText(vercelJsonContent);
    setCopiedVercelJson(true);
    setTimeout(() => setCopiedVercelJson(false), 2000);
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envVariables);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const storedRepo = localStorage.getItem('tictactoe_github_repo') || '';
  const deployUrl = storedRepo.startsWith('http')
    ? `https://vercel.com/new/clone?repository-url=${encodeURIComponent(storedRepo)}`
    : 'https://vercel.com/new';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white border border-slate-700">
              <Triangle size={20} className="fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Deploy na Vercel</h3>
              <p className="text-xs text-slate-400">Hospedagem Frontend Global, CDN & Edge Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status e Botão 1-Click Deploy */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Projeto 100% Compatível com Vercel</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                Vite + SPA Routing
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Clique no botão abaixo para iniciar o deploy instantâneo na Vercel a partir do seu repositório GitHub.
            </p>

            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg hover:shadow-white/10 cursor-pointer"
            >
              <Triangle size={16} className="fill-slate-950" />
              <span>Fazer Deploy na Vercel</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Opção CLI */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal size={14} className="text-cyan-400" /> Ou faça deploy pelo Terminal (Vercel CLI):
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {`# Instale a CLI da Vercel globalmente
npm i -g vercel

# Faça login e publique com um comando
vercel`}
            </pre>
          </div>

          {/* Variáveis de Ambiente no Vercel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key size={14} className="text-amber-400" /> Variáveis de Ambiente para a Vercel:
              </div>
              <button
                onClick={handleCopyEnv}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedEnv ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedEnv ? 'Copiado!' : 'Copiar Variáveis'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto">
              {envVariables}
            </pre>
            <p className="text-[11px] text-slate-500">
              No painel do projeto na Vercel, acesse <strong>Settings &gt; Environment Variables</strong> e adicione essas chaves.
            </p>
          </div>

          {/* vercel.json preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode size={14} className="text-purple-400" /> Arquivo vercel.json (Já incluído no projeto):
              </div>
              <button
                onClick={handleCopyVercelJson}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedVercelJson ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedVercelJson ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto max-h-[140px]">
              {vercelJsonContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
