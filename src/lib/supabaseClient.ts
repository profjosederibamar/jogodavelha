import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface MatchRecord {
  id?: string;
  winner: string; // 'X' | 'O' | 'Empate'
  mode: string;
  moves_count: number;
  player_x?: string;
  player_o?: string;
  created_at?: string;
}

export interface LeaderboardEntry {
  id?: string;
  player_name: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  updated_at?: string;
}

const STORAGE_KEY_URL = 'tictactoe_supabase_url';
const STORAGE_KEY_KEY = 'tictactoe_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentConfig = {
  url: '',
  anonKey: '',
};

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && currentConfig.url === url && currentConfig.anonKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentConfig = { url, anonKey };
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  cachedClient = null;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'Configure uma URL válida (https://*.supabase.co) e uma Chave Anon.',
    };
  }

  try {
    // Tenta uma consulta simples ou ping de autenticação
    const { error } = await supabase.from('leaderboard_tictactoe').select('id').limit(1);
    
    // Se a tabela ainda não existir no Supabase, a conexão ainda é válida (erro 42P01: relation does not exist)
    if (error && error.code !== '42P01') {
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }

    return {
      success: true,
      message: error?.code === '42P01' 
        ? 'Conectado com sucesso ao Supabase! Execute o script SQL para criar as tabelas.'
        : 'Conectado com sucesso ao Supabase! Tabelas encontradas e sincronizadas.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Falha na requisição: ${msg}` };
  }
}

// Salvar partida no Supabase
export async function recordMatch(match: MatchRecord): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    // Salvar localmente como fallback
    saveMatchLocally(match);
    return false;
  }

  try {
    const { error } = await supabase.from('matches_tictactoe').insert([
      {
        winner: match.winner,
        mode: match.mode,
        moves_count: match.moves_count,
        player_x: match.player_x || 'Jogador X',
        player_o: match.player_o || 'Jogador O',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Fallback para local ao salvar partida:', error.message);
      saveMatchLocally(match);
      return false;
    }

    saveMatchLocally(match);
    return true;
  } catch {
    saveMatchLocally(match);
    return false;
  }
}

function saveMatchLocally(match: MatchRecord) {
  try {
    const existing = JSON.parse(localStorage.getItem('tictactoe_local_history') || '[]');
    const updated = [
      {
        ...match,
        id: 'local-' + Date.now(),
        created_at: new Date().toISOString(),
      },
      ...existing,
    ].slice(0, 30);
    localStorage.setItem('tictactoe_local_history', JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function getLocalMatches(): MatchRecord[] {
  try {
    return JSON.parse(localStorage.getItem('tictactoe_local_history') || '[]');
  } catch {
    return [];
  }
}

export async function fetchMatches(): Promise<MatchRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return getLocalMatches();

  try {
    const { data, error } = await supabase
      .from('matches_tictactoe')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return getLocalMatches();
    return data;
  } catch {
    return getLocalMatches();
  }
}

// Placar de Líderes
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return getLocalLeaderboard();

  try {
    const { data, error } = await supabase
      .from('leaderboard_tictactoe')
      .select('*')
      .order('points', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) return getLocalLeaderboard();
    return data;
  } catch {
    return getLocalLeaderboard();
  }
}

export async function updateLeaderboard(
  playerName: string,
  result: 'win' | 'loss' | 'draw'
): Promise<void> {
  const supabase = getSupabase();
  
  // Atualiza local primeiro
  updateLocalLeaderboard(playerName, result);

  if (!supabase) return;

  try {
    // Verifica se já existe
    const { data, error } = await supabase
      .from('leaderboard_tictactoe')
      .select('*')
      .eq('player_name', playerName)
      .single();

    if (error && error.code !== 'PGRST116') {
      return;
    }

    if (data) {
      const wins = data.wins + (result === 'win' ? 1 : 0);
      const losses = data.losses + (result === 'loss' ? 1 : 0);
      const draws = data.draws + (result === 'draw' ? 1 : 0);
      const points = wins * 3 + draws * 1;

      await supabase
        .from('leaderboard_tictactoe')
        .update({ wins, losses, draws, points, updated_at: new Date().toISOString() })
        .eq('id', data.id);
    } else {
      const wins = result === 'win' ? 1 : 0;
      const losses = result === 'loss' ? 1 : 0;
      const draws = result === 'draw' ? 1 : 0;
      const points = wins * 3 + draws * 1;

      await supabase.from('leaderboard_tictactoe').insert([
        {
          player_name: playerName,
          wins,
          losses,
          draws,
          points,
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  } catch {
    // Ignore
  }
}

function updateLocalLeaderboard(playerName: string, result: 'win' | 'loss' | 'draw') {
  try {
    const list: LeaderboardEntry[] = getLocalLeaderboard();
    const existing = list.find((e) => e.player_name.toLowerCase() === playerName.toLowerCase());

    if (existing) {
      if (result === 'win') existing.wins += 1;
      if (result === 'loss') existing.losses += 1;
      if (result === 'draw') existing.draws += 1;
      existing.points = existing.wins * 3 + existing.draws * 1;
      existing.updated_at = new Date().toISOString();
    } else {
      list.push({
        id: 'local-' + Date.now(),
        player_name: playerName,
        wins: result === 'win' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0,
        draws: result === 'draw' ? 1 : 0,
        points: (result === 'win' ? 1 : 0) * 3 + (result === 'draw' ? 1 : 0),
        updated_at: new Date().toISOString(),
      });
    }

    list.sort((a, b) => b.points - a.points);
    localStorage.setItem('tictactoe_local_leaderboard', JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem('tictactoe_local_leaderboard');
    if (data) return JSON.parse(data);
  } catch {
    // Ignore
  }
  // Dados iniciais de demonstração
  return [
    { player_name: 'Mestre da Velha', wins: 15, losses: 2, draws: 3, points: 48 },
    { player_name: 'Dev Supabase', wins: 11, losses: 4, draws: 2, points: 35 },
    { player_name: 'Vercel Ninja', wins: 8, losses: 3, draws: 4, points: 28 },
    { player_name: 'GitHub Octocat', wins: 7, losses: 5, draws: 2, points: 23 },
  ];
}

/**
 * Script SQL para criar as tabelas no Supabase
 */
export const SUPABASE_SQL_SCHEMA = `-- Copie e cole no SQL Editor do Supabase (supabase.com/dashboard)
-- Criação da tabela de partidas
CREATE TABLE IF NOT EXISTS matches_tictactoe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner TEXT NOT NULL,
  mode TEXT NOT NULL,
  moves_count INTEGER NOT NULL,
  player_x TEXT DEFAULT 'Jogador X',
  player_o TEXT DEFAULT 'Jogador O',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criação da tabela de placar de líderes
CREATE TABLE IF NOT EXISTS leaderboard_tictactoe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT UNIQUE NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Segurança a nível de linha)
ALTER TABLE matches_tictactoe ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_tictactoe ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para permitir leitura e escrita anônima no jogo
CREATE POLICY "Permitir leitura pública das partidas" ON matches_tictactoe FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de partidas" ON matches_tictactoe FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura pública do placar" ON leaderboard_tictactoe FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública no placar" ON leaderboard_tictactoe FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública no placar" ON leaderboard_tictactoe FOR UPDATE USING (true);

-- Habilitar Realtime para as tabelas (opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE matches_tictactoe;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard_tictactoe;
`;
