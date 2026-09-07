import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLayout, getMission, ME_BOT_HUD_SRC } from "@/lib/comic/catalog";
import { useComicStore } from "@/lib/comic/store";
import { Button } from "@/components/ui/button";
import { PanelArt } from "@/components/studio/PanelArt";
import { CoverArt } from "@/components/studio/CoverArt";

export function ComicReader({ comicId }: { comicId: string }) {
  const navigate = useNavigate();
  const hydrate = useComicStore((s) => s.hydrate);
  const comics = useComicStore((s) => s.comics);
  const draft = useComicStore((s) => s.draft);
  const loadComic = useComicStore((s) => s.loadComic);
  const [leaf, setLeaf] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const comic = comics.find((c) => c.id === comicId) ?? (draft?.id === comicId ? draft : null);

  if (!comic) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 city-night px-6 text-center">
        <p className="text-paper">That book is not on this device.</p>
        <Button variant="ghost" onClick={() => void navigate({ to: "/" })}>
          Back to HQ
        </Button>
      </div>
    );
  }

  const mission = getMission(comic.missionId);
  const totalLeaves = comic.pages.length + 2;
  const onCover = leaf === 0;
  const onEnd = leaf === totalLeaves - 1;
  const page = onCover || onEnd ? null : comic.pages[leaf - 1];
  const layout = page ? getLayout(page.layoutId) : null;

  const prev = () => setLeaf((n) => Math.max(0, n - 1));
  const next = () => setLeaf((n) => Math.min(totalLeaves - 1, n + 1));

  return (
    <div className="city-night min-h-dvh px-4 py-6">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => void navigate({ to: "/" })}>
          HQ
        </Button>
        <div className="text-center">
          <p className="font-display text-[12px] text-cyan">{mission.title}</p>
          <h1 className="font-display text-2xl text-paper">{comic.title}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            loadComic(comic.id);
            void navigate({ to: "/studio/$missionId", params: { missionId: comic.missionId } });
          }}
        >
          Keep drawing
        </Button>
      </div>

      <div className="mx-auto mt-6 w-full max-w-md">
        <div
          key={leaf}
          className="page-turn paper book-glow relative overflow-hidden rounded-[4px]"
          style={{ aspectRatio: "3 / 4" }}
        >
          {onCover ? (
            <CoverArt comic={comic} />
          ) : onEnd ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <img src={ME_BOT_HUD_SRC} alt="" className="h-16 w-16 object-contain" />
              <p className="font-display text-[13px] text-ink/50">The Stories of M.E.</p>
              <h2 className="font-display text-5xl leading-none text-ink">The End</h2>
              <div className="max-w-[18rem] rounded-md border border-ink/15 bg-paper-2 px-4 py-3 text-left">
                <p className="font-display text-[12px] text-ink/55">Director's Note</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">
                  {comic.directorNote ?? "You built a book one box at a time."}
                </p>
              </div>
            </div>
          ) : page && layout ? (
            <div
              className="absolute inset-[10px] grid gap-[7px] bg-ink"
              style={{
                gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
              }}
            >
              {page.panels.map((panel) => {
                const i = page.panels.indexOf(panel);
                const cell = layout.cells[i];
                return (
                  <div
                    key={panel.id}
                    className="relative min-h-0 overflow-hidden"
                    style={{
                      gridColumn: `${cell.col} / span ${cell.colSpan}`,
                      gridRow: `${cell.row} / span ${cell.rowSpan}`,
                    }}
                  >
                    <PanelArt panel={panel} emptyLabel="" showEmpty={false} />
                  </div>
                );
              })}
            </div>
          ) : null}
          <button
            type="button"
            aria-label="Previous page"
            onClick={prev}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            type="button"
            aria-label="Next page"
            onClick={next}
            className="absolute inset-y-0 right-0 w-2/3"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={leaf === 0}
            className="grid size-11 place-items-center rounded-[12px] text-muted disabled:opacity-30 hover:text-fg"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-[13px] text-muted">
            {onCover ? "Cover" : onEnd ? "The end" : `Page ${leaf} / ${comic.pages.length}`}
          </p>
          <button
            type="button"
            onClick={next}
            disabled={leaf >= totalLeaves - 1}
            className="grid size-11 place-items-center rounded-[12px] text-muted disabled:opacity-30 hover:text-fg"
            aria-label="Forward"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
