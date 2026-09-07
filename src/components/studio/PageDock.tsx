import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { nextEmptyPanel, pageAliveCount } from "@/lib/comic/panel-beat";
import { useComicStore, useCurrentPage } from "@/lib/comic/store";
import { cn } from "@/lib/utils";

export function PageDock() {
  const navigate = useNavigate();
  const draft = useComicStore((s) => s.draft);
  const enterPanel = useComicStore((s) => s.enterPanel);
  const addBox = useComicStore((s) => s.addBox);
  const finishBook = useComicStore((s) => s.finishBook);
  const goToPage = useComicStore((s) => s.goToPage);
  const saveComic = useComicStore((s) => s.saveComic);
  const page = useCurrentPage();
  if (!draft || !page) return null;

  const alive = pageAliveCount(draft);
  const nextEmpty = nextEmptyPanel(page);
  const pageN = draft.pageIndex + 1;
  const pages = draft.pages.length;

  const primary = () => {
    if (nextEmpty) {
      enterPanel(nextEmpty.id);
      return;
    }
    if (draft.finished) {
      saveComic();
      void navigate({ to: "/read/$comicId", params: { comicId: draft.id } });
      return;
    }
    finishBook();
  };

  const label = nextEmpty
    ? `Walk into box ${page.panels.indexOf(nextEmpty) + 1}`
    : draft.finished
      ? "Read your book"
      : "Finish book";

  return (
    <div className="cover-tray pointer-events-auto absolute inset-x-0 bottom-0 z-40 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3">
        <button
          type="button"
          disabled={draft.pageIndex === 0}
          onClick={() => goToPage(draft.pageIndex - 1)}
          className="grid size-11 shrink-0 place-items-center rounded-md text-muted disabled:opacity-30 hover:text-fg"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-center text-[11px] text-muted">
            Page {pageN} of {pages} · {alive}/{page.panels.length} stamped
          </p>
          <button
            type="button"
            onClick={primary}
            className={cn(
              "font-display mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[14px] uppercase tracking-wide transition-transform duration-150 ease-out active:scale-[0.96]",
              "bg-cyan text-cyan-fg",
            )}
          >
            {label}
          </button>
        </div>
        <button
          type="button"
          onClick={() => (draft.pageIndex < pages - 1 ? goToPage(draft.pageIndex + 1) : addBox())}
          className="grid size-11 shrink-0 place-items-center rounded-md text-cyan hover:bg-cyan/10"
          aria-label={draft.pageIndex < pages - 1 ? "Next page" : "Add next box"}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
