import React from 'react';
import { Player, BoardState } from '../lib/minimax';

interface BoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
  currentPlayer: Player;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  winningLine,
  disabled,
  currentPlayer,
}) => {
  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] aspect-square p-3 sm:p-4 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* Grade 3x3 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 w-full h-full">
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index);
          const isAvailable = cell === null && !disabled;

          return (
            <button
              key={index}
              onClick={() => isAvailable && onCellClick(index)}
              disabled={!isAvailable}
              aria-label={`Casa ${index + 1}, ${cell ? `marcada com ${cell}` : 'vazia'}`}
              className={`group relative flex items-center justify-center rounded-2xl transition-all duration-200 select-none ${
                cell === null
                  ? 'bg-slate-800/60 hover:bg-slate-800/90 active:scale-95 cursor-pointer border border-slate-700/50 hover:border-cyan-500/50'
                  : 'bg-slate-800/80 cursor-default border border-slate-700/70'
              } ${
                isWinningCell
                  ? cell === 'X'
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse'
                    : 'bg-rose-950/80 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
                  : ''
              } ${disabled && cell === null ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Efeito Hover Fantasma com símbolo da vez */}
              {cell === null && !disabled && (
                <span
                  className={`opacity-0 group-hover:opacity-20 text-4xl sm:text-5xl font-black transition-opacity duration-150 ${
                    currentPlayer === 'X' ? 'text-cyan-400' : 'text-rose-400'
                  }`}
                >
                  {currentPlayer}
                </span>
              )}

              {/* Símbolo X */}
              {cell === 'X' && (
                <div className="relative flex items-center justify-center">
                  <span
                    className={`text-5xl sm:text-6xl font-black tracking-tighter text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)] transition-transform duration-200 scale-100 ${
                      isWinningCell ? 'scale-110' : ''
                    }`}
                  >
                    ✕
                  </span>
                </div>
              )}

              {/* Símbolo O */}
              {cell === 'O' && (
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-6 sm:border-8 border-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.7)] transition-transform duration-200 ${
                      isWinningCell ? 'scale-110 border-rose-300' : ''
                    }`}
                  />
                </div>
              )}

              {/* Índice discreto em cada canto para acessibilidade rápida */}
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-600 select-none opacity-40">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
