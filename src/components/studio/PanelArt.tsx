import { getCast, getProp, getScene, SHOTS } from "@/lib/comic/catalog";
import { OVERLAY_STYLE } from "@/lib/comic/craft";
import { castPoseStyle } from "@/lib/comic/panel-beat";
import { cn } from "@/lib/utils";
import type { Panel, PlacedProp } from "@/lib/comic/types";
import { ComicBalloon } from "./ComicBalloon";

const SHOT_SCALE: Record<string, number> = {
  establishing: 1,
  wide: 1,
  medium: 1.18,
  close: 1.42,
  "extreme-close": 1.7,
  "over-shoulder": 1.22,
  dutch: 1.12,
};

export function PanelArt({
  panel,
  dive = false,
  showEmpty = true,
  emptyLabel,
  hideCast = false,
  hideProps = false,
  hideBalloons = false,
}: {
  panel: Panel;
  dive?: boolean;
  showEmpty?: boolean;
  emptyLabel?: string;
  hideCast?: boolean;
  hideProps?: boolean;
  hideBalloons?: boolean;
}) {
  const scene = getScene(panel.sceneId);
  const shot = SHOTS.find((s) => s.id === panel.shot);
  const scale = dive ? (SHOT_SCALE[panel.shot ?? "wide"] ?? 1) : 1;
  const props = panel.props ?? [];
  const back = props.filter((p) => (getProp(p.id)?.layer ?? "back") === "back");
  const front = props.filter((p) => getProp(p.id)?.layer === "front");

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-3">
      {scene ? (
        <img
          src={scene.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center 40%",
          }}
        />
      ) : showEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display px-2 text-center text-[11px] text-muted">{emptyLabel}</span>
        </div>
      ) : null}

      {!hideProps && back.map((p) => <PlacedPropImg key={p.key} placed={p} />)}

      {!hideCast &&
        panel.cast.map((c) => {
          const member = getCast(c.id);
          if (!member) return null;
          return (
            <img
              key={c.key}
              src={member.src}
              alt={member.name}
              draggable={false}
              className="cast-pose pointer-events-none absolute w-auto max-w-[80%] object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                height: `${c.size}%`,
                ...castPoseStyle(c.pose ?? 0, c.rotate ?? 0, c.flip),
              }}
            />
          );
        })}

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          panel.overlays.map((o) => OVERLAY_STYLE[o]).join(" "),
        )}
      />

      {!hideProps && front.map((p) => <PlacedPropImg key={p.key} placed={p} />)}

      {!hideBalloons &&
        panel.balloons.map((b) => (
          <ComicBalloon key={b.id} balloon={b} panel={panel} dive={dive} />
        ))}

      {shot && !dive ? (
        <span className="font-display pointer-events-none absolute left-1 top-1 rounded-sm bg-ink/75 px-1.5 text-[9px] text-cyan sm:text-[10px]">
          {shot.chip}
        </span>
      ) : null}
    </div>
  );
}

function PlacedPropImg({ placed }: { placed: PlacedProp }) {
  const def = getProp(placed.id);
  if (!def) return null;
  const cover = def.size >= 100;
  return (
    <img
      src={def.src}
      alt=""
      draggable={false}
      className="pointer-events-none absolute w-auto max-w-[92%] object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
      style={{
        left: `${placed.x}%`,
        top: `${placed.y}%`,
        height: cover ? "100%" : `${placed.size}%`,
        width: cover ? "100%" : undefined,
        transform: cover
          ? "translate(-50%, -50%)"
          : `translate(-50%, -90%) rotate(${placed.rotate ?? 0}deg) scaleX(${placed.flip ? -1 : 1})`,
        opacity: def.id === "rain" || def.id === "fog" ? 0.82 : 1,
      }}
    />
  );
}
