import { useNavigate } from "@tanstack/react-router";
import { ME_BOT_CHEER_SRC } from "@/lib/comic/catalog";
import { useComicStore } from "@/lib/comic/store";

export function PageCelebrate() {
  const navigate = useNavigate();
  const draft = useComicStore((s) => s.draft);
  const dismissCelebrate = useComicStore((s) => s.dismissCelebrate);
  if (!draft) return null;

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#07141c]/85 px-4 backdrop-blur-[2px]">
      <div className="neon-frame w-full max-w-sm rounded-2xl bg-ink-2 p-6 text-center">
        <img src={ME_BOT_CHEER_SRC} alt="" className="me-bot-bob mx-auto h-16 w-16 object-contain" />
        <p className="font-display mt-3 text-[13px] text-cyan">M.E. Bot · director's note</p>
        <h2 className="font-display mt-2 text-4xl text-paper">That's a book</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {draft.directorNote ?? "You built a book one box at a time."}
        </p>
        <button
          type="button"
          onClick={() => {
            dismissCelebrate();
            void navigate({ to: "/read/$comicId", params: { comicId: draft.id } });
          }}
          className="neon-cta font-display mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-cyan text-[15px] uppercase tracking-wide text-cyan-fg transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          Read your book
        </button>
        <button
          type="button"
          onClick={dismissCelebrate}
          className="font-display mt-2 h-12 w-full rounded-md text-[13px] text-muted hover:text-fg"
        >
          Keep drawing
        </button>
      </div>
    </div>
  );
}
