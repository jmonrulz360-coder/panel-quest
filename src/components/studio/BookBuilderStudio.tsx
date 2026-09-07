import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { getMission, ME_BOT_HUD_SRC } from "@/lib/comic/catalog";
import { evaluateCraft } from "@/lib/comic/craft";
import { pageAliveCount } from "@/lib/comic/panel-beat";
import { useComicStore } from "@/lib/comic/store";
import { unlockAudio } from "@/lib/comic/sfx";
import { ComicCanvas } from "./ComicCanvas";
import { BookCover } from "./BookCover";
import { PanelDive } from "./PanelDive";
import { PageDock } from "./PageDock";
import { PageCelebrate } from "./PageCelebrate";

export function BookBuilderStudio({ missionId }: { missionId: string }) {
  const navigate = useNavigate();
  const hydrate = useComicStore((s) => s.hydrate);
  const startMission = useComicStore((s) => s.startMission);
  const draft = useComicStore((s) => s.draft);
  const hydrated = useComicStore((s) => s.hydrated);
  const glitch = useComicStore((s) => s.glitch);
  const streak = useComicStore((s) => s.streak);
  const view = useComicStore((s) => s.view);
  const coach = useComicStore((s) => s.coach);
  const celebrate = useComicStore((s) => s.celebrate);
  const exitPanel = useComicStore((s) => s.exitPanel);
  const cancelDemo = useComicStore((s) => s.cancelDemo);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const current = useComicStore.getState().draft;
    if (!current || current.missionId !== missionId) startMission(missionId);
  }, [hydrated, missionId, startMission]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const s = useComicStore.getState();
      if (s.demoPlaying) cancelDemo();
      else if (s.celebrate) s.dismissCelebrate();
      else if (s.view === "inside") exitPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelDemo, exitPanel]);

  if (!draft) {
    return <div className="studio-lock bg-ink" />;
  }

  const mission = getMission(draft.missionId);
  const report = evaluateCraft(draft, mission);
  const alive = pageAliveCount(draft);
  const total = draft.pages[draft.pageIndex]?.panels.length ?? 0;
  const pip =
    coach ??
    (view === "cover"
      ? "Stamp the cover first. A place, a face, a name."
      : view === "inside"
        ? "You're inside the box. Look around."
        : alive === 0
          ? "Tap the glowing box. That's the door into the comic."
          : "Add boxes. Finish on a close-up. That's a book.");

  return (
    <div className="studio-lock" onPointerDown={unlockAudio}>
      {view === "cover" ? (
        <div className="absolute inset-0 z-0 city-night">
          <BookCover />
        </div>
      ) : null}

      {view === "page" ? (
        <>
          <div className="absolute inset-0 z-0 city-night">
            <div
              className="absolute inset-x-3 flex items-center justify-center"
              style={{ top: 72, bottom: 108 }}
            >
              <ComicCanvas />
            </div>
          </div>
          <div className="hud-layer absolute inset-0 z-20">
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              <div className="pointer-events-auto flex max-w-[72%] items-start gap-2">
                <button
                  type="button"
                  onClick={() => void navigate({ to: "/" })}
                  className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-cyan bg-ink-2 text-paper hover:border-cyan hover:text-cyan"
                  aria-label="Leave studio"
                >
                  <X className="size-5" />
                </button>
                <div className="hud-chip min-w-0 rounded-lg px-3 py-2 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <img
                      src={ME_BOT_HUD_SRC}
                      alt=""
                      className="me-bot-bob h-9 w-9 shrink-0 object-contain"
                    />
                    <p className="text-[12px] leading-snug text-paper">{pip}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-display text-[11px] text-muted">Punch</span>
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-3">
                      <div
                        className="h-full rounded-full bg-tension transition-[width] duration-300"
                        style={{ width: `${report.tension}%` }}
                      />
                    </div>
                    <span className="font-display tabular text-[12px] text-paper">{report.tension}</span>
                    <span className="font-display text-[11px] text-cyan">
                      {alive}/{total}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hud-chip pointer-events-auto rounded-lg px-3 py-2 text-right backdrop-blur">
                <p className="font-display text-[11px] text-muted">Streak</p>
                <p className="font-display tabular text-2xl leading-none text-cyan">{streak}</p>
              </div>
            </div>
            <PageDock />
          </div>
          {celebrate ? <PageCelebrate /> : null}
        </>
      ) : null}

      {view === "inside" ? <PanelDive /> : null}

      {glitch ? (
        <div className="pointer-events-none absolute inset-x-3 top-4 z-[60] flex justify-center">
          <p className="glitch-banner font-display max-w-[36rem] rounded-xl bg-amber px-4 py-2 text-center text-[13px] text-amber-fg shadow-[4px_4px_0_var(--color-ink)]">
            {glitch}
          </p>
        </div>
      ) : null}
    </div>
  );
}
