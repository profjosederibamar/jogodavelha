import React from 'react';
import { Player } from '../lib/minimax';
import { Volume2, VolumeX, RotateCcw, Trash2 } from 'lucide-react';

interface ScoreBoardProps {
  scoreX: number;
  scoreO: number;
  ties: number;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  isAiTurn: boolean;
  playerXName: string;
  playerOName: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetBoard: () => void;
  onResetScores: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  scoreX,
  scoreO,
  ties,
  currentPlayer,
  winner,
  isDraw,
  isAiTurn,
  playerXName,
  playerOName,
  soundEnabled,
  onToggleSound,
  onResetBoard,
  onResetScores,
}) => {
  return (
    <div className="w-full max-w-[400px] mx-auto space-y-3">
      {/* Placar em 3 Colunas */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {/* Jogador X */}
        <div
          className={`p-3 rounded-2xl border transition-all duration-300 ${
            !winner && !isDraw && currentPlayer === 'X'
              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-semibold text-xs sm:text-sm truncate">
            <span className="font-black text-sm">✕</span>
            <span className="truncate">{playerXName}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">
            {scoreX}
          </div>
        </div>

        {/* Empates */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-slate-400 font-semibold text-xs sm:text-sm">
            Empates
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 mt-1">
            {ties}
          </div>
        </div>

        {/* Jogador O */}
        <div
          className={`p-3 rounded-2xl border transition-all duration-300 ${
            !winner && !isDraw && currentPlayer === 'O'
              ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-rose-400 font-semibold text-xs sm:text-sm truncate">
            <span className="font-black text-sm">○</span>
            <span className="truncate">{playerOName}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">
            {scoreO}
          </div>
        </div>
      </div>

      {/* Banner de Status de Turno / Fim de Jogo */}
      <div
        className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-sm sm:text-base font-medium transition-all duration-300 ${
          winner === 'X'
            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            : winner === 'O'
            ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            : isDraw
            ? 'bg-amber-950/50 border-amber-500 text-amber-300'
            : isAiTurn
            ? 'bg-purple-950/50 border-purple-500/60 text-purple-300 animate-pulse'
            : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {winner ? (
            <span>
              🏆 Vitória de{' '}
              <strong className={winner === 'X' ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                {winner === 'X' ? playerXName : playerOName}
              </strong>!
            </span>
          ) : isDraw ? (
            <span>🤝 Deu Velha! Jogo empatado.</span>
          ) : isAiTurn ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              Robô IA está pensando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Vez de{' '}
              <span
                className={`font-black px-1.5 py-0.5 rounded text-xs ${
                  currentPlayer === 'X'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {currentPlayer}
              </span>{' '}
              ({currentPlayer === 'X' ? playerXName : playerOName})
            </span>
          )}
        </div>

        {/* Botão de Som Rápido */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Ações de Controle */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={onResetBoard}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <RotateCcw size={15} />
          <span>Nova Partida</span>
        </button>

        <button
          onClick={onResetScores}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 text-slate-400 text-xs sm:text-sm font-medium border border-slate-800 transition-all cursor-pointer"
          title="Zerar pontuação do placar"
        >
          <Trash2 size={15} />
          <span>Zerar Placar</span>
        </button>
      </div>
    </div>
  );
};
