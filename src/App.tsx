/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Player,
  BoardState,
  evaluateGame,
  getAIMove,
  AIDifficulty,
} from './lib/minimax';
import { sound } from './lib/sound';
import {
  isSupabaseConfigured,
  getSupabase,
  recordMatch,
  updateLeaderboard,
} from './lib/supabaseClient';
import { Board } from './components/Board';
import { ScoreBoard } from './components/ScoreBoard';
import { ModeSelector, GameMode } from './components/ModeSelector';
import { IntegrationsBar } from './components/IntegrationsBar';
import { SupabaseModal } from './components/SupabaseModal';
import { GitHubModal } from './components/GitHubModal';
import { VercelModal } from './components/VercelModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { Gamepad2, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function App() {
  // Estado do Tabuleiro
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  // Placar
  const [scoreX, setScoreX] = useState(() => {
    return Number(localStorage.getItem('tictactoe_score_x') || 0);
  });
  const [scoreO, setScoreO] = useState(() => {
    return Number(localStorage.getItem('tictactoe_score_o') || 0);
  });
  const [ties, setTies] = useState(() => {
    return Number(localStorage.getItem('tictactoe_ties') || 0);
  });

  // Modo e Dificuldade
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('imbativel');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Nomes dos Jogadores
  const [playerXName, setPlayerXName] = useState('Jogador X');
  const [playerOName, setPlayerOName] = useState('Jogador O');

  // Sons
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  // Status de Integrações & Modais
  const [hasSupabase, setHasSupabase] = useState(isSupabaseConfigured());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);

  // Multijogador Online
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'X' | 'O' | null>(null);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);

  // Broadcast channel local (para 2 abas) ou canal do Supabase
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<unknown>(null);

  // Salvar placar no localStorage
  useEffect(() => {
    localStorage.setItem('tictactoe_score_x', String(scoreX));
    localStorage.setItem('tictactoe_score_o', String(scoreO));
    localStorage.setItem('tictactoe_ties', String(ties));
  }, [scoreX, scoreO, ties]);

  // Atualizar nomes de acordo com o modo
  useEffect(() => {
    if (gameMode === 'local') {
      setPlayerXName('Jogador X');
      setPlayerOName('Jogador O');
    } else if (gameMode === 'ai') {
      setPlayerXName('Você (X)');
      setPlayerOName(`Robô IA (${aiDifficulty.toUpperCase()})`);
    } else if (gameMode === 'online') {
      setPlayerXName(myRole === 'X' ? 'Você (X)' : 'Oponente (X)');
      setPlayerOName(myRole === 'O' ? 'Você (O)' : 'Oponente (O)');
    }
  }, [gameMode, aiDifficulty, myRole]);

  // Disparo de Confete ao Vencer
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#f43f5e', '#10b981', '#fbbf24', '#a855f7'],
      });
    } catch {
      // Ignore
    }
  }, []);

  // Finalização de Partida
  const handleGameOver = useCallback(
    async (winPlayer: Player | null, isDrawGame: boolean, currentMoves: number) => {
      if (winPlayer) {
        sound.playWin();
        triggerConfetti();
        if (winPlayer === 'X') {
          setScoreX((prev) => prev + 1);
        } else {
          setScoreO((prev) => prev + 1);
        }

        // Salvar no Supabase e no Placar de Líderes
        const winningName = winPlayer === 'X' ? playerXName : playerOName;
        const losingName = winPlayer === 'X' ? playerOName : playerXName;

        recordMatch({
          winner: winPlayer,
          mode: gameMode,
          moves_count: currentMoves,
          player_x: playerXName,
          player_o: playerOName,
        });

        updateLeaderboard(winningName, 'win');
        updateLeaderboard(losingName, 'loss');
      } else if (isDrawGame) {
        sound.playDraw();
        setTies((prev) => prev + 1);

        recordMatch({
          winner: 'Empate',
          mode: gameMode,
          moves_count: currentMoves,
          player_x: playerXName,
          player_o: playerOName,
        });

        updateLeaderboard(playerXName, 'draw');
        updateLeaderboard(playerOName, 'draw');
      }
    },
    [triggerConfetti, playerXName, playerOName, gameMode]
  );

  // Executar jogada em determinada célula
  const executeMove = useCallback(
    (index: number, playerToMove: Player, isRemote: boolean = false) => {
      setBoard((prev) => {
        if (prev[index] !== null) return prev;

        const newBoard = [...prev];
        newBoard[index] = playerToMove;
        sound.playMove(playerToMove);

        const newMovesCount = movesCount + 1;
        setMovesCount(newMovesCount);

        const evaluation = evaluateGame(newBoard);

        if (evaluation.winner) {
          setWinner(evaluation.winner);
          setWinningLine(evaluation.winningLine);
          handleGameOver(evaluation.winner, false, newMovesCount);
        } else if (evaluation.isDraw) {
          setIsDraw(true);
          handleGameOver(null, true, newMovesCount);
        } else {
          const nextPlayer: Player = playerToMove === 'X' ? 'O' : 'X';
          setCurrentPlayer(nextPlayer);
        }

        // Se estiver em modo online e não for movimento remoto, sincronizar
        if (gameMode === 'online' && !isRemote) {
          broadcastOnlineEvent({
            type: 'move',
            index,
            player: playerToMove,
          });
        }

        return newBoard;
      });
    },
    [movesCount, handleGameOver, gameMode]
  );

  // Resposta da IA no Modo 'ai'
  useEffect(() => {
    if (
      gameMode === 'ai' &&
      currentPlayer === 'O' &&
      !winner &&
      !isDraw &&
      !isAiThinking
    ) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...board], 'O', aiDifficulty);
        if (aiMove !== -1) {
          executeMove(aiMove, 'O');
        }
        setIsAiThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, isDraw, board, aiDifficulty, isAiThinking, executeMove]);

  // Clique em uma casa pelo jogador
  const handleCellClick = (index: number) => {
    if (board[index] !== null || winner || isDraw) return;

    if (gameMode === 'ai') {
      if (currentPlayer !== 'X' || isAiThinking) return;
      executeMove(index, 'X');
    } else if (gameMode === 'local') {
      executeMove(index, currentPlayer);
    } else if (gameMode === 'online') {
      if (myRole !== currentPlayer) return; // Não é sua vez
      executeMove(index, myRole);
    }
  };

  // Reiniciar Tabuleiro
  const handleResetBoard = (broadcast = true) => {
    sound.playClick();
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setMovesCount(0);
    setIsAiThinking(false);

    if (gameMode === 'online' && broadcast) {
      broadcastOnlineEvent({ type: 'reset' });
    }
  };

  // Zerar Placar
  const handleResetScores = () => {
    sound.playClick();
    setScoreX(0);
    setScoreO(0);
    setTies(0);
    handleResetBoard();
  };

  // Alternar Som
  const handleToggleSound = () => {
    const enabled = sound.toggle();
    setSoundEnabled(enabled);
  };

  // Mudar Modo de Jogo
  const handleSelectMode = (newMode: GameMode) => {
    sound.playClick();
    setGameMode(newMode);
    handleResetBoard(false);

    if (newMode === 'online') {
      setIsOnlineModalOpen(true);
    }
  };

  /* ---------------- Sincronização Online (Supabase Realtime & BroadcastChannel) ---------------- */
  const broadcastOnlineEvent = (payload: { type: string; [key: string]: unknown }) => {
    // 1. Local BroadcastChannel (para testes multiabas rápidos)
    if (localBroadcastRef.current) {
      try {
        localBroadcastRef.current.postMessage(payload);
      } catch {
        // Ignore
      }
    }

    // 2. Supabase Realtime Channel
    const supabase = getSupabase();
    if (supabase && roomCode && supabaseChannelRef.current) {
      try {
        const channel = supabaseChannelRef.current as {
          send: (args: { type: string; event: string; payload: unknown }) => void;
        };
        channel.send({
          type: 'broadcast',
          event: 'game-event',
          payload,
        });
      } catch (err) {
        console.warn('Erro ao transmitir evento via Supabase:', err);
      }
    }
  };

  const setupOnlineRoom = (code: string, role: 'X' | 'O') => {
    setRoomCode(code);
    setMyRole(role);
    handleResetBoard(false);

    // Configura canal local para abas no mesmo navegador
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (localBroadcastRef.current) localBroadcastRef.current.close();
      const bc = new BroadcastChannel(`tictactoe-room-${code}`);
      bc.onmessage = (event) => {
        handleIncomingEvent(event.data);
      };
      localBroadcastRef.current = bc;
    }

    // Configura canal Supabase Realtime
    const supabase = getSupabase();
    if (supabase) {
      try {
        const channel = supabase.channel(`tictactoe:${code}`, {
          config: { broadcast: { self: false } },
        });

        channel
          .on('broadcast', { event: 'game-event' }, ({ payload }) => {
            handleIncomingEvent(payload);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({
                type: 'broadcast',
                event: 'game-event',
                payload: { type: 'join', role },
              });
            }
          });

        supabaseChannelRef.current = channel;
      } catch (err) {
        console.error('Falha ao subscrever canal Supabase:', err);
      }
    }
  };

  const handleIncomingEvent = (data: { type: string; [key: string]: unknown }) => {
    if (!data) return;

    if (data.type === 'join') {
      setIsOpponentConnected(true);
      // Responder avisando que também está conectado
      broadcastOnlineEvent({ type: 'ack_join' });
    } else if (data.type === 'ack_join') {
      setIsOpponentConnected(true);
    } else if (data.type === 'move') {
      const idx = data.index as number;
      const player = data.player as Player;
      executeMove(idx, player, true);
    } else if (data.type === 'reset') {
      handleResetBoard(false);
    }
  };

  const handleCreateRoom = () => {
    const randomCode = 'SALA-' + Math.floor(100 + Math.random() * 900);
    setupOnlineRoom(randomCode, 'X');
  };

  const handleJoinRoom = (code: string) => {
    setupOnlineRoom(code, 'O');
    // Envia sinal de que entrou
    setTimeout(() => {
      broadcastOnlineEvent({ type: 'join', role: 'O' });
    }, 300);
  };

  const handleLeaveRoom = () => {
    if (localBroadcastRef.current) {
      localBroadcastRef.current.close();
      localBroadcastRef.current = null;
    }
    const supabase = getSupabase();
    if (supabase && supabaseChannelRef.current) {
      supabase.removeChannel(supabaseChannelRef.current as never);
      supabaseChannelRef.current = null;
    }
    setRoomCode(null);
    setMyRole(null);
    setIsOpponentConnected(false);
    setGameMode('local');
    setIsOnlineModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased p-3 sm:p-5">
      {/* Background Decorativo Suave */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Cabeçalho Superior com Logo e Status */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 to-rose-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Gamepad2 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-rose-400 bg-clip-text text-transparent">
                Jogo da Velha
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Integrado com Supabase, GitHub e Vercel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Som */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Badge de Integrações */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasSupabase ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">{hasSupabase ? 'Supabase Conectado' : 'Config'}</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Central Principal (Jogo da Velha em Uma Única Página) */}
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center items-center py-4 space-y-4">
        {/* Seletor de Modos */}
        <ModeSelector
          mode={gameMode}
          onSelectMode={handleSelectMode}
          aiDifficulty={aiDifficulty}
          onChangeDifficulty={setAiDifficulty}
          isOnlineConnected={isOpponentConnected}
        />

        {/* Informações da Sala Online Ativa */}
        {gameMode === 'online' && roomCode && (
          <div className="w-full max-w-[400px] px-3.5 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sala: <strong className="font-mono text-emerald-300">{roomCode}</strong></span>
              <span className="text-slate-400">({myRole === 'X' ? 'Você é X' : 'Você é O'})</span>
            </div>
            <button
              onClick={() => setIsOnlineModalOpen(true)}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Opções
            </button>
          </div>
        )}

        {/* Placar e Turno */}
        <ScoreBoard
          scoreX={scoreX}
          scoreO={scoreO}
          ties={ties}
          currentPlayer={currentPlayer}
          winner={winner}
          isDraw={isDraw}
          isAiTurn={isAiThinking}
          playerXName={playerXName}
          playerOName={playerOName}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onResetBoard={() => handleResetBoard(true)}
          onResetScores={handleResetScores}
        />

        {/* O Tabuleiro 3x3 */}
        <Board
          board={board}
          onCellClick={handleCellClick}
          winningLine={winningLine}
          disabled={Boolean(winner || isDraw || isAiThinking || (gameMode === 'online' && myRole !== currentPlayer))}
          currentPlayer={currentPlayer}
        />

        {/* Barra de Integrações Principais (Supabase, GitHub, Vercel) */}
        <div className="w-full pt-1">
          <IntegrationsBar
            isSupabaseConfigured={hasSupabase}
            onOpenSupabase={() => setIsSupabaseModalOpen(true)}
            onOpenGitHub={() => setIsGitHubModalOpen(true)}
            onOpenVercel={() => setIsVercelModalOpen(true)}
          />
        </div>
      </main>

      {/* Rodapé Elegante com Créditos e Links Rápidos */}
      <footer className="w-full max-w-xl mx-auto pt-3 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Jogo da Velha • Supabase + GitHub + Vercel</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Placar Global
          </button>
          <span>•</span>
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Repositório
          </button>
          <span>•</span>
          <button
            onClick={() => setIsVercelModalOpen(true)}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Deploy
          </button>
        </div>
      </footer>

      {/* Modais de Integração */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={() => setHasSupabase(isSupabaseConfigured())}
      />

      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      <VercelModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        roomCode={roomCode}
        myRole={myRole}
        isOpponentConnected={isOpponentConnected}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
        onOpenSupabaseConfig={() => {
          setIsOnlineModalOpen(false);
          setIsSupabaseModalOpen(true);
        }}
      />
    </div>
  );
}
