import { getLayout } from "@/lib/comic/catalog";
import { boxNumber, nextEmptyPanel, panelAlive, storyBeat } from "@/lib/comic/panel-beat";
import { useComicStore } from "@/lib/comic/store";
import { cn } from "@/lib/utils";
import { PanelArt } from "./PanelArt";
import type { Panel } from "@/lib/comic/types";

export function ComicCanvas() {
  const draft = useComicStore((s) => s.draft);
  const enterPanel = useComicStore((s) => s.enterPanel);
  const highlight = useComicStore((s) => s.highlight);
  if (!draft) return null;
  const page = draft.pages[draft.pageIndex];
  const layout = getLayout(page.layoutId);
  const lastId = page.panels.at(-1)?.id;
  const nextId = nextEmptyPanel(page)?.id;

  return (
    <div
      className={cn(
        "neon-frame paper relative mx-auto h-full w-auto max-h-full max-w-full overflow-hidden rounded-[4px]",
        highlight === "panel" && "highlight-pulse",
      )}
      style={{ aspectRatio: "3 / 4" }}
    >
      <div
        className="absolute inset-[7px] grid gap-[5px] bg-ink sm:inset-[10px] sm:gap-[7px]"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {page.panels.map((panel, i) => {
          const cell = layout.cells[i];
          const isLast = panel.id === lastId;
          const isNext = panel.id === nextId;
          const n = boxNumber(draft, panel.id);
          const beat = storyBeat(n, Boolean(draft.finished && isLast));
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => enterPanel(panel.id)}
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan}`,
                gridRow: `${cell.row} / span ${cell.rowSpan}`,
              }}
              className={cn(
                "relative min-h-0 overflow-hidden",
                isNext && "portal-glow",
                isLast && !isNext && draft.finished && "ring-1 ring-amber/40 ring-inset",
              )}
            >
              <PanelArt panel={panel} emptyLabel={beat.short} />
              <JumpStamp
                panel={panel}
                label={beat.short}
                isLast={isLast}
                isNext={isNext}
                hooked={Boolean(draft.finished && isLast)}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JumpStamp({
  panel,
  label,
  isLast,
  isNext,
  hooked,
}: {
  panel: Panel;
  label: string;
  isLast: boolean;
  isNext: boolean;
  hooked: boolean;
}) {
  const alive = panelAlive(panel);
  if (alive) {
    return (
      <span className="font-display pointer-events-none absolute inset-x-1 bottom-1 rounded-[6px] bg-ink/70 px-1.5 py-0.5 text-center text-[9px] text-cyan sm:text-[10px]">
        {hooked ? "Hook · edit" : `${label} · edit`}
      </span>
    );
  }
  if (isNext) {
    return (
      <span className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/25">
        <span className="jump-pulse font-display rounded-[10px] bg-cyan px-3 py-2 text-center text-[12px] leading-none text-cyan-fg sm:text-[14px]">
          {label}
        </span>
      </span>
    );
  }
  if (!panel.sceneId) {
    return (
      <span className="font-display pointer-events-none absolute inset-0 grid place-items-center text-[12px] text-muted">
        {label}
      </span>
    );
  }
  return null;
}
