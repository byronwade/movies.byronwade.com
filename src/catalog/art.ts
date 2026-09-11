import library from "./library.json" with { type: "json" };

export type MovieArt = { poster: string; backdrop: string };

export const MOVIE_ART: Record<string, MovieArt> = {
  "annihilation": { poster: "4YRplSk6BhH6PRuE9gfyw9byUJ6.jpg", backdrop: "9trZvBr44UGedUOiGo3jgSUw13e.jpg" },
  "arrival": { poster: "pEzNVQfdzYDzVK0XqxERIw2x2se.jpg", backdrop: "8MUZz7oPXQftFTslZpRP3CVMOoq.jpg" },
  "dune-part-two": { poster: "6izwz7rsy95ARzTR3poZ8H6c5pp.jpg", backdrop: "eZ239CUp1d6OryZEBPnO2n87gMG.jpg" },
  "blade-runner-2049": { poster: "gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", backdrop: "gNdLJU9TxrpGx4dkZidjys3fyy0.jpg" },
  "ex-machina": { poster: "dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg", backdrop: "uqOuJ50EtTj7kkDIXP8LCg7G45D.jpg" },
  "prometheus": { poster: "qsYQflQhOuhDpQ0W2aOcwqgDAeI.jpg", backdrop: "qDG5SlGkWNsjSJWiGTBMFI8DpzA.jpg" },
  "alien": { poster: "vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", backdrop: "AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg" },
  "sunshine": { poster: "oKGGeJ8qvm0UmClz43VJ31fzPP7.jpg", backdrop: "5AIAnucJKZ3sHpm7r1ykFVIoUHK.jpg" },
  "the-lighthouse": { poster: "yAKNmpcUweGH6WMCEWenwU9PsbE.jpg", backdrop: "sYLzRuEcwSz0L1Z92wQNrETHU9O.jpg" },
  "the-witch": { poster: "zap5hpFCWSvdWSuPGAQyjUv2wAC.jpg", backdrop: "zi2oYYNSSv7t44iSt5YrxHX9PYs.jpg" },
  "parasite": { poster: "7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop: "hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg" },
  "there-will-be-blood": { poster: "fa0RDkAlCec0STeMNAhPaF89q6U.jpg", backdrop: "9UAKA6ceZi6TgQwTAAMt7DWwYPI.jpg" },
  "no-country-for-old-men": { poster: "6d5XOczc226jECq0LIX0siKtgHR.jpg", backdrop: "gddUsvfyySrM5k8B8wwJy2VRlBx.jpg" },
  "heat": { poster: "umSVjVdbVwtx5ryCA2QXL44Durm.jpg", backdrop: "xKsnZDERG1dk95wuZ5q9iks3OL3.jpg" },
  "drive": { poster: "602vevIURmpDfzbnv5Ubi6wIkQm.jpg", backdrop: "hoyAALgfmjMEK7O1wZ4r8wT91RP.jpg" },
  "mad-max-fury-road": { poster: "ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg", backdrop: "uT895WNwm0aIJRtGizcQhrejWUo.jpg" },
  "get-out": { poster: "tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg", backdrop: "bBQHALHRAaaORlPNXv7fNcRXYdx.jpg" },
  "her": { poster: "eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg", backdrop: "1YnZchmaGc8dchgRPDpR1KGrixA.jpg" },
  "whiplash": { poster: "7fn624j5lj3xTme2SgiLCeuedmO.jpg", backdrop: "fRGxZuo7jJUWQsVg9PREb98Aclp.jpg" },
  "interstellar": { poster: "yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", backdrop: "5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg" },
  "the-matrix": { poster: "aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg", backdrop: "lrtSb1skJayPydZk0OSMAKjBOVe.jpg" },
  "oppenheimer": { poster: "8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop: "neeNHeXjMF5fXoCJRsOmkNGC7q.jpg" },
  "everything-everywhere": { poster: "u68AjlvlutfEIcpmbYpKcdi09ut.jpg", backdrop: "ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg" },
  "spirited-away": { poster: "39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", backdrop: "dyJvKsNs2KP8qQnAXbRwDjblViy.jpg" },
  "coraline": { poster: "4jeFXQYytChdZYE9JYO7Un87IlW.jpg", backdrop: "hofnlIyF6bePkgQOpcuRWLvzf15.jpg" },
  "portrait-of-a-lady-on-fire": { poster: "rUDuOKpkKBHxx41BScqKej72iT3.jpg", backdrop: "ivJ5UzT6IzucLVfbZwCCwiJJoBz.jpg" },
  "moonlight": { poster: "qLnfEmPrDjJfPyyddLJPkXmshkp.jpg", backdrop: "jm1oD3eB08LImSwL1LrzF9AJQ5b.jpg" },
  "uncut-gems": { poster: "6XN1vxHc7kUSqNWtaQKN45J5x2v.jpg", backdrop: "eGljNfNCrPhFYG2RXXmmE0OKu5.jpg" },
  "seven-samurai": { poster: "lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg", backdrop: "qvZ91FwMq6O47VViAr8vZNQz3WI.jpg" },
  "oldboy": { poster: "pWDtjs568ZfOTMbURQBYuT4Qxka.jpg", backdrop: "sdwjQEM869JFwMytTmvr6ggvaUl.jpg" },
  "the-iron-giant": { poster: "k1Cv5CHJvqGWK1xJDUJz8DojFEy.jpg", backdrop: "ni5cXCrrGzoiIEoIwOzGiIwMZlH.jpg" },
  "howls-moving-castle": { poster: "13kOl2v0nD2OLbVSHnHk8GUFEhO.jpg", backdrop: "nv5wwZou159v5OC61i4ElR7OqyY.jpg" },
  "paddington-2": { poster: "1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg", backdrop: "kRVUMsXFzhuXjr20JcCGc6TapxA.jpg" },
  "the-incredibles": { poster: "2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg", backdrop: "lxwzY9vNwjDgxWKt3zZ6zcU6rEJ.jpg" },
  "fellowship-of-the-ring": { poster: "https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg" },
  "the-two-towers": { poster: "https://upload.wikimedia.org/wikipedia/en/a/a1/Lord_Rings_Two_Towers.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/a/a1/Lord_Rings_Two_Towers.jpg" },
  "the-return-of-the-king": { poster: "https://upload.wikimedia.org/wikipedia/en/4/48/Lord_Rings_Return_King.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/4/48/Lord_Rings_Return_King.jpg" },
  "star-wars": { poster: "https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg" },
  "the-empire-strikes-back": { poster: "https://upload.wikimedia.org/wikipedia/en/3/3f/The_Empire_Strikes_Back_%281980_film%29.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/3f/The_Empire_Strikes_Back_%281980_film%29.jpg" },
  "return-of-the-jedi": { poster: "https://upload.wikimedia.org/wikipedia/en/b/b2/ReturnOfTheJediPoster1983.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/b/b2/ReturnOfTheJediPoster1983.jpg" },
  "the-godfather": { poster: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg" },
  "the-dark-knight": { poster: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg" },
  "the-shawshank-redemption": { poster: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg" },
  "harry-potter-sorcerers-stone": { poster: "https://upload.wikimedia.org/wikipedia/en/7/7a/Harry_Potter_and_the_Philosopher%27s_Stone_banner.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/7/7a/Harry_Potter_and_the_Philosopher%27s_Stone_banner.jpg" },
  "inception": { poster: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg" },
  "jurassic-park": { poster: "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg" },
};

const FRESH_ART: Record<string, MovieArt> = {
  "a-complete-unknown": { poster: "https://upload.wikimedia.org/wikipedia/en/d/d5/A_Complete_Unknown_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/d/d5/A_Complete_Unknown_poster.jpg" },
  "a-minecraft-movie": { poster: "https://upload.wikimedia.org/wikipedia/en/6/66/A_Minecraft_Movie_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/6/66/A_Minecraft_Movie_poster.jpg" },
  "alien-romulus": { poster: "https://upload.wikimedia.org/wikipedia/en/c/cb/Alien_Romulus_2024_%28poster%29.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/c/cb/Alien_Romulus_2024_%28poster%29.jpg" },
  "anora": { poster: "https://upload.wikimedia.org/wikipedia/en/2/2b/Anora_%282024_film%29_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/2/2b/Anora_%282024_film%29_poster.jpg" },
  "avatar-fire-and-ash": { poster: "https://upload.wikimedia.org/wikipedia/en/9/95/Avatar_Fire_and_Ash_poster.jpeg", backdrop: "https://upload.wikimedia.org/wikipedia/en/9/95/Avatar_Fire_and_Ash_poster.jpeg" },
  "avengers-doomsday": { poster: "https://upload.wikimedia.org/wikipedia/en/e/ee/Avengers_Doomsday_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/e/ee/Avengers_Doomsday_poster.jpg" },
  "back-in-action": { poster: "https://upload.wikimedia.org/wikipedia/en/5/51/Back_in_Action_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/5/51/Back_in_Action_poster.jpg" },
  "challengers": { poster: "https://upload.wikimedia.org/wikipedia/en/b/b4/Challengers_2024_poster.jpeg", backdrop: "https://upload.wikimedia.org/wikipedia/en/b/b4/Challengers_2024_poster.jpeg" },
  "civil-war": { poster: "https://upload.wikimedia.org/wikipedia/en/0/0d/Civil_War_2024_film_poster.jpeg", backdrop: "https://upload.wikimedia.org/wikipedia/en/0/0d/Civil_War_2024_film_poster.jpeg" },
  "deadpool-wolverine": { poster: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
  "f1-the-movie": { poster: "https://upload.wikimedia.org/wikipedia/en/3/38/F1_%282025_film%29.png", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/38/F1_%282025_film%29.png" },
  "fantastic-four-first-steps": { poster: "https://upload.wikimedia.org/wikipedia/en/1/13/The_Fantastic_Four_First_Steps_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/1/13/The_Fantastic_Four_First_Steps_poster.jpg" },
  "fountain-of-youth": { poster: "https://upload.wikimedia.org/wikipedia/en/6/60/Fountain_of_Youth_%282025%29_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/6/60/Fountain_of_Youth_%282025%29_poster.jpg" },
  "furiosa": { poster: "https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg" },
  "havoc": { poster: "https://upload.wikimedia.org/wikipedia/en/5/54/Havoc_%282025_film%29.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/5/54/Havoc_%282025_film%29.jpg" },
  "i-saw-the-tv-glow": { poster: "https://upload.wikimedia.org/wikipedia/en/6/61/I_saw_the_tv_glow_film_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/6/61/I_saw_the_tv_glow_film_poster.jpg" },
  "inside-out-2": { poster: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
  "lilo-stitch-2025": { poster: "https://upload.wikimedia.org/wikipedia/en/5/56/Lilo_%26_Stitch_2025_Theatrical_Poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/5/56/Lilo_%26_Stitch_2025_Theatrical_Poster.jpg" },
  "longlegs": { poster: "https://upload.wikimedia.org/wikipedia/en/6/60/Longlegs_film_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/6/60/Longlegs_film_poster.jpg" },
  "mandalorian-and-grogu": { poster: "https://upload.wikimedia.org/wikipedia/en/4/4c/The_Mandalorian_and_Grogu_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/4/4c/The_Mandalorian_and_Grogu_poster.jpg" },
  "mission-impossible-final-reckoning": { poster: "https://upload.wikimedia.org/wikipedia/en/1/1f/Mission_Impossible_%E2%80%93_The_Final_Reckoning_Poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/1/1f/Mission_Impossible_%E2%80%93_The_Final_Reckoning_Poster.jpg" },
  "one-battle-after-another": { poster: "https://upload.wikimedia.org/wikipedia/en/5/5d/One_Battle_After_Another.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/5/5d/One_Battle_After_Another.jpg" },
  "project-hail-mary": { poster: "https://upload.wikimedia.org/wikipedia/en/3/3b/Project_Hail_Mary_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/3b/Project_Hail_Mary_poster.jpg" },
  "spider-man-brand-new-day": { poster: "https://upload.wikimedia.org/wikipedia/en/9/9a/Spider-Man_Brand_New_Day_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/9/9a/Spider-Man_Brand_New_Day_poster.jpg" },
  "super-mario-galaxy-movie": { poster: "https://upload.wikimedia.org/wikipedia/en/b/bf/The_Super_Mario_Galaxy_Movie_poster.jpeg", backdrop: "https://upload.wikimedia.org/wikipedia/en/b/bf/The_Super_Mario_Galaxy_Movie_poster.jpeg" },
  "superman-2025": { poster: "https://upload.wikimedia.org/wikipedia/en/3/32/Superman_%282025_film%29_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/32/Superman_%282025_film%29_poster.jpg" },
  "the-brutalist": { poster: "https://upload.wikimedia.org/wikipedia/en/7/7c/TheBrutalist2024.png", backdrop: "https://upload.wikimedia.org/wikipedia/en/7/7c/TheBrutalist2024.png" },
  "the-devil-wears-prada-2": { poster: "https://upload.wikimedia.org/wikipedia/en/9/97/The_Devil_Wears_Prada_2_%28film_poster%29.png", backdrop: "https://upload.wikimedia.org/wikipedia/en/9/97/The_Devil_Wears_Prada_2_%28film_poster%29.png" },
  "the-electric-state": { poster: "https://upload.wikimedia.org/wikipedia/en/d/d7/The_Electric_State_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/d/d7/The_Electric_State_poster.jpg" },
  "the-odyssey-2026": { poster: "https://upload.wikimedia.org/wikipedia/en/9/90/The_Odyssey_%282026_film%29_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/9/90/The_Odyssey_%282026_film%29_poster.jpg" },
  "the-substance": { poster: "https://upload.wikimedia.org/wikipedia/en/f/ff/The_Substance_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/f/ff/The_Substance_poster.jpg" },
  "the-wild-robot": { poster: "https://upload.wikimedia.org/wikipedia/en/7/70/The_Wild_Robot_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/7/70/The_Wild_Robot_poster.jpg" },
  "wake-up-dead-man": { poster: "https://upload.wikimedia.org/wikipedia/en/d/d9/WakeUpDeadMan_poster.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/d/d9/WakeUpDeadMan_poster.jpg" },
  "wicked": { poster: "https://upload.wikimedia.org/wikipedia/en/3/3c/Wicked_%282024_film%29_poster.png", backdrop: "https://upload.wikimedia.org/wikipedia/en/3/3c/Wicked_%282024_film%29_poster.png" },
  "zootopia-2": { poster: "https://upload.wikimedia.org/wikipedia/en/6/6a/Zootopia_2_%282025_film%29.jpg", backdrop: "https://upload.wikimedia.org/wikipedia/en/6/6a/Zootopia_2_%282025_film%29.jpg" },
};

for (const row of library as { id: string; poster?: string; backdrop?: string }[]) {
  if (!MOVIE_ART[row.id] && row.poster) {
    MOVIE_ART[row.id] = { poster: row.poster, backdrop: row.backdrop || row.poster };
  }
}
for (const [id, art] of Object.entries(FRESH_ART)) {
  if (!MOVIE_ART[id]) MOVIE_ART[id] = art;
}

const CDN = "https://image.tmdb.org/t/p";

export type ArtSize = "w185" | "w342" | "w500" | "w780" | "w1280" | "original";

const PX: Record<ArtSize, number> = {
  w185: 185,
  w342: 342,
  w500: 500,
  w780: 780,
  w1280: 1280,
  original: 1600,
};

function wikiSized(url: string, width: number) {
  try {
    const u = new URL(url);
    u.protocol = "https:";
    if (u.pathname.includes("Special:FilePath/")) {
      u.searchParams.set("width", String(width));
      return u.toString();
    }
    if (!/wikimedia\.org|wikipedia\.org/.test(u.hostname)) return url;
    const path = u.pathname;
    const thumb = path.match(/\/wikipedia\/([^/]+)\/thumb\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)\/\d+px-/i);
    const direct = path.match(/\/wikipedia\/([^/]+)\/(?:thumb\/)?([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/i);
    const hit = thumb || direct;
    if (!hit) {
      u.searchParams.set("width", String(width));
      return u.toString();
    }
    const file = decodeURIComponent(hit[4]!.replace(/^\d+px-/, ""));
    return `https://upload.wikimedia.org/wikipedia/${hit[1]}/thumb/${hit[2]}/${hit[3]}/${encodeURIComponent(file)}/${width}px-${encodeURIComponent(file)}`;
  } catch {
    return url;
  }
}

export function artUrl(id: string, kind: keyof MovieArt, size: ArtSize = "w780") {
  const file = MOVIE_ART[id]?.[kind];
  if (!file) return undefined;
  if (/^https?:\/\//.test(file)) return wikiSized(file, PX[size]);
  return `${CDN}/${size}/${file}`;
}

export function artSet(id: string, kind: keyof MovieArt, role: "poster" | "hero" | "cover" | "key" = kind === "poster" ? "poster" : "cover"): { src?: string; srcSet?: string } {
  const file = MOVIE_ART[id]?.[kind];
  if (!file) return {};
  if (/^https?:\/\//.test(file)) {
    if (role === "poster") {
      return {
        src: wikiSized(file, 342),
        srcSet: `${wikiSized(file, 185)} 185w, ${wikiSized(file, 342)} 342w, ${wikiSized(file, 500)} 500w`,
      };
    }
    const src = wikiSized(file, role === "key" ? 780 : 960);
    return {
      src,
      srcSet: `${wikiSized(file, 640)} 640w, ${wikiSized(file, 960)} 960w, ${wikiSized(file, 1280)} 1280w`,
    };
  }
  if (role === "poster") {
    return {
      src: `${CDN}/w342/${file}`,
      srcSet: `${CDN}/w185/${file} 185w, ${CDN}/w342/${file} 342w, ${CDN}/w500/${file} 500w`,
    };
  }
  return {
    src: `${CDN}/w780/${file}`,
    srcSet: `${CDN}/w780/${file} 780w, ${CDN}/w1280/${file} 1280w`,
  };
}

export function artFallbacks(id: string, kind: keyof MovieArt, role: "poster" | "hero" | "cover" | "key" = "poster") {
  const file = MOVIE_ART[id]?.[kind];
  if (!file) return [] as string[];
  if (/^https?:\/\//.test(file)) {
    const orig = file.replace(/^http:\/\//, "https://");
    const sized = wikiSized(orig, role === "poster" ? 342 : 780);
    return sized === orig ? [orig] : [sized, orig];
  }
  if (role === "poster") return [`${CDN}/w342/${file}`, `${CDN}/w185/${file}`];
  return [`${CDN}/w780/${file}`, `${CDN}/w500/${file}`];
}

export function prefetchArt(id: string) {
  if (typeof window === "undefined") return;
  for (const kind of ["poster", "backdrop"] as const) {
    const src = artSet(id, kind, kind === "poster" ? "poster" : "hero").src;
    if (!src) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }
}

