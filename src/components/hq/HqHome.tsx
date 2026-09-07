import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Download, Play } from "lucide-react";
import { ME_BOT_HUD_SRC, MISSIONS } from "@/lib/comic/catalog";
import { useComicStore } from "@/lib/comic/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HqHome() {
  const navigate = useNavigate();
  const hydrate = useComicStore((s) => s.hydrate);
  const comics = useComicStore((s) => s.comics);
  const startMission = useComicStore((s) => s.startMission);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const deploy = (id: string) => {
    startMission(id);
    void navigate({ to: "/studio/$missionId", params: { missionId: id } });
  };

  const starter = MISSIONS.find((m) => m.id === "cold-open")!;
  const challenges = MISSIONS.filter((m) => m.id !== "cold-open");

  return (
    <div className="hq-dot min-h-dvh text-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="flex items-start gap-4">
          <img
            src={ME_BOT_HUD_SRC}
            alt=""
            className="me-bot-bob hidden h-20 w-20 shrink-0 object-contain sm:block"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[13px] text-cyan">The Stories of M.E. · Level 2</p>
            <h1 className="neon-title font-display mt-2 text-5xl text-balance sm:text-7xl">Panel Quest</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-pretty text-muted">
              You fall into the comic. Stamp a cover. Add boxes until the last one is a close-up. Then you
              walk out with a real book.
            </p>
            <a
              href="https://github.com/jmonrulz360-coder/panel-quest"
              target="_blank"
              rel="noreferrer"
              className="neon-cta font-display mt-5 inline-flex h-14 items-center gap-2 rounded-xl bg-amber px-6 text-[16px] uppercase tracking-wide text-amber-fg"
            >
              <Download className="size-4" /> Open GitHub for Lovable
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => deploy(starter.id)}
          className="neon-frame relative mt-8 block w-full overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/art/crew/cyber-crew.jpg"
            alt="The Cyber-City crew"
            className="aspect-[16/9] w-full object-cover object-[center_72%] sm:aspect-[2/1]"
          />
          <span className="absolute inset-x-0 bottom-0 border-t border-cyan/40 bg-ink/65 p-5 sm:p-6">
            <span className="font-display text-[13px] text-cyan">Start here · stamp a cover</span>
            <span className="font-display mt-1 block text-3xl text-paper sm:text-4xl">Make a book</span>
            <span className="mt-2 block max-w-lg text-sm leading-relaxed text-paper/80">{starter.blurb}</span>
            <span className="neon-cta font-display mt-4 inline-flex h-14 items-center gap-2 rounded-xl bg-cyan px-6 text-[16px] uppercase tracking-wide text-cyan-fg">
              <Play className="size-4" /> Jump inside
            </span>
          </span>
        </button>

        {comics.length ? (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <p className="font-display text-[13px] text-muted">Books you made</p>
              <Button variant="ghost" size="sm" onClick={() => void navigate({ to: "/library" })}>
                <BookOpen className="size-4" /> Open library
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {comics.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => void navigate({ to: "/read/$comicId", params: { comicId: c.id } })}
                  className="rounded-2xl border-2 border-cyan/40 bg-ink-2 p-3 text-left shadow-[4px_4px_0_var(--color-cyan)] hover:border-cyan"
                >
                  <p className="font-display text-[15px] text-paper">{c.title.trim() || "Untitled"}</p>
                  <p className="mt-1 text-[11px] text-muted">{getMissionLabel(c.missionId)}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <p className="font-display text-[13px] text-muted">More challenges</p>
          <div className="mt-3 grid gap-2">
            {challenges.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => deploy(m.id)}
                aria-label={`Jump into ${m.title}, difficulty ${m.difficulty} of 3`}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border-2 border-cyan/40 bg-ink-2 p-4 text-left shadow-[4px_4px_0_var(--color-cyan)] hover:border-cyan",
                )}
              >
                <span className="font-display w-10 shrink-0 text-lg text-cyan">{m.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-xl text-paper">{m.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{m.blurb}</span>
                </span>
                <span className="font-display hidden text-[11px] text-muted sm:inline">
                  {"I".repeat(m.difficulty)}
                  <span className="opacity-25">{"I".repeat(3 - m.difficulty)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function getMissionLabel(id: string) {
  return MISSIONS.find((m) => m.id === id)?.title ?? "Page";
}
