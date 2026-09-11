import type { MovieRatings } from "@/catalog/types";
import { cn } from "@/lib/cn";

function Tomato({ rotten }: { rotten?: boolean }) {
  if (rotten) {
    return (
      <svg viewBox="0 0 24 24" className="score-icon" aria-hidden>
        <path fill="#1A9B3C" d="M12 2.4c.2 2.2-1 4-2.8 5 1.6.1 3 .2 3.8-.2.3 1.6-.6 3.1-1.8 3.6 1.8-.1 3.5-1.4 4.2-3.1.5 1.8 0 3.6-1.4 4.7 2-.5 3.5-2.3 3.8-4.4.8 2.3 0 4.9-2.1 6.3" />
        <circle cx="12" cy="15.2" r="6.6" fill="#FA320A" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="score-icon" aria-hidden>
      <path
        fill="#16C75A"
        d="M7.2 5.4c2.4 1 3.4 2.8 3.4 2.8S9.8 6.6 7.4 7.2C5.2 7.8 4 9.8 4.4 12c.3 1.8 1.7 3 3.4 3.2-2 .8-3.3 2.6-3 4.6.3 2.2 2.3 3.8 4.6 3.6 1.4-.1 2.5-.8 3.2-1.8.6 1.1 1.8 1.9 3.3 2 2.4.2 4.5-1.6 4.7-4 .2-2.1-1.1-3.9-3-4.6 1.8-.4 3.1-1.8 3.3-3.6.3-2.4-1.3-4.5-3.6-4.8-1.8-.2-3.3.6-4.1 2 0 0 .2-2.2-1.2-4.2C11.4 2.6 9.6 2.8 7.2 5.4Z"
      />
    </svg>
  );
}

function Popcorn({ spilled }: { spilled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="score-icon" aria-hidden>
      <path fill={spilled ? "#C4A35A" : "#F5C518"} d="M7.2 10.2h9.6l-1.2 11H8.4L7.2 10.2Z" />
      <path fill="#1A1A1A" d="M8.4 12h1.2l.8 9.2H8.8L8.4 12Zm3 0h1.2v9.2h-1.2V12Zm3 0h1.2l-.4 9.2h-1.6L14.4 12Z" opacity=".2" />
      <circle cx="9" cy="8.2" r="2.1" fill={spilled ? "#D8D0C0" : "#FFF6E0"} />
      <circle cx="12.2" cy="7.2" r="2.4" fill={spilled ? "#D8D0C0" : "#FFF6E0"} />
      <circle cx="15.4" cy="8.4" r="2.1" fill={spilled ? "#D8D0C0" : "#FFF6E0"} />
    </svg>
  );
}

function ImdbMark() {
  return <span className="imdb-badge">IMDb</span>;
}

function MetaMark({ score }: { score: number }) {
  const fill = score >= 61 ? "#66CC33" : score >= 40 ? "#FFCC33" : "#FF0000";
  const ink = score >= 40 && score < 61 ? "#0A0A0A" : "#fff";
  return (
    <svg viewBox="0 0 24 24" className="score-icon" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" fill={fill} />
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink} fontFamily="ui-sans-serif, system-ui">
        {Math.round(score)}
      </text>
    </svg>
  );
}

export function RatingsRow({
  ratings,
  wide,
  className,
}: {
  ratings?: MovieRatings;
  wide?: boolean;
  className?: string;
}) {
  if (!ratings) return null;
  const rt = ratings.rottenTomatoes;
  const aud = ratings.audience;
  const imdb = ratings.imdb;
  const meta = ratings.metacritic;
  if (rt == null && aud == null && imdb == null && meta == null) return null;
  return (
    <ul className={cn("score-row", className)}>
      {rt != null ? (
        <li>
          <Tomato rotten={rt < 60} />
          <span>{Math.round(rt)}%</span>
        </li>
      ) : null}
      {aud != null ? (
        <li>
          <Popcorn spilled={aud < 60} />
          <span>{Math.round(aud)}%</span>
        </li>
      ) : null}
      {imdb != null ? (
        <li>
          <ImdbMark />
          <span>{imdb.toFixed(1)}</span>
        </li>
      ) : null}
      {wide && meta != null ? (
        <li>
          <MetaMark score={meta} />
          <span>Metascore</span>
        </li>
      ) : meta != null ? (
        <li>
          <MetaMark score={meta} />
        </li>
      ) : null}
    </ul>
  );
}
