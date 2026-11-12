export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

export interface GameStatus {
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
  isGameOver: boolean;
}

export function evaluateGame(board: BoardState): GameStatus {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: combo,
        isDraw: false,
        isGameOver: true,
      };
    }
  }

  const isFull = board.every((cell) => cell !== null);
  if (isFull) {
    return {
      winner: null,
      winningLine: null,
      isDraw: true,
      isGameOver: true,
    };
  }

  return {
    winner: null,
    winningLine: null,
    isDraw: false,
    isGameOver: false,
  };
}

export function getAvailableMoves(board: BoardState): number[] {
  const moves: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) moves.push(idx);
  });
  return moves;
}

/**
 * Minimax algorithm for unbeatable AI
 */
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): { score: number; move?: number } {
  const status = evaluateGame(board);

  if (status.winner === aiPlayer) return { score: 10 - depth };
  if (status.winner === humanPlayer) return { score: depth - 10 };
  if (status.isDraw) return { score: 0 };

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const result = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = humanPlayer;
      const result = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

export type AIDifficulty = 'facil' | 'medio' | 'imbativel';

export function getAIMove(
  board: BoardState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Fácil: movimento aleatório
  if (difficulty === 'facil') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. Médio: 60% chance de bloquear ou vencer se possível, senão aleatório
  if (difficulty === 'medio') {
    // Tenta vencer
    for (const move of availableMoves) {
      board[move] = aiPlayer;
      if (evaluateGame(board).winner === aiPlayer) {
        board[move] = null;
        return move;
      }
      board[move] = null;
    }

    // Tenta bloquear o oponente
    for (const move of availableMoves) {
      board[move] = humanPlayer;
      if (evaluateGame(board).winner === humanPlayer) {
        board[move] = null;
        return move;
      }
      board[move] = null;
    }

    // 50% de chance de fazer o melhor movimento minimax, 50% aleatório
    if (Math.random() > 0.5) {
      const best = minimax(board, 0, true, aiPlayer, humanPlayer);
      if (best.move !== undefined) return best.move;
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 3. Imbatível: Minimax puro
  const result = minimax(board, 0, true, aiPlayer, humanPlayer);
  return result.move !== undefined ? result.move : availableMoves[0];
}
