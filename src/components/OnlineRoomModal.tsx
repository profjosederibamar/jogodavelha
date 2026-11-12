import React, { useState } from 'react';
import { X, Wifi, Users, Copy, Check, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string | null;
  myRole: 'X' | 'O' | null;
  isOpponentConnected: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onOpenSupabaseConfig: () => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  myRole,
  isOpponentConnected,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onOpenSupabaseConfig,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 3) {
      onJoinRoom(inputCode.trim().toUpperCase());
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wifi size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sala Online em Tempo Real</h3>
              <p className="text-xs text-slate-400">Via Supabase Realtime Channels</p>
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
        <div className="p-6 space-y-4">
          {!isConfigured && (
            <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300">
              <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>
                  O Supabase ainda não está com chaves salvas. O jogo usará sincronização local entre abas (BroadcastChannel) ou você pode configurar suas credenciais do Supabase agora.
                </p>
                <button
                  onClick={onOpenSupabaseConfig}
                  className="text-amber-200 underline font-semibold hover:text-white cursor-pointer"
                >
                  Configurar Chaves do Supabase
                </button>
              </div>
            </div>
          )}

          {roomCode ? (
            /* Sala Já Ativa */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Código da Sua Sala
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-black text-emerald-400 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    title="Copiar Código"
                  >
                    {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Compartilhe este código com seu amigo para ele entrar na mesma partida!
                </p>
              </div>

              {/* Status do Oponente */}
              <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOpponentConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                    }`}
                  />
                  <span>
                    {isOpponentConnected
                      ? 'Oponente conectado e pronto!'
                      : 'Aguardando oponente entrar...'}
                  </span>
                </div>
                <span className="font-bold text-slate-300">
                  Você joga como: <strong className={myRole === 'X' ? 'text-cyan-400' : 'text-rose-400'}>{myRole}</strong>
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Ir para o Tabuleiro
                </button>
                <button
                  onClick={onLeaveRoom}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-xl text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  Sair da Sala
                </button>
              </div>
            </div>
          ) : (
            /* Sem Sala: Criar ou Entrar */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles size={16} className="text-emerald-400" />
                  <span>Criar Nova Sala</span>
                </div>
                <p className="text-xs text-slate-400">
                  Crie uma sala instantânea e jogue como o <strong>Jogador X</strong>.
                </p>
                <button
                  onClick={onCreateRoom}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Gerar Sala Online
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  ou
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Entrar em Sala Existente */}
              <form onSubmit={handleJoin} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Entrar com Código de Amigo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Ex: VELHA-123"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={inputCode.trim().length < 3}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Entrar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ao entrar você jogará como <strong>Jogador O</strong>.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
