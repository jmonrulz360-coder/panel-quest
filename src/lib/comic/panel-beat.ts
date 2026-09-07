import { wordCount } from "@/lib/utils";
import { getMission } from "./catalog";
import type { Comic, InsideBeat, Mission, Page, Panel } from "./types";

export const POSES = [
  { id: 0, name: "Idle", why: "Standing still. The reader waits." },
  { id: 1, name: "Action", why: "Leaning in. The body is doing the sentence." },
  { id: 2, name: "React", why: "The hit lands. Face and body flinch." },
] as const;

export function nextPose(pose: number | undefined) {
  return (((pose ?? 0) + 1) % 3) as 0 | 1 | 2;
}

export function castPoseStyle(pose = 0, rotate = 0, flip = false) {
  const p = pose ?? 0;
  const lean = p === 1 ? -8 : p === 2 ? 7 : 0;
  const scale = p === 1 ? 1.08 : p === 2 ? 1.05 : 1;
  const lift = p === 2 ? -6 : 0;
  const filter =
    p === 1 ? "saturate(1.28) contrast(1.1)" : p === 2 ? "brightness(1.14) contrast(1.12) saturate(1.18)" : undefined;
  return {
    transform: `translate(-50%, ${-90 + lift}%) rotate(${(rotate ?? 0) + lean}deg) scale(${scale}) scaleX(${flip ? -1 : 1})`,
    filter,
  };
}

export function storyBeat(n: number, isLast = false) {
  if (n === 1) return { id: "setup" as const, name: "The Setup", short: "Setup" };
  if (n === 2) return { id: "trouble" as const, name: "The Trouble", short: "Trouble" };
  if (n === 3 || isLast) return { id: "hook" as const, name: "The Hook", short: "Hook" };
  return { id: "beat" as const, name: `Box ${n}`, short: `Box ${n}` };
}

export function artReady(panel: Panel) {
  return Boolean(panel.sceneId && panel.cast.length);
}

export function wordsLockLine(panel: Panel) {
  if (artReady(panel)) return null;
  if (!panel.sceneId && !panel.cast.length) return "Art first. Stamp a place and a face, then they can talk.";
  if (!panel.sceneId) return "Stamp a place first. Pictures before words.";
  return "Who is talking? Drop a character first!";
}

export function panelAlive(p: Panel) {
  return Boolean(p.shot || p.cast.length);
}

export function firstMissingBeat(panel: Panel, _allowSpeech: boolean): InsideBeat | "ready" {
  if (!panel.sceneId) return "where";
  if (!panel.shot && panel.cast.length === 0) return "who";
  if (!panel.shot) return "camera";
  return "ready";
}

export const INSIDE_BEATS: InsideBeat[] = ["where", "who", "camera"];

export function beatOrder(_allowSpeech: boolean): InsideBeat[] {
  return INSIDE_BEATS;
}

export function nextBeat(beat: InsideBeat | "ready", _allowSpeech: boolean): InsideBeat | "ready" {
  if (beat === "ready") return "ready";
  const i = INSIDE_BEATS.indexOf(beat);
  if (i < 0 || i >= INSIDE_BEATS.length - 1) return "ready";
  return INSIDE_BEATS[i + 1];
}

export function allPanels(comic: Comic): Panel[] {
  return comic.pages.flatMap((p) => p.panels);
}

export function boxNumber(comic: Comic, panelId: string) {
  const i = allPanels(comic).findIndex((p) => p.id === panelId);
  return i < 0 ? 1 : i + 1;
}

export function totalBoxes(comic: Comic) {
  return allPanels(comic).length;
}

export function lastAlivePanel(comic: Comic): Panel | null {
  const list = allPanels(comic);
  for (let i = list.length - 1; i >= 0; i--) {
    if (panelAlive(list[i])) return list[i];
  }
  return null;
}

export function pageAliveCount(comic: Comic) {
  const page = comic.pages[comic.pageIndex];
  if (!page) return 0;
  return page.panels.filter(panelAlive).length;
}

export function nextEmptyPanel(page: Page, exceptId?: string) {
  return page.panels.find((p) => p.id !== exceptId && !panelAlive(p)) ?? null;
}

export function pageIsComplete(comic: Comic) {
  const page = comic.pages[comic.pageIndex];
  return Boolean(page && page.panels.length > 0 && page.panels.every(panelAlive));
}

export function lastIsHook(panel: Panel | null) {
  if (!panel) return false;
  return panel.shot === "close" || panel.shot === "extreme-close";
}

export function lineText(panel: Panel) {
  return panel.balloons.find((b) => b.kind !== "sfx")?.text ?? "";
}

export function lineOverCap(panel: Panel, mission: Mission) {
  const cap = mission.wordCap;
  if (cap == null) return false;
  return panel.balloons.some((b) => b.kind !== "sfx" && wordCount(b.text) > cap);
}

export function beatAsk(beat: InsideBeat | "ready", isLast: boolean, _isFirst: boolean, n = 1) {
  const story = storyBeat(n, isLast);
  if (beat === "where") {
    if (story.id === "setup") return "The Setup. Where does this start?";
    if (story.id === "trouble") return "The Trouble. Where does it go wrong?";
    if (story.id === "hook") return "The Hook. Where does the last beat land?";
    return "Where are you?";
  }
  if (beat === "who") {
    if (story.id === "setup") return "Who walks in first?";
    if (story.id === "trouble") return "Who's in trouble?";
    if (story.id === "hook") return "Whose face should they remember?";
    return "Who's in here?";
  }
  if (beat === "camera") {
    if (story.id === "trouble") return "How do we build tension here?";
    if (story.id === "hook") return "Get close. That's the hook.";
    if (story.id === "setup") return "Start wide so they know the room.";
    return "How close are you standing?";
  }
  if (story.id === "hook") return "Hook stamped. Finish the book — or add another box.";
  if (story.id === "trouble") return "Trouble's in. Stamp the squeeze.";
  if (story.id === "setup") return "Setup's in. Stamp it.";
  return "Looks alive. Stamp this box.";
}

export function pipForBeat(beat: InsideBeat | "ready", isLast: boolean, _isFirst: boolean, n = 1) {
  const story = storyBeat(n, isLast);
  if (beat === "where") return "Tap a place. The room lights up.";
  if (beat === "who") return "Tap someone in. Tap them again to change Idle, Action, or React.";
  if (beat === "camera") {
    if (story.id === "trouble") return "Close-ups show the feeling on a face. That's how you crank the tension.";
    if (story.id === "hook") return "Close-ups show the feeling. That's how a book ends.";
    if (story.id === "setup") return "Wide shots show the world. Save close-ups for the hook.";
    return "Wide shots show the world. Close-ups show the feeling.";
  }
  if (story.id === "hook") return "Last box is the cliffhanger. Finish when the face is close.";
  return "Stamp it. Then add another box — or finish the book.";
}

export function missionFor(comic: Comic) {
  return getMission(comic.missionId);
}
