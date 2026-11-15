import React from 'react';
import { X, Play, Star, Calendar, Clock, Film, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react';
import { MovieCatalogItem } from '../utils/movieCatalog';

interface MovieDetailsModalProps {
  movie: MovieCatalogItem;
  onClose: () => void;
  onSelectMovieForForecast: (movie: MovieCatalogItem) => void;
  onViewShowtimes: (movie: MovieCatalogItem) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onSelectMovieForForecast,
  onViewShowtimes,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#1E202B] border border-white/10 shadow-2xl overflow-hidden text-white">
        {/* Backdrop Banner with BookMyShow Gradient */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
          <img
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E202B] via-[#1E202B]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E202B] via-transparent to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-[#F84464] text-white flex items-center justify-center transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Poster & Title Hero Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end space-x-5 z-10">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl border-2 border-white/20 shadow-2xl flex-shrink-0"
            />
            <div className="space-y-1.5 min-w-0">
              {movie.is_premiere && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F84464] text-white">
                  PREMIERE • COLD-START RELEASE
                </span>
              )}
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate drop-shadow-md">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span className="flex items-center text-[#D8B46A] font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  {movie.rating} ({movie.votes})
                </span>
                <span>•</span>
                <span>{movie.certificate}</span>
                <span>•</span>
                <span>{movie.runtime_min} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Formats & Languages */}
          <div className="flex flex-wrap items-center gap-2">
            {movie.formats.map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-white/5 border border-white/10 text-neutral-200"
              >
                {fmt}
              </span>
            ))}
            <span className="text-xs text-neutral-400 ml-2">
              Available in: <strong className="text-white">{movie.languages.join(', ')}</strong>
            </span>
          </div>

          {/* Tagline & Synopsis */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
              About the Movie
            </h4>
            <p className="text-xs text-[#D8B46A] font-medium italic">
              &quot;{movie.tagline}&quot;
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Cast & Director */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
            <div>
              <span className="text-neutral-400 block mb-0.5">Director</span>
              <span className="font-bold text-white">{movie.director}</span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Genre &amp; Audience</span>
              <span className="font-bold text-white">{movie.genre}</span>
            </div>
          </div>

          {/* AI Demand Intelligence Card */}
          <div className="p-4 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8B46A]" />
                <span>Audience Buzz &amp; Machine Learning Popularity</span>
              </span>
              <p className="text-[11px] text-neutral-400">
                Popularity Index: <strong className="text-[#D8B46A]">★ {movie.popularity} / 10</strong> • High Pre-Release Momentum
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#D8B46A]/10 text-[#D8B46A] text-xs font-bold border border-[#D8B46A]/25">
              Top Attraction
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#17171D]">
          <button
            onClick={() => {
              onClose();
              onSelectMovieForForecast(movie);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#D8B46A]" />
            <span>Interactive Demand Forecast</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onViewShowtimes(movie);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03150] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#F84464]/30 transition-all flex items-center space-x-2"
          >
            <Film className="w-3.5 h-3.5" />
            <span>View Multiplex Showtimes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

