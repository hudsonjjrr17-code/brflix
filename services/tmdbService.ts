import { TMDB_BASE_URL } from '../constants';
import { Movie, MovieDetails, Cast, Episode } from '../types';

// Removemos o cabeçalho Authorization para evitar Preflight CORS complexo.
// Usaremos apenas a Query Param api_key que é mais aceita para clientes front-end simples.

const fetchWithKey = async (endpoint: string, apiKey: string, params: Record<string, string> = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('language', 'pt-BR');
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
            // Não enviamos Authorization header para evitar OPTIONS request (CORS)
        }
    });
    
    if (!response.ok) {
        console.warn(`TMDB Warning: ${response.status} on ${endpoint}`);
        return null; 
    }
    return response.json();
  } catch (error) {
    console.error(`Network Error on ${endpoint}:`, error);
    return null;
  }
};

export const getTrendingMovies = async (apiKey: string): Promise<Movie[]> => {
    const data = await fetchWithKey('/trending/movie/week', apiKey);
    return data?.results?.map((m: any) => ({...m, media_type: 'movie'})) || [];
};

export const getTrendingTV = async (apiKey: string): Promise<Movie[]> => {
    const data = await fetchWithKey('/trending/tv/week', apiKey);
    return data?.results?.map((m: any) => ({...m, media_type: 'tv'})) || [];
};

export const getNowPlaying = async (apiKey: string): Promise<Movie[]> => {
    const data = await fetchWithKey('/movie/now_playing', apiKey);
    return data?.results?.map((m: any) => ({...m, media_type: 'movie'})) || [];
};

export const getOnTheAir = async (apiKey: string): Promise<Movie[]> => {
    const data = await fetchWithKey('/tv/on_the_air', apiKey);
    return data?.results?.map((m: any) => ({...m, media_type: 'tv'})) || [];
};

export const getMoviesByGenre = async (apiKey: string, genreId: string, type: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
    try {
        const endpoint = `/discover/${type}`;
        const data = await fetchWithKey(endpoint, apiKey, { 
          with_genres: genreId,
          sort_by: 'popularity.desc'
        });
        return data?.results?.map((m: any) => ({...m, media_type: type})) || [];
    } catch (e) {
        console.error(`Error fetching genre ${genreId}`, e);
        return []; // Retorna array vazio para não quebrar a UI
    }
};

export const searchMovies = async (apiKey: string, query: string): Promise<Movie[]> => {
  if (!query) return [];
  const data = await fetchWithKey('/search/multi', apiKey, { query });
  return data?.results
      ?.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') || [];
};

export const getMovieDetails = async (apiKey: string, id: number, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails | null> => {
    const data = await fetchWithKey(`/${type}/${id}`, apiKey, { append_to_response: 'external_ids' });
    
    if (!data) return null;

    return { 
        ...data, 
        media_type: type,
        imdb_id: data.external_ids?.imdb_id
    };
};

export const getSeasonDetails = async (apiKey: string, tvId: number, seasonNumber: number): Promise<Episode[]> => {
    const data = await fetchWithKey(`/tv/${tvId}/season/${seasonNumber}`, apiKey);
    return data?.episodes || [];
};

export const getMovieCast = async (apiKey: string, id: number, type: 'movie' | 'tv' = 'movie'): Promise<Cast[]> => {
    const data = await fetchWithKey(`/${type}/${id}/credits`, apiKey);
    return data?.cast?.slice(0, 10) || [];
};