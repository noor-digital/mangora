export const GENRES = [
  { id: 'action', label: 'Action', tagline: 'Blades drawn, seconds counted.' },
  { id: 'adventure', label: 'Adventure', tagline: 'Every map ends somewhere unexpected.' },
  { id: 'fantasy', label: 'Fantasy', tagline: 'Crowns, curses and impossible weather.' },
  { id: 'romance', label: 'Romance', tagline: 'Slow glances, loud silences.' },
  { id: 'drama', label: 'Drama', tagline: 'Ordinary lives under extraordinary pressure.' },
  { id: 'comedy', label: 'Comedy', tagline: 'Chaos, perfectly timed.' },
  { id: 'mystery', label: 'Mystery', tagline: 'Someone is lying. Everyone, maybe.' },
  { id: 'horror', label: 'Horror', tagline: 'Keep the lights on.' },
  { id: 'sci-fi', label: 'Sci-Fi', tagline: 'Futures worth arguing about.' },
  { id: 'sports', label: 'Sports', tagline: 'One more match. One more season.' },
];

export const genreById = Object.fromEntries(GENRES.map((g) => [g.id, g]));
