import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import {
  ME_BOT_HUD_SRC,
  SCENES,
  STARTER_CREW,
  STARTER_TROUBLE,
  getMission,
} from "@/lib/comic/catalog";
import { useComicStore } from "@/lib/comic/store";
import { cn } from "@/lib/utils";
import { CoverArt } from "./CoverArt";

export function BookCover() {
  const navigate = useNavigate();
  const draft = useComicStore((s) => s.draft);
  const openBook = useComicStore((s) => s.openBook);
  const runDemo = useComicStore((s) => s.runDemo);
  const setTitle = useComicStore((s) => s.setTitle);
  const setCoverScene = useComicStore((s) => s.setCoverScene);
  const setCoverCast = useComicStore((s) => s.setCoverCast);
  const stampCover = useComicStore((s) => s.stampCover);
  const markHintSeen = useComicStore((s) => s.markHintSeen);
  const juice = useComicStore((s) => s.juice);
  const titleRef = useRef<HTMLInputElement>(null);
  const stamped = Boolean(draft?.coverStamped);
  const hasCity = Boolean(draft?.coverSceneId);
  const hasStar = Boolean(draft?.coverCastId);
  const hasName = Boolean(draft?.title.trim());

  useEffect(() => {
    if (stamped || !hasCity || !hasStar || hasName) return;
    titleRef.current?.focus();
  }, [stamped, hasCity, hasStar, hasName]);

  if (!draft) return null;
  const mission = getMission(draft.missionId);
  const faces = [...STARTER_CREW, ...STARTER_TROUBLE];

  const jumpIn = () => {
    markHintSeen();
    openBook();
  };

  return (
    <div className="cover-press relative flex h-full w-full flex-col">
      <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="grid size-12 place-items-center rounded-xl border-2 border-cyan bg-[#102633] text-paper hover:bg-cyan hover:text-cyan-fg"
          aria-label="Leave studio"
        >
          <X className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <img src={ME_BOT_HUD_SRC} alt="" className="me-bot-bob h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="font-display text-[13px] leading-none text-cyan">Cover press</p>
            <p className="truncate text-sm leading-snug text-paper">
              {stamped
                ? "Tap the cover. We fall into the first box."
                : hasCity && hasStar
                  ? "Name it. Type the title, then slam it."
                  : "City. Star. Title. Then slam it."}
            </p>
          </div>
        </div>
        {!stamped ? (
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-cyan/40 bg-[#102633] px-2 py-1.5">
            <Lamp on={hasCity} label="City" />
            <Lamp on={hasStar} label="Star" />
            <Lamp on={hasName} label="Title" />
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="absolute inset-2 overflow-hidden" style={{ containerType: "size" }}>
            <div
              className={cn(
                "relative mx-auto overflow-hidden",
                hasCity ? "neon-frame book-cover" : "cover-board",
                juice && "stamp-shake neon-pulse",
              )}
              style={{
                height: "min(100cqh, calc(100cqw * 4 / 3))",
                width: "min(100cqw, calc(100cqh * 3 / 4))",
              }}
              onClick={(e) => {
                if (!stamped) return;
                if ((e.target as HTMLElement).closest("input")) return;
                jumpIn();
              }}
              role="presentation"
            >
              <CoverArt
                comic={draft}
                titleSlot={
                  <input
                    value={draft.title}
                    onChange={(e) => setTitle(e.target.value.toUpperCase())}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Book title on cover"
                    placeholder="TYPE YOUR TITLE"
                    className="font-display mt-1 w-full bg-transparent text-4xl leading-none text-paper outline-none placeholder:text-cyan/55 sm:text-5xl"
                    maxLength={28}
                  />
                }
              />
            </div>
          </div>
        </div>

        {stamped ? (
          <div className="cover-tray cover-tray-side relative z-10 flex shrink-0 flex-col justify-end gap-3 px-4 py-4 max-md:max-h-[38%] md:overflow-y-auto">
            <button
              type="button"
              onClick={jumpIn}
              className="neon-cta font-display flex h-14 w-full items-center justify-center rounded-xl bg-cyan text-[15px] uppercase tracking-wide text-cyan-fg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Jump inside
            </button>
            <button
              type="button"
              onClick={() => {
                markHintSeen();
                runDemo();
              }}
              className="font-display inline-flex items-center justify-center gap-2 text-[13px] text-amber hover:text-paper"
            >
              <Play className="size-4" /> Watch M.E. Bot jump in first
            </button>
          </div>
        ) : (
          <div className="cover-tray cover-tray-side relative z-20 flex shrink-0 flex-col overflow-y-auto pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 max-md:max-h-[42%]">
            <div className="flex min-h-0 flex-1 flex-col px-3 md:px-4">
              <p className="font-display text-xs tracking-wide text-cyan">1. The city</p>
              <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                {SCENES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCoverScene(s.id)}
                    data-on={draft.coverSceneId === s.id}
                    className={cn(
                      "cover-chip w-24 shrink-0 overflow-hidden rounded-xl border-2 text-left",
                      draft.coverSceneId === s.id ? "border-cyan" : "border-cyan/25",
                    )}
                  >
                    <img src={s.src} alt="" className="aspect-[4/3] w-full object-cover" />
                    <span className="font-display block truncate px-1.5 py-1 text-[11px] text-paper">{s.name}</span>
                  </button>
                ))}
              </div>
              <p className="font-display mt-2 text-xs tracking-wide text-cyan">2. The star</p>
              <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                {faces.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCoverCast(c.id)}
                    data-on={draft.coverCastId === c.id}
                    className={cn(
                      "cover-chip w-16 shrink-0 rounded-xl border-2 p-1",
                      draft.coverCastId === c.id
                        ? c.side === "villain"
                          ? "border-tension"
                          : "border-cyan"
                        : "border-cyan/25",
                    )}
                  >
                    <img
                      src={c.src}
                      alt=""
                      className="mx-auto h-12 object-contain drop-shadow-[0_0_10px_rgba(0,200,220,0.35)]"
                    />
                    <span className="font-display mt-1 block truncate text-center text-[11px] text-paper">{c.short}</span>
                  </button>
                ))}
              </div>
              <p className="font-display mt-2 text-xs tracking-wide text-cyan">3. The title</p>
              <input
                ref={titleRef}
                value={draft.title}
                maxLength={28}
                onChange={(e) => setTitle(e.target.value.toUpperCase())}
                aria-label="Book title"
                placeholder="TYPE THE TITLE"
                className="font-display mt-1 h-12 w-full rounded-xl border-2 border-cyan bg-[#102633] px-3 text-lg tracking-wide text-paper outline-none placeholder:text-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,200,220,0.35)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!draft.title.trim()) titleRef.current?.focus();
                  stampCover();
                }}
                className="neon-cta font-display mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-amber text-[16px] uppercase tracking-wide text-amber-fg transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                Slam the cover
              </button>
              <button
                type="button"
                onClick={() => {
                  markHintSeen();
                  runDemo();
                }}
                className="font-display mt-2 w-full text-center text-[12px] text-cyan"
              >
                Watch M.E. Bot slam one first
              </button>
              <p className="sr-only">{mission.lesson}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Lamp({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="cover-lamp" data-on={on} />
      <span className="font-display text-[10px] text-paper/80">{label}</span>
    </span>
  );
}
