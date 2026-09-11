import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { grokPlain, grokSlugGuess, isJunkFile, isUsableStill, isYoutubeId, mergeClips, unique, wikiCandidates, wikiFileUrl, youtubeIdsIn } from "./movie-extras.ts";

describe("movie extras", () => {
  it("keeps the catalog trailer first and dedupes extras", () => {
    const clips = mergeClips("abcdefghijk", ["abcdefghijk", "lmnopqrstuv", "lmnopqrstuv", "wxyzABCDEFG"]);
    assert.deepEqual(
      clips.map((c) => c.key),
      ["abcdefghijk", "lmnopqrstuv", "wxyzABCDEFG"],
    );
    assert.equal(clips[0]!.label, "Trailer");
    assert.equal(clips[1]!.label, "Teaser");
  });

  it("falls back to catalog only when wiki is empty", () => {
    const clips = mergeClips("abcdefghijk", []);
    assert.equal(clips.length, 1);
    assert.equal(clips[0]!.key, "abcdefghijk");
  });

  it("drops invalid youtube ids", () => {
    assert.equal(mergeClips("nope", ["also-bad"]).length, 0);
  });

  it("skips wiki chrome files", () => {
    assert.equal(isJunkFile("File:Commons-logo.svg"), true);
    assert.equal(isJunkFile("File:Sinners (2025 film) poster.jpg"), false);
  });

  it("builds a wikipedia file path", () => {
    assert.match(wikiFileUrl("File:Sinners_(2025_film)_poster.jpg"), /en\.wikipedia\.org\/wiki\/Special:FilePath/);
  });

  it("tries year-qualified wiki titles first", () => {
    const names = wikiCandidates("Sinners", 2025);
    assert.equal(names[0], "Sinners (2025 film)");
  });

  it("rejects tiny wiki thumbs and maxres placeholders", () => {
    assert.equal(isUsableStill("https://thumb.wikimedia.org/wikipedia/en/thumb/a/ab/Foo.jpg/120px-Foo.jpg"), false);
    assert.equal(isUsableStill("https://i.ytimg.com/vi/abc/maxresdefault.jpg"), false);
    assert.equal(isUsableStill("https://upload.wikimedia.org/wikipedia/en/5/5f/Sinners.jpg"), true);
    assert.equal(isYoutubeId("bKGxHflevuk"), true);
    assert.equal(isYoutubeId("nope"), false);
  });

  it("guesses grokipedia slugs and strips markdown", () => {
    assert.equal(grokSlugGuess("Sinners", 2025)[0], "sinners_2025_film");
    assert.equal(
      grokPlain("# Sinners (2025 film)\n\n*Sinners* is a film.[](https://www.youtube.com/watch?v=bKGxHflevuk)\n\n## Cast\nMore"),
      "Sinners is a film.",
    );
    assert.deepEqual(youtubeIdsIn("see https://www.youtube.com/watch?v=bKGxHflevuk and again v=bKGxHflevuk"), ["bKGxHflevuk"]);
  });
});
