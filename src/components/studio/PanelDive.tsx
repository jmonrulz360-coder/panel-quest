import { useEffect, useRef, useState } from "react";
import { FlipHorizontal, Minus, Plus, RotateCw, Trash2 } from "lucide-react";
import {
  ME_BOT_HUD_SRC,
  MORE_CREW,
  MORE_TROUBLE,
  PRIMARY_SHOTS,
  PROP_KINDS,
  SCENES,
  SFX_STAMPS,
  SHOTS,
  STARTER_CREW,
  STARTER_TROUBLE,
  getCast,
  getMission,
  getProp,
  getScene,
  propsInKind,
} from "@/lib/comic/catalog";
import {
  artReady,
  beatAsk,
  boxNumber,
  castPoseStyle,
  firstMissingBeat,
  INSIDE_BEATS,
  lastIsHook,
  lineOverCap,
  lineText,
  nextBeat,
  panelAlive,
  pipForBeat,
  POSES,
  storyBeat,
  wordsLockLine,
} from "@/lib/comic/panel-beat";
import { useComicStore, useSelectedPanel } from "@/lib/comic/store";
import { cn, wordCount } from "@/lib/utils";
import { PanelArt } from "./PanelArt";
import { ComicBalloon } from "./ComicBalloon";
import type { CastMember, InsideBeat, Panel, PlacedProp, PropKind, ShotId } from "@/lib/comic/types";

export function PanelDive() {
  const draft = useComicStore((s) => s.draft);
  const panel = useSelectedPanel();
  const exitPanel = useComicStore((s) => s.exitPanel);
  const enterPanel = useComicStore((s) => s.enterPanel);
  const demoPlaying = useComicStore((s) => s.demoPlaying);
  const cancelDemo = useComicStore((s) => s.cancelDemo);
  const hookLock = useComicStore((s) => s.hookLock);
  const juice = useComicStore((s) => s.juice);
  const page = draft?.pages[draft.pageIndex];
  if (!draft || !panel || !page) return null;

  const n = boxNumber(draft, panel.id);
  const total = draft.pages.reduce((sum, p) => sum + p.panels.length, 0);
  const isLast = hookLock;
  const isFirst = draft.pages[0]?.panels[0]?.id === panel.id;
  const story = storyBeat(n, isLast);

  return (
    <div className="fixed inset-0 z-[70] grid grid-rows-[auto_minmax(0,1fr)_auto] city-night">
      <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={demoPlaying ? cancelDemo : exitPanel}
          className="font-display h-12 rounded-xl border-2 border-cyan bg-ink-2 px-4 text-xs text-paper"
        >
          {demoPlaying ? "Stop" : "See the page"}
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {page.panels.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => enterPanel(p.id)}
              aria-label={`${storyBeat(boxNumber(draft, p.id)).name}${p.id === panel.id ? ", you're in here" : panelAlive(p) ? ", stamped" : ""}`}
              className={cn(
                "h-2 rounded-full transition-all",
                p.id === panel.id ? "w-8 bg-cyan" : panelAlive(p) ? "w-5 bg-cyan/40" : "w-5 bg-ink-3",
              )}
            />
          ))}
        </div>
        <div className="rounded-xl border-2 border-cyan bg-ink-2 px-3 py-1.5 text-right shadow-[3px_3px_0_var(--color-cyan)]">
          <p className="font-display text-xl leading-none text-cyan">{story.short}</p>
          <p className="font-display text-[11px] text-muted">{story.name}</p>
        </div>
      </header>

      <div className="min-h-0 px-3 pb-2">
        <div key={panel.id} className={cn("comic-print h-full", isFirst ? "dive-in" : "walk-in", juice && "stamp-shake")}>
          <div className={cn("comic-print-frame", juice && "neon-pulse")}>
            <DiveStage panel={panel} />
            <div className="dive-frame pointer-events-none absolute inset-0" />
          </div>
        </div>
      </div>

      <InsideTray panel={panel} isLast={isLast} isFirst={isFirst} n={n} total={total} />
    </div>
  );
}

function DiveStage({ panel }: { panel: Panel }) {
  const selectedCastKey = useComicStore((s) => s.selectedCastKey);
  const selectedPropKey = useComicStore((s) => s.selectedPropKey);
  const selectedBalloonId = useComicStore((s) => s.selectedBalloonId);
  const updateCast = useComicStore((s) => s.updateCast);
  const updateProp = useComicStore((s) => s.updateProp);
  const updateBalloon = useComicStore((s) => s.updateBalloon);
  const cyclePose = useComicStore((s) => s.cyclePose);
  const set = useComicStore.setState;
  const stage = useRef<HTMLDivElement>(null);
  const props = panel.props ?? [];
  const back = props.filter((p) => (getProp(p.id)?.layer ?? "back") === "back");
  const front = props.filter((p) => getProp(p.id)?.layer === "front");

  const grab = (
    kind: "cast" | "prop" | "balloon",
    key: string,
    update: (key: string, patch: { x: number; y: number }) => void,
  ) =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const already = kind === "cast" && useComicStore.getState().selectedCastKey === key;
      if (kind === "cast") set({ selectedCastKey: key, selectedPropKey: null, selectedBalloonId: null });
      else if (kind === "prop") set({ selectedPropKey: key, selectedCastKey: null, selectedBalloonId: null });
      else set({ selectedBalloonId: key, selectedCastKey: null, selectedPropKey: null });
      const box = stage.current?.getBoundingClientRect();
      if (!box) return;
      const startX = e.clientX;
      const startY = e.clientY;
      let dragged = false;
      const move = (ev: PointerEvent) => {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) dragged = true;
        const x = Math.min(96, Math.max(4, ((ev.clientX - box.left) / box.width) * 100));
        const y = Math.min(96, Math.max(8, ((ev.clientY - box.top) / box.height) * 100));
        update(key, { x: Math.round(x), y: Math.round(y) });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (kind === "cast" && already && !dragged) cyclePose(key);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };

  return (
    <div ref={stage} className="absolute inset-0">
      <PanelArt panel={panel} dive hideCast hideProps hideBalloons emptyLabel="Empty. Pick a place." showEmpty />
      {back.map((p) => (
        <LiveProp
          key={p.key}
          placed={p}
          selected={selectedPropKey === p.key}
          onPointerDown={grab("prop", p.key, updateProp)}
        />
      ))}
      {panel.cast.map((c) => {
        const member = getCast(c.id);
        if (!member) return null;
        return (
          <img
            key={c.key}
            src={member.src}
            alt={member.name}
            draggable={false}
            onPointerDown={grab("cast", c.key, updateCast)}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              height: `${c.size}%`,
              ...castPoseStyle(c.pose ?? 0, c.rotate ?? 0, c.flip),
            }}
            className={cn(
              "cast-pose absolute z-10 w-auto max-w-[70%] cursor-grab touch-none object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] active:cursor-grabbing",
              selectedCastKey === c.key && "outline outline-2 outline-cyan",
            )}
          />
        );
      })}
      {front.map((p) => (
        <LiveProp
          key={p.key}
          placed={p}
          selected={selectedPropKey === p.key}
          onPointerDown={grab("prop", p.key, updateProp)}
        />
      ))}
      {panel.balloons.map((b) => (
        <ComicBalloon
          key={b.id}
          balloon={b}
          panel={panel}
          dive
          selected={selectedBalloonId === b.id}
          onPointerDown={grab("balloon", b.id, updateBalloon)}
        />
      ))}
    </div>
  );
}

function LiveProp({
  placed,
  selected,
  onPointerDown,
}: {
  placed: PlacedProp;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const def = getProp(placed.id);
  if (!def) return null;
  const cover = def.size >= 100;
  return (
    <img
      src={def.src}
      alt={def.name}
      draggable={false}
      onPointerDown={onPointerDown}
      style={{
        left: `${placed.x}%`,
        top: `${placed.y}%`,
        height: cover ? "100%" : `${placed.size}%`,
        width: cover ? "100%" : undefined,
        transform: cover
          ? "translate(-50%, -50%)"
          : `translate(-50%, -90%) rotate(${placed.rotate ?? 0}deg) scaleX(${placed.flip ? -1 : 1})`,
        opacity: def.id === "rain" || def.id === "fog" ? 0.82 : 1,
        zIndex: cover ? 8 : def.layer === "front" ? 16 : 6,
      }}
      className={cn(
        "absolute w-auto max-w-[92%] cursor-grab touch-none object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] active:cursor-grabbing",
        selected && "outline outline-2 outline-cyan",
      )}
    />
  );
}

function InsideTray({
  panel,
  isLast,
  isFirst,
  n,
  total,
}: {
  panel: Panel;
  isLast: boolean;
  isFirst: boolean;
  n: number;
  total: number;
}) {
  const draft = useComicStore((s) => s.draft);
  const mission = getMission(draft?.missionId ?? "free-ink");
  const missing = firstMissingBeat(panel, mission.allowSpeech);
  const hookLock = useComicStore((s) => s.hookLock);
  const needsHook = hookLock && !lastIsHook(panel);
  const [beat, setBeat] = useState<InsideBeat | "ready">(needsHook ? "camera" : missing);
  const [slamming, setSlamming] = useState(false);
  const [kind, setKind] = useState<PropKind>("ride");
  const [side, setSide] = useState<"crew" | "trouble">("crew");
  const [more, setMore] = useState(false);
  const [extra, setExtra] = useState<null | "stuff" | "line">(null);
  const [whyShot, setWhyShot] = useState<ShotId | null>(null);
  const slamTimer = useRef<number | null>(null);

  const setScene = useComicStore((s) => s.setScene);
  const setShot = useComicStore((s) => s.setShot);
  const addCast = useComicStore((s) => s.addCast);
  const addProp = useComicStore((s) => s.addProp);
  const setLine = useComicStore((s) => s.setLine);
  const setPurpose = useComicStore((s) => s.setPurpose);
  const stampAndAdvance = useComicStore((s) => s.stampAndAdvance);
  const addBox = useComicStore((s) => s.addBox);
  const finishBook = useComicStore((s) => s.finishBook);
  const addSfx = useComicStore((s) => s.addSfx);
  const setGlitch = useComicStore((s) => s.setGlitch);
  const fork = useComicStore((s) => s.fork);
  const selectedCastKey = useComicStore((s) => s.selectedCastKey);
  const selectedPropKey = useComicStore((s) => s.selectedPropKey);
  const updateCast = useComicStore((s) => s.updateCast);
  const removeCast = useComicStore((s) => s.removeCast);
  const updateProp = useComicStore((s) => s.updateProp);
  const removeProp = useComicStore((s) => s.removeProp);
  const cyclePose = useComicStore((s) => s.cyclePose);

  useEffect(() => {
    setBeat(needsHook ? "camera" : missing);
    setSlamming(false);
    setExtra(null);
    setMore(false);
  }, [panel.id, missing, needsHook]);

  useEffect(() => {
    setWhyShot(null);
  }, [panel.id]);

  useEffect(() => {
    if (extra === "line" && !artReady(panel)) setExtra(null);
  }, [extra, panel]);

  useEffect(() => {
    return () => {
      if (slamTimer.current) window.clearTimeout(slamTimer.current);
    };
  }, []);

  const actor = panel.cast.find((c) => c.key === selectedCastKey);
  const member = actor ? getCast(actor.id) : null;
  const thing = (panel.props ?? []).find((p) => p.key === selectedPropKey);
  const thingDef = thing ? getProp(thing.id) : null;
  const over = lineOverCap(panel, mission);
  const line = lineText(panel);
  const canStamp = Boolean(panel.sceneId) && !over;
  const showStamp = beat === "ready" && !fork && !whyShot;
  const tensionBox = n === 2;
  const canTalk = artReady(panel);

  const goNext = (from: InsideBeat) => {
    setBeat(nextBeat(from, mission.allowSpeech));
    setExtra(null);
  };

  const stamp = () => {
    if (!canStamp || slamming) return;
    if (isLast && !panel.shot) setShot("close");
    if (isLast) setPurpose("reveal");
    setSlamming(true);
    slamTimer.current = window.setTimeout(() => {
      stampAndAdvance();
      setSlamming(false);
    }, 520);
  };

  const faces =
    side === "crew"
      ? more
        ? [...STARTER_CREW, ...MORE_CREW]
        : STARTER_CREW
      : more
        ? [...STARTER_TROUBLE, ...MORE_TROUBLE]
        : STARTER_TROUBLE;

  return (
    <div className="cover-tray z-40 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      {slamming ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-36 flex justify-center">
          <span className="stamp-slam font-display rounded-xl bg-cyan px-6 py-3 text-2xl text-cyan-fg shadow-[4px_4px_0_var(--color-ink)]">
            {isLast ? "HOOK" : "STAMPED"}
          </span>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-3">
        <div className="mb-2 flex items-center gap-2">
          <img src={ME_BOT_HUD_SRC} alt="" className="me-bot-bob h-8 w-8 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="font-display text-lg leading-none text-paper">{beatAsk(beat, isLast, isFirst, n)}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted">{pipForBeat(beat, isLast, isFirst, n)}</p>
          </div>
        </div>

        <div className="mb-2 flex gap-1">
          {INSIDE_BEATS.map((id) => {
            const done =
              (id === "where" && Boolean(panel.sceneId)) ||
              (id === "who" && panel.cast.length > 0) ||
              (id === "camera" && Boolean(panel.shot));
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setBeat(id);
                  setExtra(null);
                }}
                className={cn("h-1.5 flex-1 rounded-full", beat === id ? "bg-cyan" : done ? "bg-cyan/40" : "bg-ink-3")}
                aria-label={beatAsk(id, isLast, isFirst, n)}
              />
            );
          })}
        </div>

        {actor && member ? (
          <PoseRow
            name={`${member.short} · ${POSES[actor.pose ?? 0].name}`}
            onPose={() => cyclePose(actor.key)}
            poseLabel={POSES[actor.pose ?? 0].name}
            onSmall={() => updateCast(actor.key, { size: Math.max(22, actor.size - 8) })}
            onBig={() => updateCast(actor.key, { size: Math.min(140, actor.size + 8) })}
            onTurn={() => updateCast(actor.key, { rotate: ((actor.rotate ?? 0) + 12) % 360 })}
            onFlip={() => updateCast(actor.key, { flip: !actor.flip })}
            onRemove={() => removeCast(actor.key)}
          />
        ) : thing && thingDef ? (
          <PoseRow
            name={thingDef.name}
            onSmall={() => updateProp(thing.key, { size: Math.max(14, thing.size - 8) })}
            onBig={() => updateProp(thing.key, { size: Math.min(120, thing.size + 8) })}
            onTurn={() => updateProp(thing.key, { rotate: ((thing.rotate ?? 0) + 12) % 360 })}
            onFlip={() => updateProp(thing.key, { flip: !thing.flip })}
            onRemove={() => removeProp(thing.key)}
          />
        ) : null}

        {beat === "where" ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScene(s.id);
                  goNext("where");
                }}
                className={cn(
                  "w-28 shrink-0 overflow-hidden rounded-xl border-2 text-left cover-chip",
                  panel.sceneId === s.id ? "border-cyan" : "border-cyan/25",
                )}
              >
                <img src={s.src} alt="" className="aspect-[4/3] w-full object-cover" />
                <span className="font-display block truncate px-2 py-1.5 text-xs text-paper">{s.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        {beat === "who" ? (
          <div>
            <div className="mb-2 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setSide("crew");
                  setMore(false);
                }}
                className={cn(
                  "font-display h-11 flex-1 rounded-xl text-xs",
                  side === "crew" ? "bg-cyan text-cyan-fg" : "border-2 border-cyan/40 text-paper",
                )}
              >
                Crew
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide("trouble");
                  setMore(false);
                }}
                className={cn(
                  "font-display h-11 flex-1 rounded-xl text-xs",
                  side === "trouble" ? "bg-tension text-paper" : "border-2 border-cyan/40 text-paper",
                )}
              >
                Trouble
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {faces.map((c) => (
                <FaceChip
                  key={c.id}
                  member={c}
                  on={panel.cast.some((x) => x.id === c.id)}
                  trouble={side === "trouble"}
                  onPick={() => addCast(c.id)}
                />
              ))}
              <button
                type="button"
                onClick={() => setMore((v) => !v)}
                className="font-display w-20 shrink-0 rounded-xl border-2 border-ink px-2 text-xs text-muted"
              >
                {more ? "Less" : "More"}
              </button>
            </div>
            <div className="mt-2">
              {panel.cast.length ? (
                <button
                  type="button"
                  onClick={() => goNext("who")}
                  className="font-display h-14 w-full rounded-xl bg-cyan text-sm text-cyan-fg"
                >
                  They're in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goNext("who")}
                  className="font-display h-14 w-full rounded-xl border-2 border-cyan/40 text-sm text-paper"
                >
                  Empty room — skip
                </button>
              )}
            </div>
          </div>
        ) : null}

        {whyShot ? (
          <WhyPop
            shot={whyShot}
            tension={tensionBox}
            onGotIt={() => {
              setWhyShot(null);
              goNext("camera");
            }}
          />
        ) : beat === "camera" ? (
          <div>
            {tensionBox ? (
              <p className="mb-2 rounded-xl bg-amber px-3 py-2 text-center text-sm font-semibold text-amber-fg">
                The Trouble is the squeeze. Only a close-up gets you through.
              </p>
            ) : null}
            <div className="grid grid-cols-3 gap-2">
              {PRIMARY_SHOTS.map((s) => {
                const locked = tensionBox && s.id !== "close";
                const rec =
                  (tensionBox && s.id === "close") ||
                  (isLast && s.id === "close") ||
                  (isFirst && s.id === "wide") ||
                  (!isLast && !isFirst && !tensionBox && s.id === "medium");
                return (
                  <ZoomCard
                    key={s.id}
                    shot={s.id}
                    name={s.name}
                    why={
                      locked
                        ? "Not this box."
                        : tensionBox && s.id === "close"
                          ? "Close-ups crank the tension."
                          : isLast && s.id === "close"
                            ? "The hook. Use this."
                            : isFirst && s.id === "wide"
                              ? "Start here so nobody is lost."
                              : s.why
                    }
                    sceneSrc={getScene(panel.sceneId)?.src}
                    active={panel.shot === s.id}
                    recommended={rec}
                    locked={locked}
                    onPick={() => {
                      if (locked) {
                        setGlitch("How do we build tension here? Pick a close-up.");
                        return;
                      }
                      setShot(s.id);
                      if (isLast && s.id === "close") setPurpose("reveal");
                      if (isFirst && s.id === "wide") setPurpose("setup");
                      if (tensionBox && s.id === "close") setPurpose("reaction");
                      setWhyShot(s.id);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {fork ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={addBox}
              className="font-display flex h-14 items-center justify-center rounded-xl bg-cyan text-[14px] uppercase tracking-wide text-cyan-fg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Add next box
            </button>
            <button
              type="button"
              onClick={finishBook}
              className="font-display flex h-14 items-center justify-center rounded-xl border-2 border-amber text-[14px] uppercase tracking-wide text-amber-fg bg-amber transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Finish book
            </button>
          </div>
        ) : null}

        {showStamp ? (
          <div>
            {extra === "stuff" ? (
              <StuffStrip kind={kind} setKind={setKind} panel={panel} onAdd={addProp} />
            ) : extra === "line" ? (
              mission.allowSpeech ? (
                <LineBox line={line} cap={mission.wordCap} over={over} onChange={setLine} onSfx={addSfx} />
              ) : (
                <SfxStrip onSfx={addSfx} />
              )
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExtra("stuff")}
                  className="font-display h-12 flex-1 rounded-xl border-2 border-cyan/40 text-xs text-paper"
                >
                  Drop a thing
                </button>
                {mission.allowSpeech ? (
                  <button
                    type="button"
                    onClick={() => {
                      const lock = wordsLockLine(panel);
                      if (lock) {
                        setGlitch(lock);
                        return;
                      }
                      setExtra("line");
                    }}
                    className={cn(
                      "font-display h-12 flex-1 rounded-xl border-2 text-xs",
                      canTalk ? "border-cyan/40 text-paper" : "border-cyan/20 text-muted",
                    )}
                  >
                    {canTalk ? "They say something" : "Art first"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExtra("line")}
                    className="font-display h-12 flex-1 rounded-xl border-2 border-cyan/40 text-xs text-paper"
                  >
                    KABOOM
                  </button>
                )}
              </div>
            )}
            {extra ? (
              <button
                type="button"
                onClick={() => setExtra(null)}
                className="font-display mt-1 w-full text-center text-[11px] text-muted"
              >
                Hide
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canStamp || slamming}
              onClick={stamp}
              className={cn(
                "font-display mt-2 flex h-14 w-full items-center justify-center rounded-xl text-[15px] uppercase tracking-wide transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
                canStamp ? "neon-cta bg-cyan text-cyan-fg" : "border-2 border-cyan/30 text-muted",
              )}
            >
              {hookLock ? "Stamp the hook" : "Stamp this box"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FaceChip({
  member,
  on,
  trouble,
  onPick,
}: {
  member: CastMember;
  on: boolean;
  trouble: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "w-20 shrink-0 rounded-xl border-2 p-1.5",
        on ? (trouble ? "border-tension bg-tension/10" : "border-cyan bg-cyan/10") : "border-cyan/25",
      )}
    >
      <img src={member.src} alt={member.name} className="mx-auto h-14 object-contain" />
      <span className="font-display mt-1 block truncate text-center text-xs text-paper">{member.short}</span>
    </button>
  );
}

function StuffStrip({
  kind,
  setKind,
  panel,
  onAdd,
}: {
  kind: PropKind;
  setKind: (k: PropKind) => void;
  panel: Panel;
  onAdd: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {PROP_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={cn(
              "font-display h-10 shrink-0 rounded-xl px-3 text-xs",
              kind === k.id ? "bg-cyan text-cyan-fg" : "border-2 border-cyan/40 text-paper",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {propsInKind(kind).map((p) => {
          const on = (panel.props ?? []).some((x) => x.id === p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(p.id)}
              className={cn("cover-chip w-16 shrink-0 rounded-xl border-2 p-1.5", on ? "border-cyan" : "border-cyan/25")}
            >
              <img src={p.src} alt="" className="mx-auto h-10 object-contain" />
              <span className="font-display mt-1 block truncate text-center text-[11px] text-paper">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LineBox({
  line,
  cap,
  over,
  onChange,
  onSfx,
}: {
  line: string;
  cap: number | null;
  over: boolean;
  onChange: (text: string) => void;
  onSfx: (label: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-xs text-muted">Letter it in the balloon</p>
        <p className={cn("font-display text-xs tabular", over ? "text-amber" : "text-muted")}>
          {wordCount(line)}
          {cap != null ? ` / ${cap}` : ""}
        </p>
      </div>
      <div className={cn("comic-bubble-input px-4 pb-3 pt-2", over && "border-amber")}>
        <textarea
          value={line}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What do they say?"
          className="w-full resize-none bg-transparent text-center text-[15px] font-semibold leading-snug text-ink outline-none"
        />
        <i className="comic-bubble-tail" style={{ left: "28%" }} />
      </div>
      {over ? (
        <p className="font-display mt-2 rounded-md bg-amber px-3 py-2 text-center text-sm text-amber-fg">
          Too many words. Cut until a face could say it.
        </p>
      ) : null}
      <SfxStrip onSfx={onSfx} />
    </div>
  );
}

function SfxStrip({ onSfx }: { onSfx: (label: string) => void }) {
  return (
    <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
      {SFX_STAMPS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onSfx(s.label)}
          className="font-display h-11 shrink-0 rounded-xl border-2 border-cyan/40 px-3 text-xs text-paper"
        >
          {s.label}!
        </button>
      ))}
    </div>
  );
}

function PoseRow({
  name,
  onSmall,
  onBig,
  onTurn,
  onFlip,
  onRemove,
  onPose,
  poseLabel,
}: {
  name: string;
  onSmall: () => void;
  onBig: () => void;
  onTurn: () => void;
  onFlip: () => void;
  onRemove: () => void;
  onPose?: () => void;
  poseLabel?: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <span className="font-display px-1 text-xs text-cyan">{name}</span>
      {onPose ? (
        <button
          type="button"
          onClick={onPose}
          className="font-display h-10 rounded-xl border-2 border-cyan/40 bg-ink-2 px-3 text-xs text-paper"
        >
          {poseLabel ?? "Pose"}
        </button>
      ) : null}
      <IconBtn label="Smaller" onClick={onSmall}>
        <Minus className="size-4" />
      </IconBtn>
      <IconBtn label="Bigger" onClick={onBig}>
        <Plus className="size-4" />
      </IconBtn>
      <IconBtn label="Turn" onClick={onTurn}>
        <RotateCw className="size-4" />
      </IconBtn>
      <IconBtn label="Face the other way" onClick={onFlip}>
        <FlipHorizontal className="size-4" />
      </IconBtn>
      <IconBtn label="Remove" onClick={onRemove}>
        <Trash2 className="size-4" />
      </IconBtn>
    </div>
  );
}

function ZoomCard({
  shot,
  name,
  why,
  sceneSrc,
  active,
  recommended,
  locked,
  onPick,
}: {
  shot: ShotId;
  name: string;
  why: string;
  sceneSrc?: string;
  active: boolean;
  recommended: boolean;
  locked?: boolean;
  onPick: () => void;
}) {
  const scale = shot === "wide" ? 1 : shot === "medium" ? 1.28 : 1.7;
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "overflow-hidden rounded-xl border-2 text-left",
        locked ? "border-cyan/20 opacity-45" : active ? "border-cyan bg-cyan/10" : "border-cyan/30",
        recommended && !locked && "ring-2 ring-amber",
      )}
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-ink-3">
        {sceneSrc ? (
          <img
            src={sceneSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: `scale(${scale})`, transformOrigin: "center 40%" }}
          />
        ) : null}
      </span>
      <span className="block px-2 py-2">
        <span className="font-display block text-sm text-paper">{name}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted">{why}</span>
      </span>
    </button>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-xl text-muted hover:bg-ink-3 hover:text-paper"
    >
      {children}
    </button>
  );
}

function WhyPop({
  shot,
  tension,
  onGotIt,
}: {
  shot: ShotId;
  tension: boolean;
  onGotIt: () => void;
}) {
  const def = SHOTS.find((s) => s.id === shot);
  const line = tension
    ? "Close-ups show the feeling on a face. That's how you crank the tension."
    : (def?.why ?? "That's the camera. Now stamp the box.");
  return (
    <div className="rounded-2xl border-2 border-ink bg-paper-2 p-3 shadow-[4px_4px_0_var(--color-cyan)]">
      <div className="flex items-start gap-3">
        <img src={ME_BOT_HUD_SRC} alt="" className="me-bot-bob h-12 w-12 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="font-display text-xs text-cyan">M.E. Bot · why this shot</p>
          <p className="font-display text-xl leading-none text-ink">{def?.name ?? "Shot"}</p>
          <p className="mt-2 text-sm leading-snug text-ink">{line}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onGotIt}
        className="neon-cta font-display mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-cyan text-sm uppercase tracking-wide text-cyan-fg"
      >
        Got it
      </button>
    </div>
  );
}
