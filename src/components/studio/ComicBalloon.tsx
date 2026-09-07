import { cn } from "@/lib/utils";
import type { Balloon, Panel } from "@/lib/comic/types";

function speakerXFor(panel: Panel, balloon: Balloon): number | undefined {
  if (!panel.cast.length) return undefined;
  let best = panel.cast[0];
  let bestD = Math.abs(best.x - balloon.x);
  for (const c of panel.cast) {
    const d = Math.abs(c.x - balloon.x);
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best.x;
}

function wobble(id: string) {
  let n = 0;
  for (const ch of id) n = (n + ch.charCodeAt(0)) % 7;
  return n - 3;
}

export function ComicBalloon({
  balloon,
  panel,
  dive = false,
  selected = false,
  onPointerDown,
}: {
  balloon: Balloon;
  panel: Panel;
  dive?: boolean;
  selected?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const text = balloon.text.trim();
  if (!text && balloon.kind !== "sfx") return null;
  const speakerX = speakerXFor(panel, balloon);
  const tailPct =
    speakerX == null ? 34 : Math.min(76, Math.max(20, 50 + (speakerX - balloon.x) * 0.85));
  const live = Boolean(onPointerDown);

  if (balloon.kind === "sfx") {
    return (
      <span
        onPointerDown={onPointerDown}
        style={{
          left: `${balloon.x}%`,
          top: `${balloon.y}%`,
          transform: `translate(-50%, -50%) rotate(${wobble(balloon.id) * 1.4}deg)`,
        }}
        className={cn(
          "pointer-events-none absolute z-20 max-w-[80%] font-display leading-none text-tension",
          dive ? "text-4xl sm:text-5xl" : "text-lg sm:text-xl",
          live && "pointer-events-auto cursor-grab touch-none active:cursor-grabbing",
          selected && "outline outline-2 outline-cyan",
        )}
      >
        {text || "POW"}
      </span>
    );
  }

  if (balloon.kind === "caption") {
    return (
      <span
        onPointerDown={onPointerDown}
        style={{
          left: `${balloon.x}%`,
          top: `${balloon.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        className={cn(
          "comic-caption pointer-events-none absolute z-20 max-w-[86%]",
          dive ? "px-3 py-1.5 text-sm" : "px-1.5 py-0.5 text-[9px] sm:text-[11px]",
          live && "pointer-events-auto cursor-grab touch-none active:cursor-grabbing",
          selected && "outline outline-2 outline-cyan",
        )}
      >
        {text}
      </span>
    );
  }

  const kindClass =
    balloon.kind === "thought"
      ? "comic-bubble-thought"
      : balloon.kind === "whisper"
        ? "comic-bubble-whisper"
        : "comic-bubble-speech";

  return (
    <span
      onPointerDown={onPointerDown}
      style={{
        left: `${balloon.x}%`,
        top: `${balloon.y}%`,
        transform: `translate(-50%, -50%) rotate(${wobble(balloon.id) * 0.35}deg)`,
      }}
      className={cn(
        "comic-bubble pointer-events-none absolute z-20",
        kindClass,
        dive ? "max-w-[15.5rem] px-3 py-2 text-[15px]" : "max-w-[88%] px-1.5 py-1 text-[9px] sm:text-[11px]",
        live && "pointer-events-auto cursor-grab touch-none active:cursor-grabbing",
        selected && "outline outline-2 outline-cyan",
      )}
    >
      {text}
      {balloon.kind === "thought" ? (
        <>
          <i className="thought-dot thought-dot-a" style={{ left: `${tailPct}%` }} />
          <i className="thought-dot thought-dot-b" style={{ left: `${Math.max(12, tailPct - 8)}%` }} />
          <i className="thought-dot thought-dot-c" style={{ left: `${Math.max(8, tailPct - 14)}%` }} />
        </>
      ) : (
        <i className="comic-bubble-tail" style={{ left: `${tailPct}%` }} />
      )}
    </span>
  );
}
