import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, MovieDetails, AppView, Cast, Episode, PlayerState } from './types';
import { getTrendingMovies, getTrendingTV, searchMovies, getMovieDetails, getMovieCast, getMoviesByGenre, getNowPlaying, getOnTheAir, getSeasonDetails } from './services/tmdbService';
import { BACKDROP_BASE_URL, IMAGE_BASE_URL, TMDB_API_KEY_STORAGE_KEY, DEFAULT_TMDB_KEY } from './constants';
import MovieCard from './components/MovieCard';
import Player from './components/Player';
import GeminiChat from './components/GeminiChat';
import { PlayIcon, SearchIcon, SparklesIcon, StarIcon, ArrowLeftIcon } from './components/Icons';

// IDs de Gênero do TMDB
const GENRES = {
  MOVIE: {
    ACTION: '28',
    COMEDY: '35',
    HORROR: '27'
  },
  TV: {
    ACTION: '10759', // Action & Adventure
    COMEDY: '35',
    HORROR: '9648' // Mystery
  }
};

interface CategorySection {
    title: string;
    movies: Movie[];
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie'); // Aba ativa
  
  // Estados para as categorias
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]); // Novos Lançamentos
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  
  // Estado para busca
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  
  // Estados para Séries na Home
  const [currentSeason, setCurrentSeason] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [playerInitialState, setPlayerInitialState] = useState<PlayerState>({ season: 1, episode: 1 });

  const [searchQuery, setSearchQuery] = useState('');
  const [tmdbKey, setTmdbKey] = useState<string>(DEFAULT_TMDB_KEY);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load API Key and Initial Data
  useEffect(() => {
    const savedKey = localStorage.getItem(TMDB_API_KEY_STORAGE_KEY);
    const keyToUse = savedKey || DEFAULT_TMDB_KEY;
    
    setTmdbKey(keyToUse);
    loadContent(keyToUse, activeTab);
    
    setShowKeyModal(false);
  }, []);

  // Recarrega quando a aba muda
  useEffect(() => {
    if (currentView === AppView.HOME) {
        loadContent(tmdbKey, activeTab);
    }
  }, [activeTab]);

  // Carrega episódios quando uma série é selecionada ou a temporada muda
  useEffect(() => {
    if (selectedMovie && selectedMovie.media_type === 'tv') {
        const fetchEpisodes = async () => {
            const eps = await getSeasonDetails(tmdbKey, selectedMovie.id, currentSeason);
            setSeasonEpisodes(eps);
        };
        fetchEpisodes();
    }
  }, [selectedMovie, currentSeason, tmdbKey]);

  const loadContent = async (key: string, type: 'movie' | 'tv') => {
    setLoading(true);
    
    // Função auxiliar atualizada para garantir array vazio e evitar null
    const safeFetch = async (fn: Promise<Movie[]>) => {
        try {
            const result = await fn;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.warn("Category load failed:", error);
            return [];
        }
    };

    try {
        if (type === 'movie') {
            const trend = await safeFetch(getTrendingMovies(key));
            const now = await safeFetch(getNowPlaying(key));
            const act = await safeFetch(getMoviesByGenre(key, GENRES.MOVIE.ACTION, 'movie'));
            const com = await safeFetch(getMoviesByGenre(key, GENRES.MOVIE.COMEDY, 'movie'));
            const horr = await safeFetch(getMoviesByGenre(key, GENRES.MOVIE.HORROR, 'movie'));
            
            setTrending(trend);
            setNowPlaying(now);
            setActionMovies(act);
            setComedyMovies(com);
            setHorrorMovies(horr);
        } else {
            const trend = await safeFetch(getTrendingTV(key));
            const now = await safeFetch(getOnTheAir(key));
            const act = await safeFetch(getMoviesByGenre(key, GENRES.TV.ACTION, 'tv'));
            const com = await safeFetch(getMoviesByGenre(key, GENRES.TV.COMEDY, 'tv'));
            const horr = await safeFetch(getMoviesByGenre(key, GENRES.TV.HORROR, 'tv'));
            
            setTrending(trend);
            setNowPlaying(now);
            setActionMovies(act);
            setComedyMovies(com);
            setHorrorMovies(horr);
        }
    } catch (e) {
        console.error("Erro crítico ao carregar conteúdo", e);
    }
    
    setLoading(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
        setCurrentView(AppView.HOME);
        loadContent(tmdbKey, activeTab);
        return;
    }
    setLoading(true);
    setCurrentView(AppView.SEARCH);
    try {
        const results = await searchMovies(tmdbKey, searchQuery);
        setSearchResults(results);
    } catch (e) {
        console.error("Search error", e);
        setSearchResults([]);
    }
    setLoading(false);
  };

  const handleMovieClick = async (movie: Movie) => {
    setLoading(true);
    try {
        const type = movie.media_type || activeTab; 
        
        const details = await getMovieDetails(tmdbKey, movie.id, type);
        const castData = await getMovieCast(tmdbKey, movie.id, type);
        
        if (details) {
          setSelectedMovie(details);
          setCast(castData);
          setCurrentSeason(1); 
          setCurrentView(AppView.DETAILS);
        }
    } catch (e) {
        console.error("Error loading movie details", e);
    }
    setLoading(false);
  };

  const handlePlay = () => {
    setPlayerInitialState({ season: 1, episode: 1 });
    setCurrentView(AppView.PLAYER);
  };
  
  const handleEpisodePlay = (ep: Episode) => {
      setPlayerInitialState({ season: ep.season_number, episode: ep.episode_number });
      setCurrentView(AppView.PLAYER);
  };

  const closePlayer = () => {
    setCurrentView(AppView.DETAILS);
  };

  const backToHome = () => {
    setCurrentView(AppView.HOME);
    setSelectedMovie(null);
    setSearchQuery('');
    if (trending.length === 0) {
        loadContent(tmdbKey, activeTab);
    }
  };

  const getDisplayTitle = (m: Movie | MovieDetails | null) => {
      if (!m) return '';
      return m.title || m.name || '';
  };

  const getDisplayDate = (m: Movie | MovieDetails | null) => {
    if (!m) return '';
    return m.release_date || m.first_air_date || '';
  };

  const MovieRow = ({ title, items }: { title: string, items: Movie[] }) => {
      // Proteção extra: se items for null/undefined, não renderiza
      if (!items || items.length === 0) return null;
      
      const rowRef = useRef<HTMLDivElement>(null);

      const scroll = (direction: 'left' | 'right') => {
          if (rowRef.current) {
              const { current } = rowRef;
              const scrollAmount = direction === 'left' ? -500 : 500;
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      };

      return (
        <div className="mb-8 pl-4 md:pl-8">
            <h2 className="mb-4 text-xl font-bold text-white md:text-2xl border-l-4 border-red-600 pl-3">
                {title}
            </h2>
            <div className="group relative">
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-40 hidden h-full w-12 items-center justify-center bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 md:flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div 
                    ref={rowRef}
                    className="flex gap-4 overflow-x-scroll scroll-smooth scrollbar-hide pb-4 pr-4"
                >
                    {items.map((movie) => (
                        <div key={movie.id} className="min-w-[160px] md:min-w-[200px]">
                            <MovieCard movie={movie} onClick={handleMovieClick} />
                        </div>
                    ))}
                </div>

                 <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-40 hidden h-full w-12 items-center justify-center bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 md:flex"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#141414] text-gray-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Navbar */}
      <nav className={`fixed top-0 z-40 w-full transition-all duration-500 border-b border-white/5 ${window.scrollY > 0 ? 'bg-[#141414]/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-8">
            <h1 
              onClick={backToHome}
              className="cursor-pointer text-2xl font-black tracking-tighter text-red-600 md:text-3xl hover:scale-105 transition-transform"
            >
              BRFLIX
            </h1>
            
            {/* Tab Switcher - Desktop */}
            <div className="hidden md:flex gap-1 bg-gray-900/50 p-1 rounded-full border border-gray-800">
                <button 
                    onClick={() => { setActiveTab('movie'); setCurrentView(AppView.HOME); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'movie' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    Filmes
                </button>
                <button 
                    onClick={() => { setActiveTab('tv'); setCurrentView(AppView.HOME); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'tv' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    Séries
                </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden md:block group">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 transition-all duration-300 focus:w-64 rounded-full border border-gray-700 bg-black/40 px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <SearchIcon className="h-4 w-4" />
              </button>
            </form>
            <button 
                onClick={() => setShowChat(!showChat)}
                className="group relative rounded-full bg-gradient-to-r from-red-600 to-red-700 p-2 text-white hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-900/20"
            >
                <SparklesIcon className="h-5 w-5 animate-pulse" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Switcher */}
      {(currentView === AppView.HOME || currentView === AppView.SEARCH) && (
        <div className="fixed bottom-0 left-0 z-30 w-full md:hidden bg-[#141414] border-t border-gray-800 pb-safe">
            <div className="flex justify-around p-2">
                <button 
                    onClick={() => { setActiveTab('movie'); setCurrentView(AppView.HOME); }}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg ${activeTab === 'movie' ? 'text-red-500' : 'text-gray-500'}`}
                >
                    <span className="text-sm font-bold">Filmes</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('tv'); setCurrentView(AppView.HOME); }}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg ${activeTab === 'tv' ? 'text-red-500' : 'text-gray-500'}`}
                >
                    <span className="text-sm font-bold">Séries</span>
                </button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen">
        
        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                <span className="text-red-500 font-bold animate-pulse">Carregando...</span>
            </div>
          </div>
        )}

        {/* HOME VIEW: Hero + Carousels */}
        {currentView === AppView.HOME && (
          <div className="pb-24">
            {/* Hero Section (Most Trending) */}
            {trending.length > 0 && (
                <div className="relative mb-8 h-[60vh] md:h-[80vh] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent z-10"></div>
                    <img 
                        src={`${BACKDROP_BASE_URL}${trending[0].backdrop_path}`} 
                        alt="Hero" 
                        className="h-full w-full object-cover transform scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
                    />
                    <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-16 flex flex-col justify-end h-full">
                        <div className="container mx-auto">
                            <span className="mb-3 inline-block rounded-md bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                                #1 em {activeTab === 'movie' ? 'Filmes' : 'Séries'}
                            </span>
                            <h2 className="mb-4 text-4xl font-black md:text-7xl max-w-4xl drop-shadow-2xl leading-none text-white">
                                {getDisplayTitle(trending[0])}
                            </h2>
                            <p className="mb-8 max-w-xl text-lg text-gray-200 line-clamp-3 drop-shadow-lg leading-relaxed font-medium">
                                {trending[0].overview}
                            </p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleMovieClick(trending[0])}
                                    className="flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-black hover:bg-gray-200 hover:scale-105 transition-all shadow-xl"
                                >
                                    <PlayIcon className="h-6 w-6" /> Detalhes
                                </button>
                                <button className="flex items-center gap-2 rounded-lg bg-gray-600/60 px-8 py-3 font-bold text-white backdrop-blur-md hover:bg-gray-600/80 transition-all">
                                    + Minha Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Carousels Categories */}
            <div className="flex flex-col gap-2 -mt-10 relative z-20">
                <MovieRow title={activeTab === 'movie' ? "Lançamentos (Nos Cinemas)" : "Novos Episódios (No Ar)"} items={nowPlaying} />
                <MovieRow title={activeTab === 'movie' ? "Em Alta" : "Mais Populares"} items={trending} />
                <MovieRow title="Ação & Aventura" items={actionMovies} />
                <MovieRow title="Comédia" items={comedyMovies} />
                <MovieRow title={activeTab === 'movie' ? "Terror & Suspense" : "Mistério & Suspense"} items={horrorMovies} />
            </div>
            
            {trending.length === 0 && !loading && (
                 <div className="mt-20 flex flex-col items-center justify-center text-gray-500 gap-4">
                    <p className="text-xl">Nenhum título encontrado.</p>
                </div>
            )}
          </div>
        )}

        {/* SEARCH VIEW: Grid */}
        {currentView === AppView.SEARCH && (
            <div className="pt-24 pb-24 container mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-red-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-white md:text-3xl">
                        Resultados: "{searchQuery}"
                    </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {searchResults.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
                ))}
                </div>
                
                {searchResults.length === 0 && !loading && (
                    <div className="mt-20 flex flex-col items-center justify-center text-gray-500 gap-4">
                        <SearchIcon className="w-16 h-16 opacity-20" />
                        <p className="text-xl">Nenhum título encontrado para sua busca.</p>
                    </div>
                )}
            </div>
        )}

        {/* Details View - Redesigned Centralized Layout */}
        {currentView === AppView.DETAILS && selectedMovie && (
          <div className="relative min-h-screen bg-[#141414]">
            
            {/* 1. Top Backdrop Banner (Faded) */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                 <div className="absolute inset-0 bg-[#141414]/40 z-10"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent z-20"></div>
                 <img 
                    src={`${BACKDROP_BASE_URL}${selectedMovie.backdrop_path}`} 
                    alt="Background" 
                    className="h-full w-full object-cover blur-[2px] opacity-60"
                 />
                 <button 
                    onClick={backToHome} 
                    className="absolute top-24 left-4 md:left-8 z-50 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white hover:bg-red-600 transition-colors backdrop-blur-md border border-white/10"
                >
                    <ArrowLeftIcon className="h-5 w-5" /> Voltar
                 </button>
            </div>

            {/* 2. Central Content Container (Overlapping) */}
            <div className="relative z-30 -mt-32 md:-mt-48 container mx-auto px-4 pb-20 flex flex-col items-center">
                
                {/* Poster Card (Center) */}
                <div className="relative group perspective-1000 mb-8">
                    <img 
                        src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`} 
                        alt={getDisplayTitle(selectedMovie)} 
                        className="h-64 md:h-96 w-auto rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 transform transition-transform group-hover:scale-105"
                    />
                     {/* Play Button Overlay on Poster */}
                     <div 
                        onClick={handlePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl backdrop-blur-[2px]"
                     >
                         <div className="rounded-full bg-red-600 p-4 shadow-lg scale-0 group-hover:scale-110 transition-transform duration-300">
                             <PlayIcon className="h-8 w-8 text-white ml-1" />
                         </div>
                     </div>
                </div>

                {/* Title & Meta Info */}
                <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-4 drop-shadow-xl max-w-4xl leading-tight">
                    {getDisplayTitle(selectedMovie)}
                </h1>
                
                {selectedMovie.tagline && (
                    <p className="text-lg text-gray-400 italic mb-6 text-center max-w-2xl">"{selectedMovie.tagline}"</p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-gray-300 mb-8 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-1 text-green-400 font-bold">
                        <StarIcon className="h-5 w-5" /> 
                        {selectedMovie.vote_average.toFixed(1)}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span>{new Date(getDisplayDate(selectedMovie)).getFullYear()}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span>
                        {selectedMovie.media_type === 'tv' 
                            ? `${selectedMovie.number_of_seasons} Temporadas` 
                            : `${selectedMovie.runtime} min`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <div className="flex gap-2">
                        {selectedMovie.genres.slice(0, 3).map(g => (
                            <span key={g.id} className="text-gray-200">
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-12 w-full">
                    <button 
                      onClick={handlePlay}
                      className="flex items-center gap-3 rounded-full bg-red-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-red-900/30 hover:bg-red-700 hover:scale-105 transition-all w-full md:w-auto justify-center"
                    >
                      <PlayIcon className="h-6 w-6" /> Assistir Agora
                    </button>
                    <button 
                        onClick={() => setShowChat(true)}
                        className="flex items-center gap-2 rounded-full bg-gray-800 border border-gray-700 px-8 py-4 font-bold text-white hover:bg-gray-700 transition-colors w-full md:w-auto justify-center"
                    >
                        <SparklesIcon className="h-5 w-5 text-yellow-500" /> Detalhes com IA
                    </button>
                </div>

                {/* SEÇÃO DE EPISÓDIOS (PARA SÉRIES) */}
                {selectedMovie.media_type === 'tv' && (
                    <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-2xl p-6 mb-8 border border-white/5 shadow-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="h-6 w-1 bg-red-600 rounded-full"></span>
                                Episódios
                            </h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400 font-bold">Temporada:</label>
                                <select 
                                    value={currentSeason} 
                                    onChange={(e) => setCurrentSeason(Number(e.target.value))}
                                    className="bg-gray-800 text-white rounded-md px-3 py-1.5 text-sm font-bold border border-gray-600 focus:border-red-600 outline-none cursor-pointer"
                                >
                                    {Array.from({ length: selectedMovie.number_of_seasons || 1 }, (_, i) => i + 1).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {seasonEpisodes.map((ep) => (
                                <button
                                    key={ep.id}
                                    onClick={() => handleEpisodePlay(ep)}
                                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left border border-transparent hover:border-gray-700 group"
                                >
                                    <div className="relative w-32 h-20 shrink-0 rounded-md overflow-hidden bg-gray-900">
                                        {ep.still_path ? (
                                            <img 
                                                src={`${IMAGE_BASE_URL}${ep.still_path}`} 
                                                alt={ep.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <PlayIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayIcon className="w-8 h-8 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white truncate pr-2">
                                                {ep.episode_number}. {ep.name}
                                            </h4>
                                            <span className="text-xs text-gray-400 font-mono">
                                                {ep.air_date ? new Date(ep.air_date).getFullYear() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                            {ep.overview || "Sem descrição disponível para este episódio."}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Synopsis & Info Container */}
                <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-2xl p-6 md:p-10 border border-white/5 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-3">Sinopse</h3>
                    <p className="text-lg leading-relaxed text-gray-300 mb-10 text-justify">
                        {selectedMovie.overview || "Nenhuma sinopse disponível."}
                    </p>

                    {/* Cast */}
                    <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-red-600 pl-3">Elenco Principal</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {cast.map(person => (
                            <div key={person.id} className="text-center group">
                                <div className="mb-3 aspect-square w-full overflow-hidden rounded-full border-2 border-transparent group-hover:border-red-600 transition-colors bg-gray-800">
                                    {person.profile_path ? (
                                        <img 
                                            src={`${IMAGE_BASE_URL}${person.profile_path}`} 
                                            alt={person.name}
                                            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">?</div>
                                    )}
                                </div>
                                <p className="truncate text-sm font-bold text-white">{person.name}</p>
                                <p className="truncate text-xs text-gray-400">{person.character}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </div>
        )}

        {/* Player View */}
        {currentView === AppView.PLAYER && selectedMovie && (
            <Player 
                movie={selectedMovie} 
                onClose={closePlayer} 
                apiKey={tmdbKey} 
                initialSeason={playerInitialState.season}
                initialEpisode={playerInitialState.episode}
            />
        )}

      </main>

      {/* Floating Chat */}
      {showChat && (
        <GeminiChat 
            currentMovie={currentView === AppView.DETAILS ? selectedMovie : null} 
            onClose={() => setShowChat(false)}
            onSearchRequest={(q) => {
                setSearchQuery(q);
                handleSearch();
                setShowChat(false);
            }}
        />
      )}
    </div>
  );
}

export default App;