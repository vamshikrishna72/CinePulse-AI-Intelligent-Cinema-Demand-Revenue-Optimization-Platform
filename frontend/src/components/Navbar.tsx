import React, { useState } from 'react';
import {
  Film,
  Search,
  MapPin,
  ChevronDown,
  Menu,
  Clock,
  Cpu,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { MOVIE_CATALOG } from '../utils/movieCatalog';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onSelectMovie?: (movie: any) => void;
}

const CITIES = ['Hyderabad', 'Mumbai', 'Bengaluru', 'Delhi-NCR', 'Chennai', 'Pune', 'Kolkata'];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onSelectMovie }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchResults = searchQuery.trim()
    ? MOVIE_CATALOG.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const subNavLinks = [
    { id: 'dashboard', label: 'Movies & Control Center' },
    { id: 'showtimes', label: 'Showtimes & Theaters' },
    { id: 'forecast', label: 'Demand Forecasting' },
    { id: 'simulator', label: 'What-If Simulator' },
    { id: 'coldstart', label: 'Cold-Start AI' },
    { id: 'recommendations', label: 'Smart Recommendations' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'models', label: 'Model Audit' },
    { id: 'docs', label: 'Documentation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1E202B] border-b border-white/10 shadow-xl">
      {/* Primary Top Bar (Exact BookMyShow Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F84464] flex items-center justify-center shadow-lg shadow-[#F84464]/30 text-white font-black text-xl">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                cine<span className="text-[#F84464]">pulse</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#D8B46A] border border-white/15">
                AI PRO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium hidden sm:block">
              Demand &amp; Revenue Optimization Platform
            </p>
          </div>
        </div>

        {/* Global Search Bar (BookMyShow Style with Live Autocomplete) */}
        <div className="relative flex-1 max-w-xl mx-2 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Auditoriums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#17171D] border border-white/10 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E202B] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 text-[10px] font-bold uppercase text-neutral-400 bg-[#17171D] border-b border-white/5">
                Matching Films ({searchResults.length})
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    onMouseDown={() => {
                      if (onSelectMovie) onSelectMovie(movie);
                      onTabChange('forecast');
                    }}
                    className="p-2.5 flex items-center space-x-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-8 h-11 object-cover rounded border border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                      <p className="text-[10px] text-neutral-400">{movie.genre} • ★ {movie.popularity}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#F84464] uppercase px-2 py-0.5 rounded bg-[#F84464]/10">
                      Forecast
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center space-x-4">
          {/* City Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center space-x-1.5 text-xs text-neutral-300 hover:text-white transition-colors"
            >
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-[#1E202B] border border-white/15 rounded-xl shadow-2xl py-1 z-50">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors ${
                      selectedCity === city
                        ? 'text-[#F84464] font-bold bg-white/5'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BookMyShow Red "Sign in / Manager Login" Button */}
          <button
            onClick={() => onTabChange('forecast')}
            className="px-4 py-1.5 rounded-lg bg-[#F84464] hover:bg-[#E03150] text-white text-xs font-bold transition-all shadow-md shadow-[#F84464]/30"
          >
            Run Forecast
          </button>
        </div>
      </div>

      {/* Secondary Sub-Navigation Bar (Signature BookMyShow Subnav) */}
      <div className="bg-[#17171D] border-t border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-2 gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {subNavLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Operational Model Status */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-neutral-400 flex-shrink-0">
            <span className="flex items-center space-x-1 text-[#D8B46A]">
              <Clock className="w-3 h-3" />
              <span>Horizon: <strong>T-24h</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <Cpu className="w-3 h-3" />
              <span>XGBoost Champion (21.3% WAPE)</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
