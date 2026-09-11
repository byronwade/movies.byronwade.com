export type Audience = "adult" | "family" | "kids";

export type WatchOption = {
  provider: string;
  included: boolean;
};

export type MovieRatings = {
  rottenTomatoes?: number;
  audience?: number;
  imdb?: number;
  metacritic?: number;
};

export type Movie = {
  id: string;
  slug: string;
  title: string;
  year: number;
  runtimeMin: number;
  certification: string;
  genres: string[];
  themes: string[];
  tones: string[];
  moods: string[];
  director: string;
  writers: string[];
  cast: { name: string; role: string }[];
  overview: string;
  quality: number;
  popularity: number;
  atmosphere: string;
  audience: Audience;
  language: string;
  similarIds: string[];
  trailerYoutubeId?: string;
  watch: WatchOption[];
  ratings?: MovieRatings;
};
