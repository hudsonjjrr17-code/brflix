import React, { useState, useEffect } from 'react';
import { STREAMING_PROVIDERS, StreamingProvider, IMAGE_BASE_URL } from '../constants';
import { MovieDetails, Episode } from '../types';
import { ArrowLeftIcon, PlayIcon } from './Icons';
import { getSeasonDetails } from '../services/tmdbService';

interface PlayerProps {
  movie: MovieDetails;
  apiKey: string;
  onClose: () => void;
  initialSeason?: number;
  initialEpisode?: number;
}

const Player: React.FC<PlayerProps> = ({ movie, apiKey, onClose, initialSeason = 1, initialEpisode = 1 }) => {
  const [currentProvider, setCurrentProvider] = useState<StreamingProvider>(STREAMING_PROVIDERS[0]);
  const [key, setKey] = useState(0); 
  const [iframeLoading, setIframeLoading] = useState(true);

  // Estados para Séries
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const isTV = movie.media_type === 'tv';
  const displayTitle = movie.title || movie.name || 'Sem Título';

  // Carregar episódios quando mudar a temporada (apenas para TV)
  useEffect(() => {
    if (isTV) {
        const fetchEpisodes = async () => {
            setLoadingEpisodes(true);
            const eps = await getSeasonDetails(apiKey, movie.id, season);
            setEpisodesList(eps);
            setLoadingEpisodes(false);
        };
        fetchEpisodes();
    }
  }, [season, isTV, movie.id, apiKey]);

  // Se initialEpisode mudar (vindo de fora), atualiza o estado interno
  useEffect(() => {
    setSeason(initialSeason);
    setEpisode(initialEpisode);
  }, [initialSeason, initialEpisode]);

  const handleProviderChange = (provider: StreamingProvider) => {
    setIframeLoading(true);
    setCurrentProvider(provider);
    setKey(prev => prev + 1);
  };

  const handleEpisodeChange = (epNum: number) => {
      setEpisode(epNum);
      setIframeLoading(true);
      setKey(prev => prev + 1); // Reload iframe
  };

  const mediaType = isTV ? 'tv' : 'movie';
  
  // URL atual gerada
  const currentUrl = currentProvider.getUrl(movie.id, movie.imdb_id, mediaType, season, episode);

  // Lógica de Renderização da Dica de Áudio ATUALIZADA para novos players
  const renderAudioTip = () => {
    switch (currentProvider.id) {
        case 'supertv':
        case 'vocesabia':
            return (
                <div className="bg-green-900/40 border border-green-500/50 p-4 rounded-lg flex items-start gap-4">
                    <span className="text-2xl">🇧🇷</span>
                    <div>
                        <p className="text-green-100 font-bold text-base mb-1">Foco em Português-BR</p>
                        <p className="text-green-200/90 text-sm">
                            Este player é otimizado para encontrar conteúdo dublado ou legendado em português.
                        </p>
                    </div>
                </div>
            );
        case 'vidsrc':
            return (
                <div className="bg-blue-900/40 border border-blue-500/50 p-4 rounded-lg flex items-start gap-4">
                    <span className="text-2xl">⚙️</span>
                    <div>
                        <p className="text-blue-100 font-bold text-base mb-1">Player Multi-Servidor</p>
                        <p className="text-blue-200/90 text-sm">
                            Este player carrega de várias fontes. Se o vídeo não funcionar, procure por um botão de <strong>"Fontes"</strong> ou <strong>"Sources"</strong> dentro do player para trocar de servidor.
                        </p>
                    </div>
                </div>
            );
        case 'upstream':
             return (
                <div className="bg-gray-800/50 border border-gray-600/50 p-4 rounded-lg flex items-start gap-4">
                    <span className="text-2xl">🔗</span>
                    <div>
                        <p className="text-gray-100 font-bold text-base mb-1">Fonte Alternativa</p>
                        <p className="text-gray-200/90 text-sm">
                            Uma opção de backup confiável. Pode não ter todas as opções de áudio.
                        </p>
                    </div>
                </div>
            );
        default:
            return (
                 <div className="bg-gray-800/50 border border-gray-600/50 p-4 rounded-lg flex items-start gap-4">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <p className="text-gray-100 font-bold text-base mb-1">Dica do Player</p>
                        <p className="text-gray-200/90 text-sm">
                           {currentProvider.tip || "Selecione um player para começar a assistir."}
                        </p>
                    </div>
                </div>
            );
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* Header Fixo */}
      <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between bg-gradient-to-b from-black via-black/90 to-transparent p-4 pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 border border-red-500/30"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-bold">Sair</span>
        </button>
        <div className="text-right pl-4 pointer-events-auto">
           <h2 className="text-sm md:text-lg font-bold truncate max-w-[200px] md:max-w-md drop-shadow-lg text-gray-200">
            {displayTitle}
           </h2>
           {isTV && (
             <p className="text-xs text-red-500 font-bold">T{season} : E{episode}</p>
           )}
        </div>
      </div>

      {/* Container Rolável Principal */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-hide bg-[#0a0a0a]">
        <div className="flex flex-col items-center min-h-full pt-20 pb-20 px-4 md:px-8">
          
          {/* Seletor de Servidores */}
          <div className="w-full max-w-6xl bg-[#141414] rounded-xl p-5 border border-white/5 mb-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                    <span className="h-5 w-1.5 bg-red-600 rounded-full"></span>
                    Escolha o Player
                </h3>
                <span className="text-xs text-gray-500 font-medium">Se um não funcionar, tente outro.</span>
              </div>

              {/* Grade de botões */}
              <div className="flex flex-wrap gap-3">
                {STREAMING_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider)}
                    className={`relative flex flex-col items-start px-4 py-2.5 rounded-lg text-xs font-bold transition-all border w-[140px] md:w-auto ${
                      currentProvider.id === provider.id
                        ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                        : 'bg-[#1f1f1f] border-gray-700 text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                        {provider.name}
                        {currentProvider.id === provider.id && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        )}
                    </div>
                    {/* Badge de Idioma ATUALIZADO */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        provider.id === 'supertv' || provider.id === 'vocesabia'
                        ? 'bg-green-900/50 text-green-300 border border-green-500/20' 
                        : provider.id === 'vidsrc'
                            ? 'bg-blue-900/50 text-blue-300 border border-blue-500/20'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600/20'
                    }`}>
                        {provider.id === 'supertv' ? '🇧🇷 Recomendado' : provider.id === 'vocesabia' ? '🇧🇷 Dublado' : provider.id === 'vidsrc' ? '🌐 Multi-Fonte' : '🔗 Alternativo'}
                    </span>
                  </button>
                ))}
              </div>
          </div>

          {/* Dica de Áudio Dinâmica */}
          <div className="w-full max-w-6xl mb-4">
             {renderAudioTip()}
          </div>

          {/* Área do Vídeo */}
          <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative z-10 mb-6 flex items-center justify-center">
             
             {/* Loading Spinner */}
             {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-0">
                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent mb-4 shadow-[0_0_20px_rgba(220,38,38,0.4)]"></div>
                    <p className="text-gray-400 animate-pulse font-medium text-sm">Conectando ao servidor seguro...</p>
                </div>
             )}

             {currentUrl ? (
                <iframe 
                  key={key} 
                  src={currentUrl} 
                  width="100%" 
                  height="100%" 
                  allowFullScreen 
                  allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen"
                  referrerPolicy={currentProvider.policy}
                  className={`absolute inset-0 h-full w-full border-none bg-transparent transition-opacity duration-500 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                  title={`Player for ${displayTitle}`}
                  onLoad={() => setIframeLoading(false)}
                />
             ) : (
                 <div className="text-center p-6 text-gray-400">
                     <p className="mb-2">⚠️ Link não disponível.</p>
                 </div>
             )}
          </div>

          {/* Botão de Emergência */}
          <div className="w-full max-w-6xl mb-8 flex flex-col items-center gap-3">
             <p className="text-xs text-gray-500">O player não carregou ou deu erro?</p>
             <a 
                href={currentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-full transition-all border border-gray-600 shadow-lg"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                ABRIR PLAYER EM NOVA JANELA
             </a>
          </div>

          {/* Seletor de Episódios (Apenas para Séries) */}
          {isTV && (
            <div className="w-full max-w-6xl mb-6 bg-[#141414] rounded-xl p-5 border border-white/5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-gray-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="h-5 w-1 bg-red-600 rounded-full"></span>
                        Episódios
                    </h3>
                    
                    {/* Seletor de Temporada */}
                    <div className="flex items-center gap-3 bg-gray-900 p-1.5 rounded-lg border border-gray-700">
                        <label className="text-xs text-gray-400 font-bold uppercase pl-2">Temporada</label>
                        <select 
                            value={season} 
                            onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}
                            className="bg-gray-800 text-white rounded px-3 py-1 text-sm font-bold border border-gray-600 focus:border-red-600 outline-none cursor-pointer"
                        >
                            {Array.from({ length: movie.number_of_seasons || 1 }, (_, i) => i + 1).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loadingEpisodes ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        <span className="text-xs text-gray-500">Carregando lista...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {episodesList.map((ep) => (
                            <button
                                key={ep.id}
                                onClick={() => handleEpisodeChange(ep.episode_number)}
                                className={`group relative flex flex-col items-start rounded-lg overflow-hidden transition-all border ${
                                    episode === ep.episode_number 
                                        ? 'border-red-600 bg-gray-800 ring-1 ring-red-600' 
                                        : 'border-transparent bg-[#1a1a1a] hover:bg-gray-800 hover:border-gray-600'
                                }`}
                            >
                                <div className="relative aspect-video w-full bg-black">
                                    {ep.still_path ? (
                                        <img 
                                            src={`${IMAGE_BASE_URL}${ep.still_path}`} 
                                            alt={ep.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <PlayIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                    {/* Overlay Episódio Atual */}
                                    {episode === ep.episode_number && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                                            <PlayIcon className="w-8 h-8 text-red-600 drop-shadow-lg" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-200">
                                        EP {ep.episode_number}
                                    </div>
                                </div>
                                <div className="p-3 w-full">
                                    <p className={`text-xs font-bold truncate mb-1 ${episode === ep.episode_number ? 'text-red-400' : 'text-gray-200'}`}>
                                        {ep.episode_number}. {ep.name || `Episódio ${ep.episode_number}`}
                                    </p>
                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                        {ep.overview || "Sem descrição."}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Player;