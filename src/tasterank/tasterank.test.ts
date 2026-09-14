import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rebuildTaste, signalCount } from "./taste.ts";
import { projectMovieState, rank, rankShelf } from "./pipeline.ts";
import { tasteGraph } from "./graph.ts";
import { consensus } from "../catalog/ratings.ts";
import { MOVIE_BY_ID } from "../catalog/movies.ts";
import type { PreferenceEvent } from "./types.ts";

function ev(partial: Partial<PreferenceEvent> & Pick<PreferenceEvent, "entityId" | "action">): PreferenceEvent {
  return {
    id: partial.id ?? `${partial.entityId}:${partial.action}:${partial.profileId ?? "you"}`,
    userId: partial.userId ?? "guest",
    profileId: partial.profileId ?? "you",
    entityType: "movie",
    entityId: partial.entityId,
    action: partial.action,
    source: partial.source ?? "test",
    sessionId: partial.sessionId ?? "s",
    occurredAt: partial.occurredAt ?? "2026-01-01T00:00:00.000Z",
    strength: partial.strength,
    reversesId: partial.reversesId,
  };
}

describe("rank", () => {
  it("does not let kids imports train You", () => {
    const events = [
      ev({ entityId: "annihilation", action: "import_seen", profileId: "you" }),
      ev({ entityId: "coraline", action: "import_seen", profileId: "pending" }),
      ev({ entityId: "spirited-away", action: "import_seen", profileId: "kids" }),
    ];
    const yours = events.filter((e) => e.profileId === "you" || e.profileId === "everyone");
    const taste = rebuildTaste(yours);
    assert.equal(Boolean(taste.affinities["theme:cosmic horror"] || taste.affinities["genre:science fiction"]), true);
    assert.equal(taste.affinities["theme:coming of age"] ?? 0, 0);
    const kids = events.filter((e) => e.profileId === "kids" || e.profileId === "everyone");
    const kidsTaste = rebuildTaste(kids);
    assert.ok((kidsTaste.affinities["genre:animation"] ?? 0) > 0);
  });

  it("not_interested never returns in the served queue", () => {
    const events = [ev({ entityId: "annihilation", action: "not_interested", profileId: "you" })];
    const movieState = projectMovieState(events);
    const recs = rank({
      taste: rebuildTaste([]),
      movieState,
      events,
      limit: 40,
    }).recommendations;
    assert.equal(recs.some((r) => r.movie.id === "annihilation"), false);
    assert.equal(movieState.annihilation?.neverShowAgain, true);
  });

  it("kids profile downranks adult titles", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 8,
      session: { profileKind: "kids" },
    }).recommendations;
    assert.ok(recs[0]);
    assert.equal(recs.every((r) => r.movie.audience !== "adult"), true);
    assert.notEqual(recs[0]!.movie.audience, "adult");
  });

  it("englishOnly keeps non-English films out of the served queue", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 40,
      session: { englishOnly: true },
    }).recommendations;
    assert.equal(recs.length > 0, true);
    assert.equal(recs.every((r) => r.movie.language === "en"), true);
    assert.equal(recs.some((r) => r.movie.id === "parasite"), false);
    assert.equal(recs.some((r) => r.movie.id === "spirited-away"), false);
  });

  it("era last 5 years keeps recent films only", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 24,
      session: { englishOnly: true, era: "5" },
    }).recommendations;
    const year = new Date().getFullYear();
    assert.ok(recs.length > 0);
    assert.equal(recs.every((r) => r.movie.year >= year - 5), true);
  });

  it("tonight family and comedy keeps family comedies", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 12,
      session: { englishOnly: true, tonight: true, who: "Family", mood: "Funny", genre: "Comedy" },
    }).recommendations;
    assert.ok(recs.length > 0);
    assert.equal(recs.every((r) => r.movie.audience === "kids" || r.movie.audience === "family"), true);
    assert.equal(recs.every((r) => r.movie.genres.includes("Comedy")), true);
    assert.equal(recs.every((r) => r.movie.certification !== "R"), true);
  });

  it("favorite is parked out of For you and trains taste", () => {
    const events = [ev({ entityId: "annihilation", action: "favorite", profileId: "you" })];
    const movieState = projectMovieState(events);
    assert.equal(movieState.annihilation?.favorited, true);
    const recs = rank({
      taste: rebuildTaste(events),
      movieState,
      events,
      limit: 40,
    }).recommendations;
    assert.equal(recs.some((r) => r.movie.id === "annihilation"), false);
    assert.ok((rebuildTaste(events).affinities["genre:science fiction"] ?? 0) > 0);
  });

  it("interested stays in For you and lifts the score", () => {
    const events = [ev({ entityId: "arrival", action: "interested", profileId: "you" })];
    const movieState = projectMovieState(events);
    assert.equal(movieState.arrival?.interested, true);
    const recs = rank({
      taste: rebuildTaste(events),
      movieState,
      events,
      limit: 40,
    }).recommendations;
    const arrival = recs.find((r) => r.movie.id === "arrival");
    assert.ok(arrival);
    const cold = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 40,
    }).recommendations.find((r) => r.movie.id === "arrival");
    if (cold && arrival) assert.ok(arrival.score > cold.score);
  });

  it("interested still ranks after a recent skip", () => {
    const now = new Date();
    const events = [
      ev({ entityId: "arrival", action: "interested" }),
      ev({ entityId: "arrival", action: "skip", occurredAt: now.toISOString() }),
    ];
    const movieState = projectMovieState(events);
    const recs = rank({
      taste: rebuildTaste(events),
      movieState,
      events,
      now,
      limit: 40,
    }).recommendations;
    assert.ok(recs.find((r) => r.movie.id === "arrival"));
  });

  it("show_again clears not interested", () => {
    const events = [
      ev({ entityId: "annihilation", action: "not_interested", profileId: "you" }),
      ev({ entityId: "annihilation", action: "show_again", profileId: "you", occurredAt: "2026-01-02T00:00:00.000Z" }),
    ];
    const movieState = projectMovieState(events);
    assert.equal(movieState.annihilation?.notInterested, false);
    assert.equal(movieState.annihilation?.neverShowAgain, false);
  });

  it("neighbors of a favorite rise in the queue", () => {
    const events = [ev({ entityId: "annihilation", action: "favorite", profileId: "you" })];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      limit: 12,
    }).recommendations;
    const ids = recs.map((r) => r.movie.id);
    assert.ok(ids.includes("arrival") || ids.includes("ex-machina") || ids.includes("prometheus"));
    const arrival = recs.find((r) => r.movie.id === "arrival");
    const paddington = recs.find((r) => r.movie.id === "paddington-2");
    if (arrival && paddington) assert.ok(arrival.score > paddington.score);
  });

  it("writes specific reasons from overlapping taste", () => {
    const events = [ev({ entityId: "annihilation", action: "love", profileId: "you" })];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      catalog: true,
      limit: 40,
    }).recommendations;
    const arrival = recs.find((r) => r.movie.id === "arrival");
    assert.ok(arrival);
    assert.ok(arrival!.reasons.some((r) => /science|horror|garland|villeneuve|grief|neighbor|annihilation/i.test(r.label)));
    assert.notEqual(arrival!.statement, "Matches how you watch");
  });

  it("uses critic scores in consensus", () => {
    const parasite = MOVIE_BY_ID.parasite;
    assert.ok(parasite?.ratings?.rottenTomatoes);
    assert.ok(parasite!.ratings!.rottenTomatoes! >= 90);
    assert.ok(consensus(parasite!) > 0.85);
  });

  it("genre toggle on For you is a hard filter", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 16,
      session: { englishOnly: true, genre: "Horror" },
    }).recommendations;
    assert.ok(recs.length > 0);
    assert.equal(recs.every((r) => r.movie.genres.includes("Horror")), true);
  });

  it("explore mode labels Fine tune and stays diverse", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 16,
      session: { englishOnly: true, explore: true },
    }).recommendations;
    assert.ok(recs.length > 8);
    assert.equal(recs[0]!.matchLabel, "Fine tune");
    const genres = new Set(recs.flatMap((r) => r.movie.genres));
    assert.ok(genres.size >= 4);
  });

  it("fine tune is not the same order as for you after taste", () => {
    const events = [
      ev({ entityId: "annihilation", action: "favorite" }),
      ev({ entityId: "arrival", action: "favorite" }),
      ev({ entityId: "ex-machina", action: "seen" }),
    ];
    const movieState = projectMovieState(events);
    const taste = rebuildTaste(events);
    const forYou = rank({ taste, movieState, events, limit: 12, session: { englishOnly: true } }).recommendations.map((r) => r.movie.id);
    const tune = rank({ taste, movieState, events, limit: 12, session: { englishOnly: true, explore: true } }).recommendations.map((r) => r.movie.id);
    assert.notEqual(forYou.join(","), tune.join(","));
    assert.notEqual(forYou[0], tune[0]);
  });

  it("counts unique marks toward the train goal", () => {
    const events = [
      ev({ entityId: "annihilation", action: "favorite" }),
      ev({ entityId: "arrival", action: "skip" }),
      ev({ entityId: "annihilation", action: "seen" }),
    ];
    assert.equal(signalCount(events), 2);
  });

  it("netflix sitting is a hard filter", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      limit: 12,
      session: { englishOnly: true, service: "Netflix" },
    }).recommendations;
    assert.ok(recs.length >= 3);
    assert.ok(recs.every((r) => r.movie.watch.some((w) => w.included && w.provider === "Netflix")));
  });

  it("new sitting keeps 2025 and 2026 in the first ten", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      now: new Date("2026-09-10"),
      limit: 10,
      session: { englishOnly: true, fresh: true },
    }).recommendations;
    assert.ok(recs.length >= 6);
    assert.ok(recs.every((r) => r.movie.year >= 2025));
  });

  it("first ten mix genres so a watchable pick is in reach", () => {
    const recs = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      now: new Date("2026-09-10"),
      limit: 10,
      session: { englishOnly: true },
    }).recommendations;
    const genres = new Set(recs.map((r) => r.movie.genres[0]));
    assert.ok(genres.size >= 3);
    assert.ok(recs.some((r) => r.movie.year >= 2024));
  });

  it("favorites pull neighbors into the first ten", () => {
    const events = [
      ev({ entityId: "annihilation", action: "favorite" }),
      ev({ entityId: "arrival", action: "favorite" }),
      ev({ entityId: "ex-machina", action: "seen" }),
    ];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      limit: 10,
      session: { englishOnly: true },
    }).recommendations;
    assert.equal(recs.length, 10);
    assert.ok(recs.filter((r) => r.movie.genres.includes("Science Fiction")).length >= 2);
  });

  it("not interested cools similar titles", () => {
    const events = [ev({ entityId: "annihilation", action: "not_interested" })];
    const movieState = projectMovieState(events);
    const banned = MOVIE_BY_ID["annihilation"]!.similarIds[0];
    if (!banned) return;
    const cooled = rank({
      taste: rebuildTaste(events),
      movieState,
      events,
      catalog: true,
      limit: 80,
    }).recommendations.find((r) => r.movie.id === banned);
    const fresh = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      catalog: true,
      limit: 80,
    }).recommendations.find((r) => r.movie.id === banned);
    if (cooled && fresh) assert.ok(cooled.score < fresh.score);
  });

  it("interested stays in For you but is not first", () => {
    const events = [ev({ entityId: "arrival", action: "interested" })];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      limit: 24,
      session: { englishOnly: true },
    }).recommendations;
    assert.ok(recs.find((r) => r.movie.id === "arrival"));
    assert.notEqual(recs[0]?.movie.id, "arrival");
    assert.ok(recs.findIndex((r) => r.movie.id === "arrival") >= 3);
  });

  it("fine tune skips interested titles", () => {
    const events = [ev({ entityId: "arrival", action: "interested" })];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      limit: 16,
      session: { englishOnly: true, explore: true },
    }).recommendations;
    assert.equal(recs.some((r) => r.movie.id === "arrival"), false);
    assert.notEqual(recs[0]?.movie.id, "arrival");
  });

  it("not interested on a film hides sequels and prequels", () => {
    const events = [ev({ entityId: "fellowship-of-the-ring", action: "not_interested" })];
    const recs = rank({
      taste: rebuildTaste(events),
      movieState: projectMovieState(events),
      events,
      limit: 40,
      session: { englishOnly: true },
    }).recommendations;
    const ids = recs.map((r) => r.movie.id);
    assert.equal(ids.includes("fellowship-of-the-ring"), false);
    assert.equal(ids.includes("the-two-towers"), false);
    assert.equal(ids.includes("the-return-of-the-king"), false);
  });

  it("owned receipts stay in For you", () => {
    const events = [ev({ entityId: "arrival", action: "import_watchlist" })];
    const movieState = projectMovieState(events);
    assert.equal(movieState.arrival?.owned, true);
    const recs = rank({
      taste: rebuildTaste(events),
      movieState,
      events,
      limit: 24,
      session: { englishOnly: true },
    }).recommendations;
    assert.ok(recs.some((r) => r.movie.id === "arrival"));
  });

  it("late night sitting prefers films that fit before bed", () => {
    const late = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      now: new Date("2026-09-10T22:50:00"),
      limit: 10,
      session: { englishOnly: true, minutesLeft: 100 },
    }).recommendations;
    const open = rank({
      taste: rebuildTaste([]),
      movieState: {},
      events: [],
      now: new Date("2026-09-10T19:00:00"),
      limit: 10,
      session: { englishOnly: true },
    }).recommendations;
    assert.ok(late.length > 0);
    const avg = (recs: typeof late) => recs.slice(0, 6).reduce((s, r) => s + r.movie.runtimeMin, 0) / Math.min(6, recs.length);
    assert.ok(avg(late) <= avg(open) + 5);
    assert.ok(late.filter((r) => r.movie.runtimeMin <= 115).length >= 4);
  });
});

describe("taste graph", () => {
  it("clusters dark sci-fi from Annihilation-like watches", () => {
    const taste = rebuildTaste([ev({ entityId: "annihilation", action: "love", profileId: "you" })]);
    const graph = tasteGraph(taste);
    assert.ok(graph.length > 0);
    assert.match(graph[0]!.name, /sci-fi|Science|Horror/i);
    assert.ok(graph.some((n) => n.key === "themes" || n.key === "genres"));
    assert.ok((graph.find((n) => n.key === "signature")?.children?.length ?? 0) >= 2);
  });
});

describe("rankShelf", () => {
  it("orders saved films by watch likelihood", () => {
    const a = MOVIE_BY_ID.annihilation!;
    const b = MOVIE_BY_ID["paddington-2"]!;
    const taste = rebuildTaste([ev({ entityId: "annihilation", action: "love" })]);
    const movieState = {
      annihilation: {
        movieId: "annihilation",
        saved: true,
        seen: false,
        favorited: false,
        interested: false,
        notInterested: false,
        neverShowAgain: false,
        skipCount: 0,
        impressionCount: 0,
      },
      "paddington-2": {
        movieId: "paddington-2",
        saved: true,
        seen: false,
        favorited: false,
        interested: false,
        notInterested: false,
        neverShowAgain: false,
        skipCount: 0,
        impressionCount: 0,
      },
    };
    const ordered = rankShelf([b, a], { taste, movieState });
    assert.equal(ordered[0]?.id, "annihilation");
  });
});