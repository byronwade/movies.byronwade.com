import { useKino } from "@/lib/store";
import { NativeSheet } from "@/components/chrome/sheet";
import { StillImage } from "@/components/movie/still";
import { MOVIE_BY_ID } from "@/catalog/movies";

export function HouseholdAsk() {
  const ask = useKino((s) => s.pendingAsks[0]);
  const profiles = useKino((s) => s.profiles);
  const answer = useKino((s) => s.answerAsk);
  if (!ask) return null;
  const movie = MOVIE_BY_ID[ask.movieId];
  return (
    <NativeSheet open onClose={() => answer(ask.movieId, "skip")} label={`Who watched ${ask.title}?`}>
      <p className="type-caption uppercase tracking-wide text-marker">Household</p>
      <h2 className="mt-1 type-section">Who watched {ask.title}?</h2>
      <p className="mt-2 type-content text-body">
        Shared receipts mix kids’ films with your taste. Tell us who this belongs to. Not sure puts it on you.
      </p>
      {movie ? (
        <StillImage
          slug={movie.slug}
          atmosphere={movie.atmosphere}
          title={movie.title}
          className="mt-4 aspect-poster w-24 rounded-lg"
        />
      ) : null}
      <div className="mt-5 space-y-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            className="press well flex h-12 w-full items-center px-4 type-content"
            onClick={() => answer(ask.movieId, p.id)}
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          className="press well flex h-12 w-full items-center px-4 type-content"
          onClick={() => answer(ask.movieId, "everyone")}
        >
          Everyone
        </button>
        <button type="button" className="flex h-11 w-full items-center justify-center type-chrome text-body" onClick={() => answer(ask.movieId, "skip")}>
          Not sure
        </button>
      </div>
    </NativeSheet>
  );
}
