export interface Movie {
  id: number;
  title: string; // Para filmes
  name?: string; // Para séries
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string; // Para séries
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number; // Para séries
  tagline: string;
  imdb_id?: string; // ID externo importante para players
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average?: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export enum AppView {
  HOME = 'HOME',
  DETAILS = 'DETAILS',
  PLAYER = 'PLAYER',
  SEARCH = 'SEARCH'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PlayerState {
  season: number;
  episode: number;
}