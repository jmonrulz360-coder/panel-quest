import type { ReactNode } from "react";
import { getCast, getScene } from "@/lib/comic/catalog";
import { cn } from "@/lib/utils";
import type { Comic } from "@/lib/comic/types";

export function CoverArt({
  comic,
  titleSlot,
}: {
  comic: Comic;
  titleSlot?: ReactNode;
}) {
  const scene = getScene(comic.coverSceneId);
  const star = comic.coverCastId ? getCast(comic.coverCastId) : null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", scene ? "bg-ink" : "cover-board")}>
      {scene ? (
        <>
          <img src={scene.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-y-0 left-0 w-3 bg-ink/40" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-8">
          <p className="font-display text-center text-2xl leading-tight text-cyan sm:text-3xl">
            Drop a city
            <br />
            Drop a star
          </p>
        </div>
      )}
      {star ? (
        <img
          src={star.src}
          alt=""
          className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-[72%] w-auto max-w-[92%] -translate-x-1/2 object-contain drop-shadow-[0_0_28px_rgba(0,200,220,0.45)]"
        />
      ) : null}
      <span className="font-display pointer-events-none absolute right-2 top-2 z-[3] rounded-md bg-amber px-2 py-0.5 text-[11px] text-amber-fg shadow-[2px_2px_0_#041016]">
        ISSUE 1
      </span>
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-[4] p-5 pl-8 pr-16",
          scene ? "bg-gradient-to-b from-ink/80 to-transparent" : "",
        )}
      >
        <p className="font-display text-[11px] tracking-widest text-cyan">The Stories of M.E.</p>
        {titleSlot ?? (
          <h2 className="font-display mt-1 text-4xl leading-none text-paper sm:text-5xl">
            {comic.title.trim() || "Untitled"}
          </h2>
        )}
      </div>
    </div>
  );
}
