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

// Função de fallback atualizada para usar um player mais confiável (VidSrc)
const getFallbackUrl = (tmdbId: number, type: 'movie' | 'tv', season: number = 1, episode: number = 1) => {
    if (type === 'tv') {
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidsrc.to/embed/movie/${tmdbId}`;
};

// LISTA DE PLAYERS OTIMIZADA E CONFIÁVEL
export const STREAMING_PROVIDERS: StreamingProvider[] = [
  { 
    name: 'Opção 1 (PT-BR)', 
    id: 'supertv',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (type === 'tv') {
            return `https://supertv.store/player/serie.php?tmdb=${tmdbId}&temp=${season}&ep=${episode}`;
        }
        return `https://supertv.store/player/filme.php?tmdb=${tmdbId}`;
    },
    policy: 'no-referrer', 
    tip: 'Fonte recomendada para conteúdo DUBLADO e LEGENDADO em português.'
  },
  { 
    name: 'Opção 2 (Multi)', 
    id: 'vidsrc',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (type === 'tv') {
            return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
        }
        return `https://vidsrc.to/embed/movie/${tmdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Player multi-servidor. Use o botão "Fontes" ou "Sources" para trocar de servidor se um falhar.'
  },
  { 
    name: 'Opção 3 (Dublado)', 
    id: 'vocesabia',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            return `https://vocesabia.video/imdb/${imdbId}/${season}/${episode}`;
        }
        return `https://vocesabia.video/imdb/${imdbId}`;
    },
    policy: 'no-referrer', 
    tip: 'Ótima fonte para conteúdo DUBLADO. Requer ID externo (IMDB).'
  },
  {
    name: 'Opção 4 (Alternativa)',
    id: 'upstream',
    getUrl: (tmdbId, imdbId, type, season = 1, episode = 1) => {
        if (!imdbId) return getFallbackUrl(tmdbId, type, season, episode);
        if (type === 'tv') {
            return `https://upstream.to/embed-tv/${imdbId}/${season}/${episode}`;
        }
        return `https://upstream.to/embed-movie/${imdbId}`;
    },
    policy: 'no-referrer',
    tip: 'Servidor alternativo confiável. Requer ID externo (IMDB).'
  },
];


export const TMDB_API_KEY_STORAGE_KEY = 'tmdb_api_key_v1';