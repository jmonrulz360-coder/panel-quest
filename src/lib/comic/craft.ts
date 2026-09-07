import { wordCount } from "@/lib/utils";
import { SHOT_RANK, getMission, getLayout } from "./catalog";
import type { Comic, CraftReport, Mission, OverlayId, Page, Panel, ShotId } from "./types";

function pageOf(comic: Comic): Page {
  return comic.pages[comic.pageIndex] ?? comic.pages[0];
}

function filled(p: Panel) {
  return Boolean(p.sceneId || p.cast.length || p.overlays.length || (p.props && p.props.length));
}

function speechBalloons(p: Panel) {
  return p.balloons.filter((b) => b.kind !== "sfx");
}

function maxWords(page: Page) {
  let max = 0;
  for (const p of page.panels) {
    for (const b of p.balloons) {
      if (b.kind === "sfx") continue;
      max = Math.max(max, wordCount(b.text));
    }
  }
  return max;
}

function shotChanges(page: Page) {
  const shots = page.panels.map((p) => p.shot).filter(Boolean) as ShotId[];
  let n = 0;
  for (let i = 1; i < shots.length; i++) {
    if (SHOT_RANK[shots[i]] !== SHOT_RANK[shots[i - 1]]) n++;
  }
  return n;
}

function uniqueShots(page: Page) {
  return new Set(page.panels.map((p) => p.shot).filter(Boolean));
}

export function tensionFor(page: Page): number {
  const shots = uniqueShots(page);
  const last = page.panels[page.panels.length - 1];
  const first = page.panels[0];
  let t = 18;
  t += shots.size * 8;
  if (first?.shot === "establishing" || first?.shot === "wide") t += 12;
  if (last?.shot === "close" || last?.shot === "extreme-close" || last?.purpose === "reveal") t += 14;
  if (page.panels.some((p) => filled(p) && speechBalloons(p).every((b) => !b.text.trim()))) t += 10;
  t += shotChanges(page) * 5;
  if (page.panels.some((p) => p.overlays.length > 0)) t += 6;
  if (page.panels.some((p) => (p.props ?? []).length > 0)) t += 5;
  t -= page.panels.filter((p) => !filled(p)).length * 4;
  const over = page.panels.flatMap((p) => p.balloons).filter((b) => b.kind !== "sfx" && wordCount(b.text) > 22);
  t -= over.length * 8;
  if (shots.size <= 1 && page.panels.filter(filled).length >= 3) t -= 12;
  return Math.max(0, Math.min(100, Math.round(t)));
}

function hasObjective(mission: Mission, id: string, page: Page, tension: number) {
  const last = page.panels[page.panels.length - 1];
  const first = page.panels[0];
  const filledPanels = page.panels.filter(filled);
  const closeShots = page.panels.filter((p) => p.shot === "close" || p.shot === "extreme-close");
  const cap = mission.wordCap;
  switch (id) {
    case "first-establishing":
      return first?.shot === "establishing" || first?.shot === "wide";
    case "has-character":
      return page.panels.some((p) => p.cast.length > 0);
    case "purpose-early":
      return page.panels.slice(0, 4).some((p) => p.purpose === "action" || p.purpose === "reveal");
    case "word-cap":
      return cap == null ? true : maxWords(page) <= cap;
    case "last-hook":
      return last?.shot === "close" || last?.shot === "extreme-close" || last?.purpose === "reveal";
    case "two-close":
      return closeShots.length >= 2;
    case "silent-panel":
      return page.panels.some((p) => filled(p) && speechBalloons(p).every((b) => !b.text.trim()));
    case "shot-variety-2":
      return uniqueShots(page).size >= 2;
    case "shot-variety-3":
      return uniqueShots(page).size >= 3;
    case "three-plus":
      return getLayout(page.layoutId).cells.length >= 3;
    case "same-scene-pair": {
      const ids = page.panels.map((p) => p.sceneId).filter(Boolean);
      return ids.some((id, i) => ids.indexOf(id) !== i);
    }
    case "scene-change": {
      const ids = [...new Set(page.panels.map((p) => p.sceneId).filter(Boolean))];
      return ids.length >= 2;
    }
    case "time-caption":
      return page.panels.some((p) =>
        p.balloons.some((b) => {
          if (b.kind !== "caption") return false;
          return /\b(later|after|hours?|minutes?|bell|next|meanwhile|dawn|dusk)\b/i.test(b.text);
        }),
      );
    case "setup-early":
      return page.panels.slice(0, Math.ceil(page.panels.length / 2)).some((p) => p.purpose === "setup");
    case "last-reveal":
      return last?.purpose === "reveal";
    case "tension-60":
      return tension >= 60;
    case "zero-speech":
      return page.panels.every((p) => speechBalloons(p).every((b) => !b.text.trim()));
    case "five-filled":
      return filledPanels.length >= 5;
    case "three-shot-changes":
      return shotChanges(page) >= 3;
    case "last-close":
      return last?.shot === "close" || last?.shot === "extreme-close";
    case "two-characters": {
      const ids = new Set(page.panels.flatMap((p) => p.cast.map((c) => c.id)));
      return ids.size >= 2;
    }
    case "over-shoulder-one":
      return page.panels.some((p) => p.shot === "over-shoulder");
    case "reaction-close":
      return page.panels.some((p) => (p.shot === "close" || p.shot === "extreme-close") && p.purpose === "reaction");
    case "has-picture":
      return filledPanels.length >= 1;
    case "has-shot":
      return filledPanels.length > 0 && filledPanels.every((p) => p.shot);
    default:
      return false;
  }
}

export function evaluateCraft(comic: Comic, mission?: Mission): CraftReport {
  const m = mission ?? getMission(comic.missionId);
  const page = pageOf(comic);
  const tension = tensionFor(page);
  const objectives = m.objectives.map((o) => ({
    ...o,
    done: hasObjective(m, o.id, page, tension),
  }));
  const notes: string[] = [];
  const filledN = page.panels.filter(filled).length;
  if (filledN === 0) notes.push("The page is blank. Pictures first — place, then people, then words.");
  if (uniqueShots(page).size <= 1 && filledN >= 3) notes.push("Every panel uses the same camera. Change the distance.");
  if (maxWords(page) > (m.wordCap ?? 22)) notes.push("A balloon ran long. Cut until a picture could not say it better.");
  if (page.panels[0] && !page.panels[0].shot && filled(page.panels[0])) notes.push("Name the camera on panel 1. Distance is feeling.");
  const last = page.panels[page.panels.length - 1];
  if (last && filled(last) && last.shot === "medium" && last.purpose !== "reveal") {
    notes.push("Last panel is a medium. Hooks are usually closer, or a reveal.");
  }
  let glitch: string | null = null;
  if (!m.allowSpeech && page.panels.some((p) => speechBalloons(p).some((b) => b.text.trim()))) {
    glitch = "Silent page. Speech, thought, and captions are locked for this mission.";
  } else if (m.wordCap != null && maxWords(page) > m.wordCap) {
    glitch = `Cut it. Cap is ${m.wordCap} words. A face should do the rest.`;
  }
  return { tension, objectives, notes, glitch };
}

export function botLine(
  comic: Comic | null,
  opts: { highlight: string | null; step?: "shot" | "cast" | "script" | "hook"; coach?: string | null } = {
    highlight: null,
  },
): string {
  if (!comic) return "Tap a mission. I ride shotgun.";
  const mission = getMission(comic.missionId);
  if (opts.coach) return opts.coach;
  const report = evaluateCraft(comic, mission);
  if (report.glitch) return report.glitch;
  if (opts.highlight === "shot") return "Tap a box. Then pick Wide, Medium, or Close-Up.";
  if (opts.highlight === "cast") return "Drop someone in. Flip them toward the action.";
  if (opts.highlight === "script") return "Short lines. If a face can say it, cut the sentence.";
  if (opts.highlight === "hook") return "Last panel is the question. Close-up or a reveal.";
  const page = pageOf(comic);
  if (page.panels.every((p) => !filled(p) && !p.shot)) return mission.botIntro;
  const next = report.objectives.find((o) => !o.done);
  if (next) return next.hint;
  if (report.objectives.every((o) => o.done)) return "Page is tight. Lock the hook.";
  return "Keep cutting. Keep changing the camera.";
}

export function directorNoteFor(comic: Comic): string {
  const panels = comic.pages.flatMap((p) => p.panels).filter((p) => p.sceneId || p.cast.length || p.shot);
  const first = panels[0];
  const last = panels.at(-1);
  const shots = new Set(panels.map((p) => p.shot).filter(Boolean));
  const silent = panels.some(
    (p) => (p.sceneId || p.cast.length) && p.balloons.every((b) => b.kind === "sfx" || !b.text.trim()),
  );
  const sfx = panels.some((p) => p.balloons.some((b) => b.kind === "sfx" && b.text.trim()));
  const faces = new Set(panels.flatMap((p) => p.cast.map((c) => c.id)));
  const wideStart = first?.shot === "wide" || first?.shot === "establishing";
  const closeEnd = last?.shot === "close" || last?.shot === "extreme-close";

  if (wideStart && closeEnd && panels.length >= 2) {
    return "You used a Wide-to-Close pacing trick to build suspense. Start with the world, end on a face.";
  }
  if (silent && panels.length >= 2) {
    return "You let a quiet box do the talking. That's show, don't tell.";
  }
  if (sfx) {
    return "You stamped action words like a real letterer. The picture hits, the word pops.";
  }
  if (shots.size >= 3) {
    return "You mixed cameras. Wide, medium, close — that's how a page breathes.";
  }
  if (closeEnd) {
    return "You ended on a close-up. That's a cliffhanger. They have to turn the page.";
  }
  if (faces.size >= 2) {
    return "Two faces on the page. That's a conversation — the camera takes turns.";
  }
  return "You built a book one box at a time. That's how graphic novels get made.";
}

export const OVERLAY_STYLE: Record<OverlayId, string> = {
  rain: "overlay-rain",
  night: "overlay-night",
  flash: "overlay-flash",
  "speed-left": "overlay-speed-l",
  "speed-right": "overlay-speed-r",
  vignette: "overlay-vignette",
  burst: "overlay-burst",
};
