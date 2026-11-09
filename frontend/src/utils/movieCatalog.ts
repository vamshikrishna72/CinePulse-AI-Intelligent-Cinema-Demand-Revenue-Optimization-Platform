/**
 * CinePulse AI - Movie Catalog & High-Definition Poster Imagery
 * Verified high-resolution imagery for all 14 movies in the synthetic cinema catalog.
 */

export interface MovieCatalogItem {
  id: string;
  title: string;
  genre: string;
  popularity: number;
  release_date: string;
  poster_url: string;
  backdrop_url: string;
  tagline: string;
  synopsis: string;
  director: string;
  runtime_min: number;
}

export const MOVIE_CATALOG: MovieCatalogItem[] = [
  {
    id: "M01",
    title: "Quantum Horizon",
    genre: "Sci-Fi",
    popularity: 8.8,
    release_date: "2024-06-01",
    poster_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
    tagline: "Beyond the event horizon lies mankind's final reckoning.",
    synopsis: "A team of deep-space astrophysicists discover an anomalous singularity that bends space-time across parallel dimensions.",
    director: "Marcus Vance",
    runtime_min: 148,
  },
  {
    id: "M02",
    title: "Apex Velocity",
    genre: "Action",
    popularity: 8.5,
    release_date: "2024-05-15",
    poster_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80",
    tagline: "No brakes. No rules. Only the pursuit.",
    synopsis: "An elite covert driver infiltrates an international high-speed syndicate smuggling prototype technology across European capitals.",
    director: "Elena Rodriguez",
    runtime_min: 124,
  },
  {
    id: "M03",
    title: "Shadows of Kyoto",
    genre: "Drama",
    popularity: 7.6,
    release_date: "2024-04-20",
    poster_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80",
    tagline: "Honor demands silence. Love demands everything.",
    synopsis: "An introspective multigenerational chronicle following a master artisan family grappling with rapid modernization in Kyoto.",
    director: "Kenji Takahashi",
    runtime_min: 135,
  },
  {
    id: "M04",
    title: "Laughter Therapy",
    genre: "Comedy",
    popularity: 7.2,
    release_date: "2024-05-10",
    poster_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    tagline: "The cure is worse than the diagnosis.",
    synopsis: "Two neurotic executives mistakenly enroll in an ultra-chaotic Himalayan laughter retreat run by an eccentric spiritual guide.",
    director: "Sarah Jenkins",
    runtime_min: 106,
  },
  {
    id: "M05",
    title: "The Haunted Abbey",
    genre: "Horror",
    popularity: 6.8,
    release_date: "2024-03-28",
    poster_url: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    tagline: "Some prayers are answered by the wrong gods.",
    synopsis: "Restoration architects unearth a centuries-old crypt beneath a secluded abbey, releasing a dormant ancestral terror.",
    director: "Julian Dark",
    runtime_min: 112,
  },
  {
    id: "M06",
    title: "Kingdom of Ice & Wonder",
    genre: "Animation",
    popularity: 8.9,
    release_date: "2024-05-01",
    poster_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
    tagline: "Courage is warmer than the northern winter.",
    synopsis: "An intrepid young snow-fox and a magical crystal guardian embark on a spellbinding quest across a shimmering frozen realm.",
    director: "Clara Dupont",
    runtime_min: 98,
  },
  {
    id: "M07",
    title: "Midnight Protocol",
    genre: "Thriller",
    popularity: 7.4,
    release_date: "2024-04-12",
    poster_url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    tagline: "Trust no signal. Believe no witness.",
    synopsis: "A rogue intelligence analyst uncovers an algorithmic conspiracy capable of neutralizing critical urban infrastructure overnight.",
    director: "David Thorne",
    runtime_min: 119,
  },
  {
    id: "M08",
    title: "Letters from Verona",
    genre: "Romance",
    popularity: 6.2,
    release_date: "2024-05-15",
    poster_url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&auto=format&fit=crop&q=80",
    tagline: "Written across time, spoken in glances.",
    synopsis: "A chance discovery of vintage postcards in a Venetian flea market intertwines two strangers in an enchanting romantic odyssey.",
    director: "Francesca Conti",
    runtime_min: 115,
  },
  {
    id: "M09",
    title: "Cosmic Odyssey II",
    genre: "Sci-Fi",
    popularity: 9.1,
    release_date: "2024-06-15",
    poster_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    tagline: "The voyage did not end. It evolved.",
    synopsis: "The flagship blockbuster continuation of humanity's pilgrimage across interstellar jump gates towards the mysterious Core.",
    director: "Marcus Vance",
    runtime_min: 162,
  },
  {
    id: "M10",
    title: "Undercover Rogue",
    genre: "Action",
    popularity: 8.0,
    release_date: "2024-04-05",
    poster_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
    tagline: "Disavowed. Outnumbered. Lethal.",
    synopsis: "Cut off from central command, a deep-cover operative must navigate a hostile metropolis to prevent an international crisis.",
    director: "Raymond Holt",
    runtime_min: 128,
  },
  {
    id: "M11",
    title: "The Last Symphony",
    genre: "Drama",
    popularity: 7.0,
    release_date: "2024-03-15",
    poster_url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80",
    tagline: "Every note carries the weight of a lifetime.",
    synopsis: "An aging conductor facing progressive hearing loss orchestrates his magnum opus alongside a rebellious prodigy cellist.",
    director: "Arthur Pendelton",
    runtime_min: 130,
  },
  {
    id: "M12",
    title: "Feline Adventures 3D",
    genre: "Animation",
    popularity: 7.8,
    release_date: "2024-05-25",
    poster_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&auto=format&fit=crop&q=80",
    tagline: "Paws, whimsy, and an epic neighborhood quest.",
    synopsis: "A pampered city cat inadvertently joins a crew of streetwise feline acrobats to protect a beloved rooftop sanctuary.",
    director: "Lily Zhao",
    runtime_min: 92,
  },
  {
    id: "M13",
    title: "Spectral Whispers",
    genre: "Horror",
    popularity: 6.4,
    release_date: "2024-06-05",
    poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1200&auto=format&fit=crop&q=80",
    tagline: "They speak only when you close your eyes.",
    synopsis: "A podcaster researching urban folklore moves into a restored Victorian sanatorium with terrifying acoustic echoes.",
    director: "Julian Dark",
    runtime_min: 104,
  },
  {
    id: "M14",
    title: "Neon Syndicate",
    genre: "Thriller",
    popularity: 8.3,
    release_date: "2024-06-20",
    poster_url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80",
    backdrop_url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    tagline: "The city never sleeps. The syndicate never forgets.",
    synopsis: "In a neon-drenched metropolis, an investigative journalist enters a high-stakes cat-and-mouse game with a shadow syndicate.",
    director: "Kenzo Mori",
    runtime_min: 122,
  },
];

export const GENRE_POSTERS: Record<string, string> = {
  "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
  "Action": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
  "Drama": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
  "Comedy": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
  "Horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80",
  "Animation": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
  "Romance": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80",
  "Thriller": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
};

export function getMoviePoster(title?: string, genre: string = "Action"): string {
  if (!title) return GENRE_POSTERS[genre] || GENRE_POSTERS["Action"];
  const movie = MOVIE_CATALOG.find((m) => m.title.toLowerCase() === title.toLowerCase());
  if (movie) return movie.poster_url;
  return GENRE_POSTERS[genre] || GENRE_POSTERS["Action"];
}

export function getMovieBackdrop(title?: string, genre: string = "Action"): string {
  if (!title) return GENRE_POSTERS[genre] || GENRE_POSTERS["Action"];
  const movie = MOVIE_CATALOG.find((m) => m.title.toLowerCase() === title.toLowerCase());
  if (movie) return movie.backdrop_url;
  return GENRE_POSTERS[genre] || GENRE_POSTERS["Action"];
}
