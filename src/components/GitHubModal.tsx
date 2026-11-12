import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Github,
  Copy,
  Check,
  ExternalLink,
  Download,
  FolderGit2,
  Terminal,
} from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY_GITHUB = 'tictactoe_github_repo';

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const envRepo = (import.meta.env.VITE_GITHUB_REPO as string) || '';
  const [repoUrl, setRepoUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_GITHUB) || envRepo || 'https://github.com/seu-usuario/jogo-da-velha';
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveRepo = () => {
    localStorage.setItem(STORAGE_KEY_GITHUB, repoUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const gitCommands = [
    '# 1. Inicialize o repositório Git local',
    'git init',
    '# 2. Adicione todos os arquivos',
    'git add .',
    '# 3. Crie o primeiro commit',
    'git commit -m "feat: Jogo da Velha com integração Supabase e Vercel"',
    '# 4. Defina a branch principal como main',
    'git branch -M main',
    `# 5. Adicione seu repositório remoto\ngit remote add origin ${repoUrl || 'https://github.com/seu-usuario/jogo-da-velha.git'}`,
    '# 6. Envie o código para o GitHub',
    'git push -u origin main',
  ].join('\n');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadProjectSnapshot = () => {
    const data = {
      project: 'Jogo da Velha Pro',
      integrations: ['Supabase', 'GitHub', 'Vercel'],
      exportedAt: new Date().toISOString(),
      localStorageData: {
        leaderboard: localStorage.getItem('tictactoe_local_leaderboard'),
        history: localStorage.getItem('tictactoe_local_history'),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jogo-da-velha-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white border border-slate-700">
              <Github size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Integração com GitHub</h3>
              <p className="text-xs text-slate-400">Controle de Versão, Repositório e Sincronização de Código</p>
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
          {/* Repositório Vinculado */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              URL do Repositório no GitHub
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/seu-usuario/jogo-da-velha"
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleSaveRepo}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-xs cursor-pointer"
              >
                {savedSuccess ? 'Salvo!' : 'Salvar'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={repoUrl.startsWith('http') ? repoUrl : `https://${repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Abrir repositório no GitHub <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                + Criar novo repo no GitHub <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Guia de Comandos Git */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400" /> Comandos para enviar ao GitHub:
              </span>
              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 1 ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedIndex === 1 ? 'Copiado!' : 'Copiar Tudo'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Estrutura do Projeto para GitHub */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <FolderGit2 size={16} className="text-purple-400" />
              Arquivos prontos para o repositório:
            </div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside font-mono text-[11px]">
              <li><strong className="text-slate-300">vercel.json</strong> (Configuração de deploy instantâneo na Vercel)</li>
              <li><strong className="text-slate-300">src/lib/supabaseClient.ts</strong> (Conexão Supabase + SQL)</li>
              <li><strong className="text-slate-300">.env.example</strong> (Template de chaves de API)</li>
              <li><strong className="text-slate-300">package.json</strong> & <strong className="text-slate-300">vite.config.ts</strong></li>
            </ul>
          </div>

          {/* Ação de Backup */}
          <div className="pt-1">
            <button
              onClick={downloadProjectSnapshot}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download size={14} />
              <span>Exportar Dados e Configurações (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
