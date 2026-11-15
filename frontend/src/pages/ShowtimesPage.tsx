import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  Film,
  MapPin,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { MOVIE_CATALOG, getMoviePoster } from '../utils/movieCatalog';
import { ShowtimeIntelligenceModal } from '../components/ShowtimeIntelligenceModal';

interface ShowtimesPageProps {
  onNavigateToSimulator?: () => void;
  initialMovieTitle?: string;
}

const DATES = [
  { day: 'TODAY', date: '15 JUN', fullDate: '2024-06-15' },
  { day: 'TOM', date: '16 JUN', fullDate: '2024-06-16' },
  { day: 'MON', date: '17 JUN', fullDate: '2024-06-17' },
  { day: 'TUE', date: '18 JUN', fullDate: '2024-06-18' },
  { day: 'WED', date: '19 JUN', fullDate: '2024-06-19' },
  { day: 'THU', date: '20 JUN', fullDate: '2024-06-20' },
  { day: 'FRI', date: '21 JUN', fullDate: '2024-06-21' },
];

export const ShowtimesPage: React.FC<ShowtimesPageProps> = ({
  onNavigateToSimulator,
  initialMovieTitle,
}) => {
  const [selectedDate, setSelectedDate] = useState('2024-06-15');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedDemand, setSelectedDemand] = useState('ALL');
  const [selectedMovie, setSelectedMovie] = useState<string>(initialMovieTitle || 'ALL');
  const [activeModalShow, setActiveModalShow] = useState<any | null>(null);

  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShows() {
      setLoading(true);
      try {
        const summary = await apiService.getDashboardSummary();
        setShows(summary.recent_shows || []);
      } catch (err) {
        console.error('Failed to load shows', err);
      } finally {
        setLoading(false);
      }
    }
    loadShows();
  }, []);

  const THEATERS = [
    {
      screen_id: 'Screen-1',
      name: 'PVR IMAX 4K Laser • Screen 1',
      capacity: 350,
      format: 'IMAX 3D / Premium Large Format',
      amenities: ['M-Ticket', 'Food & Beverage', '4K Laser Projection', 'Dolby Atmos', 'Pushback Recliners'],
      basePrice: 380,
    },
    {
      screen_id: 'Screen-2',
      name: 'INOX Dolby Atmos Audi • Screen 2',
      capacity: 250,
      format: 'Standard Dolby Atmos',
      amenities: ['M-Ticket', 'Food & Beverage', '64-Channel Sound', 'Luxury Rockers'],
      basePrice: 280,
    },
    {
      screen_id: 'Screen-3',
      name: 'CinePulse Standard Digital • Screen 3',
      capacity: 180,
      format: 'Standard Audi',
      amenities: ['M-Ticket', '2K Digital Cinema', 'Surround 7.1'],
      basePrice: 200,
    },
    {
      screen_id: 'Screen-4',
      name: 'The Lounge - Boutique VIP • Screen 4',
      capacity: 120,
      format: 'Boutique / VIP',
      amenities: ['Motorized Recliners', 'In-Seat Gourmet Dining', 'Luxury Butler', 'Intimate Seating'],
      basePrice: 450,
    },
  ];

  // Helper to get time color BookMyShow style
  const getDemandColorClasses = (occPct: number) => {
    if (occPct >= 75) {
      return {
        pill: 'border-[#F84464] text-[#F84464] hover:bg-[#F84464] hover:text-white',
        status: 'Almost Full',
      };
    }
    if (occPct >= 45) {
      return {
        pill: 'border-[#D8B46A] text-[#D8B46A] hover:bg-[#D8B46A] hover:text-[#17171D]',
        status: 'Filling Fast',
      };
    }
    return {
      pill: 'border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white',
      status: 'Available',
    };
  };

  const timeSlots = [
    { time: '10:15', label: '10:15 AM (Morning)', period: 'Morning' },
    { time: '13:30', label: '01:30 PM (Matinee)', period: 'Matinee' },
    { time: '19:45', label: '07:45 PM (Prime)', period: 'Evening' },
    { time: '22:45', label: '10:45 PM (Night)', period: 'Night' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#F84464]/15 text-[#F84464] text-xs font-semibold border border-[#F84464]/30">
            <Film className="w-3.5 h-3.5" />
            <span>BookMyShow Multiplex Schedule</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mt-1">
            Theaters &amp; Showtimes Schedule
          </h1>
          <p className="text-xs lg:text-sm text-neutral-400 max-w-2xl mt-0.5">
            Real-time screening schedule across 4 auditoriums. Time slots are color-coded by AI-predicted occupancy: Green (Available), Orange (Filling Fast), and Red (Almost Full).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs bg-[#1E202B] px-3.5 py-2 rounded-xl border border-white/10">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-neutral-300">Available (&lt;45%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
            <span className="text-neutral-300">Filling Fast (45-75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F84464]"></span>
            <span className="text-neutral-300">Almost Full (&gt;75%)</span>
          </div>
        </div>
      </div>

      {/* BookMyShow Date Picker Row */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
        {DATES.map((d) => {
          const isSelected = selectedDate === d.fullDate;
          return (
            <button
              key={d.fullDate}
              onClick={() => setSelectedDate(d.fullDate)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#F84464] border-[#F84464] text-white shadow-lg shadow-[#F84464]/25 scale-105 font-bold'
                  : 'bg-[#1E202B] border-white/10 text-neutral-400 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">{d.day}</span>
              <span className="text-sm font-black">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs Row */}
      <div className="p-4 rounded-xl bg-[#1E202B] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-400 font-semibold uppercase tracking-wider flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Format:</span>
          </span>
          {['ALL', 'IMAX 3D', 'DOLBY ATMOS', 'STANDARD', 'VIP'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedFormat === fmt
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Movie Selector Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-neutral-400 font-semibold">Filter Film:</span>
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#17171D] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F84464]"
          >
            <option value="ALL">All Movies Showing</option>
            {MOVIE_CATALOG.map((m) => (
              <option key={m.id} value={m.title}>
                {m.title} ({m.genre})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Theaters List */}
      <div className="space-y-4">
        {THEATERS.map((theater) => {
          return (
            <div
              key={theater.screen_id}
              className="p-5 rounded-2xl bg-[#1E202B] border border-white/10 shadow-xl space-y-4"
            >
              {/* Theater Screen Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{theater.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D8B46A]/15 text-[#D8B46A] border border-[#D8B46A]/30">
                      {theater.capacity} Seats
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400">
                    {theater.amenities.map((amenity, idx) => (
                      <span key={idx} className="flex items-center space-x-1">
                        {idx > 0 && <span className="text-neutral-600">•</span>}
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Base Price</span>
                  <span className="text-sm font-black text-[#D8B46A]">₹{theater.basePrice}</span>
                </div>
              </div>

              {/* Movie Showtimes in this Screen */}
              <div className="space-y-3">
                {MOVIE_CATALOG.filter((m) => {
                  if (selectedMovie !== 'ALL' && m.title.toLowerCase() !== selectedMovie.toLowerCase()) {
                    return false;
                  }
                  return true;
                })
                  .slice(0, 3)
                  .map((movie) => {
                    return (
                      <div
                        key={movie.id}
                        className="p-3.5 rounded-xl bg-[#17171D] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        {/* Movie Info */}
                        <div className="flex items-center space-x-3 min-w-[200px]">
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-lg border border-white/10 shadow"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                              {movie.title}
                            </h4>
                            <div className="text-[10px] text-neutral-400 flex items-center space-x-1 mt-0.5">
                              <span className="text-[#D8B46A]">★ {movie.popularity}</span>
                              <span>•</span>
                              <span>{movie.genre}</span>
                            </div>
                          </div>
                        </div>

                        {/* Showtime Pills */}
                        <div className="flex-1 flex flex-wrap items-center gap-3">
                          {timeSlots.map((slot) => {
                            // Calculate deterministic simulated demand based on screen and time
                            let occPct = 42;
                            if (slot.period === 'Evening') occPct = 88;
                            else if (slot.period === 'Matinee') occPct = 65;
                            else if (slot.period === 'Night') occPct = 78;

                            if (theater.screen_id === 'Screen-1') occPct = Math.min(95, occPct + 6);
                            if (theater.screen_id === 'Screen-4') occPct = Math.max(35, occPct - 8);

                            const style = getDemandColorClasses(occPct);
                            const ticketsEst = Math.round(theater.capacity * (occPct / 100));

                            return (
                              <button
                                key={slot.time}
                                onClick={() => {
                                  setActiveModalShow({
                                    show_id: `SH-${movie.id}-${theater.screen_id}-${slot.time}`,
                                    movie_title: movie.title,
                                    genre: movie.genre,
                                    show_date: selectedDate,
                                    show_time: slot.time,
                                    screen_id: theater.screen_id,
                                    screen_type: theater.format,
                                    screen_capacity: theater.capacity,
                                    ticket_price: theater.basePrice,
                                    predicted_occupancy_pct: occPct,
                                    predicted_tickets: ticketsEst,
                                    demand_category: occPct >= 75 ? 'High Demand' : occPct >= 45 ? 'Moderate Demand' : 'Low Demand',
                                    is_cold_start: movie.is_premiere,
                                    poster_url: movie.poster_url,
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl border text-center transition-all duration-200 group flex flex-col items-center min-w-[90px] ${style.pill}`}
                              >
                                <span className="text-xs font-mono font-bold leading-none">
                                  {slot.time}
                                </span>
                                <span className="text-[9px] mt-1 opacity-80 uppercase tracking-tighter">
                                  {occPct}% Occ • {style.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Showtime Intelligence Modal */}
      {activeModalShow && (
        <ShowtimeIntelligenceModal
          show={activeModalShow}
          onClose={() => setActiveModalShow(null)}
          onNavigateToSimulator={onNavigateToSimulator}
        />
      )}
    </div>
  );
};

