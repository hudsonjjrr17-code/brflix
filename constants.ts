import React from 'react';

// Configuration for APIs
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Chave padrão
export const DEFAULT_TMDB_KEY = '811c68545dd2799d8b6edfcc4591d4ae';

export interface StreamingProvider {
    name: string;
    id: string;
    getUrl: (tmdbId: number, imdbId: string | undefined, type: 'movie' | 'tv', season?: number, episode?: number) => string;
    policy: React.HTMLAttributeReferrerPolicy;
    tip?: string;
}

// Função de fallback para players que exigem IMDB ID
const getFallbackUrl = (tmdbId: number, type: 'movie' | 'tv', season: number = 1, episode: number = 1) => {
    const typePath = type === 'tv' ? `tv?id=${tmdbId}&s=${season}&e=${episode}` : `movie?id=${tmdbId}`;
    // O 2embed é um fallback confiável que usa TMDB ID
    return `https://www.2embed.to/embed/tmdb/${typePath}`;
};


// LISTA ATUALIZADA E EXPANDIDA DE PLAYERS
export const STREAMING_PROVIDERS: StreamingProvider[] = [
  // --- PLAYERS MANTIDOS PELA QUALIDADE EM PT-BR ---
  { 
    name: 'Opção 1 (Dublado)', 
    id: 'vocesabia',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            return `https://vocesabia.video/imdb/${imdbId}/${season}/${episode}`;
        }
        return `https://vocesabia.video/imdb/${imdbId}`;
    },
    policy: 'no-referrer', 
    tip: 'Fonte principal para conteúdo DUBLADO. Se falhar, usa a Opção 2.'
  },
  { 
    name: 'Opção 2 (Multi)', 
    id: '2embed',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (type === 'tv') {
            return `https://www.2embed.to/embed/tmdb/tv?id=${tmdbId}&s=${season}&e=${episode}`;
        }
        return `https://www.2embed.to/embed/tmdb/movie?id=${tmdbId}`;
    },
    policy: 'origin',
    tip: 'Player multi-servidor. Verifique as opções de áudio/legenda.'
  },
  { 
    name: 'Opção 3 (Auto PT-BR)', 
    id: 'embedder_pt',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (type === 'tv') {
            return `https://embedder.net/e/series?tmdb=${tmdbId}&s=${season}&e=${episode}&lang=pt`;
        }
        return `https://embedder.net/e/movie?tmdb=${tmdbId}&lang=pt`;
    },
    policy: 'no-referrer', 
    tip: 'Tenta carregar o áudio em português automaticamente.'
  },
  { 
    name: 'Opção 4 (Dual Áudio)', 
    id: 'vidlink',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (type === 'tv') {
            return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
        }
        return `https://vidlink.pro/movie/${tmdbId}`;
    },
    policy: 'origin', 
    tip: 'MANUAL: Clique na engrenagem (⚙️) > Audio > Portuguese.'
  },
  
  // --- NOVOS PLAYERS ADICIONADOS ---
  {
    name: 'VidHide',
    id: 'vidhide',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            return `https://vidhide.pro/embed/tv?imdb=${imdbId}&s=${season}&e=${episode}`;
        }
        return `https://vidhide.pro/embed/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Servidor alternativo. Pode não ter legendas embutidas.'
  },
  {
    name: 'UpStream',
    id: 'upstream',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            return `https://upstream.to/embed-tv/${imdbId}/${season}/${episode}`;
        }
        return `https://upstream.to/embed-movie/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Ótima opção com suporte claro para filmes e séries.'
  },
  {
    name: 'DoodStream',
    id: 'doodstream',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        // Doodstream não tem um padrão de URL confiável para séries com S/E
        return `https://dood.wf/e/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Player rápido. Pode não funcionar bem para séries.'
  },
  {
    name: 'StreamTape',
    id: 'streamtape',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        // Streamtape também não tem um padrão de URL confiável para séries com S/E
        return `https://streamtape.com/e/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Player popular. Pode não funcionar bem para séries.'
  },
  {
    name: 'FileMoon',
    id: 'filemoon',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        return `https://filemoon.sx/e/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Servidor popular, mas pode não funcionar para séries.'
  },
  {
    name: 'Voe',
    id: 'voe',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        return `https://watch.voe.sx/e/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Player simples. Pode não ter episódios separados para séries.'
  },
  {
    name: 'Netu.tv',
    id: 'netutv',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            // Garante que a temporada e o episódio tenham dois dígitos (S01, E01)
            const paddedSeason = String(season).padStart(2, '0');
            const paddedEpisode = String(episode).padStart(2, '0');
            return `https://waaw.to/f/${imdbId}-S${paddedSeason}-E${paddedEpisode}`;
        }
        return `https://waaw.to/f/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Player clássico. A URL pode variar.'
  },
];

export const TMDB_API_KEY_STORAGE_KEY = 'tmdb_api_key_v1';