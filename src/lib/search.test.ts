import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { searchMovies } from "./search.ts";
import { MOVIES } from "../catalog/movies.ts";
import { watchLine } from "../components/movie/labels.ts";
import { MOVIE_BY_ID } from "../catalog/movies.ts";

describe("search", () => {
  it("finds Lord of the Rings from lotr", () => {
    const hits = searchMovies(MOVIES, "lotr", 20).map((m) => m.id);
    assert.ok(hits.some((id) => id.includes("fellowship") || id.includes("return-of-the-king") || id.includes("two-towers") || id.includes("lord")));
  });

  it("finds Nolan films by director", () => {
    const hits = searchMovies(MOVIES, "Nolan", 20).map((m) => m.director);
    assert.ok(hits.some((d) => /nolan/i.test(d)));
  });
});

describe("watch line", () => {
  it("prefers services the user already has", () => {
    const sinners = MOVIE_BY_ID.sinners;
    assert.ok(sinners);
    const line = watchLine(sinners, ["Max"]);
    assert.equal(line.startsWith("On "), true);
    assert.ok(line.includes("Max"));
  });

  it("says Rent when nothing is included", () => {
    const movie = {
      watch: [{ provider: "Rent", included: false }],
    } as Parameters<typeof watchLine>[0];
    assert.equal(watchLine(movie), "Rent");
  });
});
