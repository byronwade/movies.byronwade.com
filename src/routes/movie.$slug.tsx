import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { BackButton } from "@/components/chrome/back";
import { MovieActions } from "@/components/movie/actions";
import { MovieAbout } from "@/components/movie/about";
import { getMovieBySlug } from "@/catalog/movies";
import { useKino } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/movie/$slug")({ component: MoviePage });

function MoviePage() {
  const { slug } = Route.useParams();
  const movie = getMovieBySlug(slug);
  const rec = useKino((s) => (movie ? s.ranks[movie.id] : undefined));
  const record = useKino((s) => s.record);

  useEffect(() => {
    if (movie) record("details_opened", movie.id, { source: "page" });
  }, [movie, record]);

  if (!movie) {
    return (
      <AppShell>
        <Workbench title="movies">
          <p className="type-page">Not in the catalog</p>
          <Link to="/" className="mt-5 block">
            <Button className="w-full">For you</Button>
          </Link>
        </Workbench>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <Workbench>
        <div className="-mx-1 mb-4">
          <BackButton />
        </div>
        <MovieAbout movie={movie} rec={rec} />
        <MovieActions movie={movie} className="mt-6" />
      </Workbench>
    </AppShell>
  );
}