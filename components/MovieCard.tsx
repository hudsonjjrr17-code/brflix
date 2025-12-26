import React from 'react';
import { Movie } from '../types';
import { IMAGE_BASE_URL } from '../constants';
import { StarIcon } from './Icons';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const displayTitle = movie.title || movie.name || 'Sem Título';
  const displayDate = movie.release_date || movie.first_air_date || '';

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-900 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] w-full">
        {movie.poster_path ? (
          <img 
            src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
            alt={displayTitle}
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
            <span>Sem Imagem</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
        <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">{displayTitle}</h3>
        <div className="mt-2 flex items-center text-sm text-yellow-400">
          <StarIcon className="mr-1 h-4 w-4" />
          <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-300">{displayDate ? new Date(displayDate).getFullYear() : 'N/A'}</span>
          <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
            {movie.media_type === 'tv' ? 'TV' : 'FILME'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;