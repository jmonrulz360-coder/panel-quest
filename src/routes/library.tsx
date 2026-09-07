import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MISSIONS } from "@/lib/comic/catalog";
import { useComicStore } from "@/lib/comic/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/library")({ component: Library });

function Library() {
  const navigate = useNavigate();
  const hydrate = useComicStore((s) => s.hydrate);
  const comics = useComicStore((s) => s.comics);
  const deleteComic = useComicStore((s) => s.deleteComic);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="city-night min-h-dvh px-4 py-8 text-paper">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-paper">Books you made</h1>
          <Button variant="ghost" onClick={() => void navigate({ to: "/" })}>
            HQ
          </Button>
        </div>
        <div className="mt-6 space-y-3">
          {comics.length === 0 ? (
            <p className="text-muted">No books on this device yet. Jump into a story and stamp the boxes.</p>
          ) : (
            comics.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-cyan/40 bg-ink-2 p-4 shadow-[4px_4px_0_var(--color-cyan)]"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => void navigate({ to: "/read/$comicId", params: { comicId: c.id } })}
                >
                  <p className="font-display text-xl text-paper">{c.title}</p>
                  <p className="text-sm text-muted">
                    {MISSIONS.find((m) => m.id === c.missionId)?.title}
                  </p>
                </button>
                <Button variant="ghost" size="sm" onClick={() => deleteComic(c.id)}>
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
