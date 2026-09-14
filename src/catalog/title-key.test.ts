import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filmKey, sameFilm, titleKey } from "./title-key.ts";
import { MOVIES } from "./movies.ts";
import { composeQueue, uniqueQueue } from "../tasterank/pipeline.ts";
import type { RankedRecommendation } from "../tasterank/types.ts";

describe("title keys", () => {
  it("treats The Core and core as the same title", () => {
    assert.equal(titleKey("The Core"), "core");
    assert.equal(filmKey("Ex Machina", 2014), filmKey("ex-machina", 2014));
    assert.equal(
      sameFilm(
        { title: "Ex Machina", year: 2014, director: "Alex Garland" },
        { title: "Ex Machina", year: 2015, director: "Alex Garland" },
      ),
      true,
    );
    assert.equal(
      sameFilm(
        { title: "How to Train Your Dragon", year: 2010, director: "Dean DeBlois" },
        { title: "How to Train Your Dragon", year: 2025, director: "Dean DeBlois" },
      ),
      false,
    );
  });

  it("catalog never keeps the same film twice", () => {
    for (let i = 0; i < MOVIES.length; i++) {
      for (let j = i + 1; j < Math.min(i + 1 + 12, MOVIES.length); j++) {
        /* cheap neighbor check; full pair scan below on keys */
      }
    }
    const seen = new Set<string>();
    for (const movie of MOVIES) {
      const key = filmKey(movie.title, movie.year);
      assert.equal(seen.has(key), false, key);
      seen.add(key);
    }
    for (let i = 0; i < MOVIES.length; i++) {
      const a = MOVIES[i]!;
      for (let j = i + 1; j < MOVIES.length; j++) {
        const b = MOVIES[j]!;
        if (titleKey(a.title) !== titleKey(b.title)) continue;
        assert.equal(sameFilm(a, b), false, `${a.id} vs ${b.id}`);
      }
    }
  });

  it("queue keeps remakes from different years", () => {
    const rec = (id: string, title: string, year: number): RankedRecommendation => ({
      movie: { id, slug: id, title, year, director: "x" } as RankedRecommendation["movie"],
      rank: 1,
      score: 1,
      tasteRank: 80,
      matchLabel: "For you",
      statement: "",
      reasons: [],
    });
    const queue = composeQueue([rec("superman-2025", "Superman", 2025)], [rec("superman-1978", "Superman", 1978), rec("dune", "Dune", 2021)], new Set());
    assert.deepEqual(queue.map((r) => r.movie.id), ["superman-2025", "superman-1978", "dune"]);
    assert.equal(uniqueQueue([rec("a", "Iron Man", 2008), rec("b", "Iron Man", 1931)]).length, 2);
    assert.equal(uniqueQueue([rec("a", "Dune", 2021), rec("a2", "Dune", 2021)]).length, 1);
  });
});
