import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, TrendingUp, Calendar, Film } from 'lucide-react';

interface BannerSlide {
  id: string;
  badge?: string;
  badgeColor?: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: string;
  image: string;
  theme: 'stream' | 'imax' | 'event' | 'coldstart';
}

const BANNERS: BannerSlide[] = [
  {
    id: 'b1',
    badge: 'book my show STREAM',
    badgeColor: '#F84464',
    tagline: 'Experience the global phenomenon at home',
    title: 'THE ODYSSEY',
    subtitle: 'A Film by Christopher Nolan • Universal Studios • 4K Dolby Vision',
    ctaText: 'Pre-Order Now',
    ctaAction: 'forecast',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=85',
    theme: 'stream',
  },
  {
    id: 'b2',
    badge: 'IMAX 3D EXCLUSIVE',
    badgeColor: '#0072CE',
    tagline: 'Experience Cinema in Its Highest Dimension',
    title: 'QUANTUM HORIZON',
    subtitle: 'Screen-1 IMAX 4K Laser (350 Seats) • Weekend Surge Forecast Active',
    ctaText: 'View Showtimes',
    ctaAction: 'showtimes',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=85',
    theme: 'imax',
  },
  {
    id: 'b3',
    badge: 'COLD-START PREMIERES',
    badgeColor: '#F84464',
    tagline: 'Watch Brand New Movies Every Friday',
    title: 'NEON SYNDICATE & RESIDENT EVIL',
    subtitle: 'Day 0 Theatrical Release • Genre-Level Demand Priors (±32 tickets σ)',
    ctaText: 'Explore Cold-Start AI',
    ctaAction: 'coldstart',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=85',
    theme: 'coldstart',
  },
  {
    id: 'b4',
    badge: 'SUNBURN ARENA & BOOMBOX',
    badgeColor: '#9333EA',
    tagline: 'India Tour 2024 - Live In Concert',
    title: 'ALESSO • SMIRNOFF LEMON POP',
    subtitle: '27 NOV • Bengaluru & Hyderabad Arena • 100% Demand Velocity',
    ctaText: 'Simulate Capacity',
    ctaAction: 'simulator',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=85',
    theme: 'event',
  },
];

interface BookMyShowHeroBannerProps {
  onNavigate: (tabId: string) => void;
}

export const BookMyShowHeroBanner: React.FC<BookMyShowHeroBannerProps> = ({ onNavigate }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = BANNERS[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % BANNERS.length);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#1E202B] border border-white/10 shadow-2xl group">
      {/* Banner Backdrop Image */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out scale-105 group-hover:scale-100"
        />

        {/* Cinematic Gradient Overlays (BookMyShow Style) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#17171D] via-[#17171D]/75 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#17171D] via-transparent to-black/30"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 md:px-16 max-w-2xl space-y-3">
          {/* Badge */}
          {slide.badge && (
            <div className="flex items-center space-x-2">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: slide.badgeColor || '#F84464' }}
              >
                {slide.badge}
              </span>
              <span className="text-xs text-[#D8B46A] font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Revenue Engine</span>
              </span>
            </div>
          )}

          {/* Tagline */}
          <p className="text-xs sm:text-sm font-medium text-white/80 uppercase tracking-widest">
            {slide.tagline}
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed line-clamp-2">
            {slide.subtitle}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => onNavigate(slide.ctaAction)}
              className="px-6 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03150] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#F84464]/30 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{slide.ctaText}</span>
            </button>

            <button
              onClick={() => onNavigate('forecast')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center space-x-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#D8B46A]" />
              <span>Forecast Demand</span>
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-[#F84464] text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-[#F84464] text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 right-8 flex items-center space-x-2">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIdx ? 'w-6 bg-[#F84464]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

