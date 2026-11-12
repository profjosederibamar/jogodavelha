import React from 'react';
import { AIDifficulty } from '../lib/minimax';
import { Users, Bot, Wifi } from 'lucide-react';

export type GameMode = 'local' | 'ai' | 'online';

interface ModeSelectorProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  aiDifficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  isOnlineConnected?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onSelectMode,
  aiDifficulty,
  onChangeDifficulty,
  isOnlineConnected,
}) => {
  return (
    <div className="w-full max-w-[400px] mx-auto space-y-2">
      {/* Botões dos 3 Modos */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => onSelectMode('local')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            mode === 'local'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users size={16} />
          <span>Local 2P</span>
        </button>

        <button
          onClick={() => onSelectMode('ai')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            mode === 'ai'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Bot size={16} />
          <span>Contra IA</span>
        </button>

        <button
          onClick={() => onSelectMode('online')}
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            mode === 'online'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Wifi size={16} />
          <span>Online</span>
          {isOnlineConnected && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Subseletor de Dificuldade da IA */}
      {mode === 'ai' && (
        <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-900/60 border border-purple-900/40 rounded-xl text-xs">
          <span className="text-slate-400 font-medium">Nível da IA:</span>
          <div className="flex gap-1">
            {(
              [
                { id: 'facil', label: 'Fácil' },
                { id: 'medio', label: 'Médio' },
                { id: 'imbativel', label: 'Imbatível' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeDifficulty(item.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  aiDifficulty === item.id
                    ? 'bg-purple-500 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
