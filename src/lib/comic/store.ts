import { create } from "zustand";
import { uid } from "@/lib/utils";
import { directorNoteFor, evaluateCraft } from "./craft";
import { getLayout, getMission, getProp, layoutIdForCount, MAX_BOXES, SHOTS, sizeForShot } from "./catalog";
import {
  boxNumber,
  lastAlivePanel,
  lastIsHook,
  nextEmptyPanel,
  nextPose,
  pageIsComplete,
  panelAlive,
  POSES,
  totalBoxes,
  wordsLockLine,
} from "./panel-beat";
import { sfx, unlockAudio } from "./sfx";
import type {
  BalloonKind,
  Comic,
  OverlayId,
  Page,
  Panel,
  PlacedProp,
  PurposeId,
  ShotId,
  StudioView,
} from "./types";

const KEY = "panel-quest-v4";

type Persist = {
  comics: Comic[];
  draft: Comic | null;
  seenHint: boolean;
  bestStreak: number;
};

function emptyPanel(): Panel {
  return {
    id: uid("p"),
    shot: null,
    purpose: null,
    sceneId: null,
    cast: [],
    props: [],
    overlays: [],
    balloons: [],
  };
}

function makePage(layoutId: string): Page {
  const layout = getLayout(layoutId);
  return {
    id: uid("page"),
    layoutId,
    panels: layout.cells.map(() => emptyPanel()),
  };
}

function normalizePanel(p: Panel): Panel {
  return {
    ...p,
    cast: (p.cast ?? []).map((c) => ({ ...c, pose: c.pose ?? 0 })),
    props: p.props ?? [],
    overlays: p.overlays ?? [],
    balloons: p.balloons ?? [],
  };
}

function normalizeComic(c: Comic): Comic {
  return {
    ...c,
    title: c.title ?? "",
    coverSceneId: c.coverSceneId ?? null,
    coverCastId: c.coverCastId ?? null,
    coverStamped: Boolean(c.coverStamped),
    directorNote: c.directorNote ?? null,
    finished: Boolean(c.finished),
    pages: c.pages.map((page) => ({
      ...page,
      panels: page.panels.map(normalizePanel),
    })),
  };
}

function load(): Persist {
  if (typeof window === "undefined") return { comics: [], draft: null, seenHint: false, bestStreak: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { comics: [], draft: null, seenHint: false, bestStreak: 0 };
    const data = JSON.parse(raw) as Persist;
    return {
      ...data,
      comics: (data.comics ?? []).map(normalizeComic),
      draft: data.draft ? normalizeComic(data.draft) : null,
    };
  } catch {
    return { comics: [], draft: null, seenHint: false, bestStreak: 0 };
  }
}

function save(p: Persist) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

type DemoStep = { delay: number; run: () => void };

type CastPatch = Partial<{ x: number; y: number; size: number; flip: boolean; rotate: number; pose: 0 | 1 | 2 }>;
type PropPatch = CastPatch;

const MAX_PROPS = 8;

type State = Persist & {
  hydrated: boolean;
  view: StudioView;
  selectedPanelId: string | null;
  selectedBalloonId: string | null;
  selectedCastKey: string | null;
  selectedPropKey: string | null;
  coach: string | null;
  streak: number;
  glitch: string | null;
  highlight: string | null;
  celebrate: boolean;
  fork: boolean;
  hookLock: boolean;
  juice: boolean;
  demoPlaying: boolean;
  demoTimer: number | null;
  hydrate: () => void;
  persist: () => void;
  startMission: (missionId: string) => void;
  loadComic: (id: string) => void;
  openBook: () => void;
  enterPanel: (id: string) => void;
  exitPanel: () => void;
  stampAndAdvance: () => void;
  addBox: () => void;
  addPage: () => void;
  finishBook: () => void;
  stampCover: () => void;
  setCoverScene: (id: string) => void;
  setCoverCast: (id: string) => void;
  goToPage: (index: number) => void;
  dismissCelebrate: () => void;
  markHintSeen: () => void;
  selectPanel: (id: string | null) => void;
  setCoach: (line: string | null) => void;
  setLayout: (layoutId: string) => void;
  setTitle: (title: string) => void;
  patchPanel: (panelId: string, patch: Partial<Panel>) => void;
  setScene: (sceneId: string | null) => void;
  applySceneToPage: (sceneId: string) => void;
  setShot: (shot: ShotId) => void;
  setPurpose: (purpose: PurposeId) => void;
  addCast: (castId: string) => void;
  updateCast: (key: string, patch: CastPatch) => void;
  cyclePose: (key: string) => void;
  removeCast: (key: string) => void;
  addProp: (propId: string) => void;
  updateProp: (key: string, patch: PropPatch) => void;
  removeProp: (key: string) => void;
  toggleOverlay: (id: OverlayId) => void;
  addBalloon: (kind: BalloonKind, text?: string) => void;
  addSfx: (label: string) => void;
  setLine: (text: string) => void;
  updateBalloon: (id: string, patch: Partial<{ text: string; x: number; y: number; kind: BalloonKind }>) => void;
  removeBalloon: (id: string) => void;
  setGlitch: (msg: string | null) => void;
  pulseJuice: () => void;
  bumpStreak: () => void;
  saveComic: () => void;
  deleteComic: (id: string) => void;
  runDemo: () => void;
  cancelDemo: () => void;
};

function remapLayout(page: Page, layoutId: string): Page {
  const layout = getLayout(layoutId);
  const next = layout.cells.map((_, i) => page.panels[i] ?? emptyPanel());
  return { ...page, layoutId, panels: next };
}

function draftHasWork(comic: Comic) {
  if (comic.coverStamped || comic.finished) return true;
  if (comic.title.trim() || comic.coverSceneId || comic.coverCastId) return true;
  return comic.pages.some((page) => page.panels.some(panelAlive));
}

function trimEmptyTail(comic: Comic): Comic {
  const pages = comic.pages
    .map((page) => {
      let panels = page.panels;
      while (panels.length > 1 && !panelAlive(panels[panels.length - 1])) {
        panels = panels.slice(0, -1);
      }
      if (panels.length === 1 && !panelAlive(panels[0])) return { ...page, panels };
      const layoutId = layoutIdForCount(panels.length);
      return remapLayout({ ...page, panels }, layoutId);
    })
    .filter((page, i, arr) => {
      if (i === 0) return true;
      return page.panels.some(panelAlive) || i < arr.length - 1;
    });
  const kept = pages.filter((page, i) => i === 0 || page.panels.some(panelAlive));
  return {
    ...comic,
    pages: kept.length ? kept : pages,
    pageIndex: Math.min(comic.pageIndex, Math.max(0, kept.length - 1)),
  };
}

function mapCurrentPage(draft: Comic, fn: (page: Page) => Page): Comic {
  const pages = draft.pages.map((p, i) => (i === draft.pageIndex ? fn(p) : p));
  return { ...draft, pages, updatedAt: Date.now() };
}

export const useComicStore = create<State>((set, get) => ({
  comics: [],
  draft: null,
  seenHint: false,
  bestStreak: 0,
  hydrated: false,
  view: "cover",
  selectedPanelId: null,
  selectedBalloonId: null,
  selectedCastKey: null,
  selectedPropKey: null,
  coach: null,
  streak: 0,
  glitch: null,
  highlight: null,
  celebrate: false,
  fork: false,
  hookLock: false,
  juice: false,
  demoPlaying: false,
  demoTimer: null,

  hydrate: () => {
    if (get().hydrated) return;
    const p = load();
    set({
      ...p,
      hydrated: true,
      view: p.draft ? (p.draft.coverStamped ? "page" : "cover") : "cover",
      celebrate: false,
      fork: false,
      hookLock: false,
      juice: false,
      coach: null,
    });
  },
  persist: () => {
    const { comics, draft, seenHint, bestStreak } = get();
    save({ comics, draft, seenHint, bestStreak });
  },

  startMission: (missionId) => {
    const current = get().draft;
    if (current && draftHasWork(current)) {
      const comics = [{ ...current, updatedAt: Date.now() }, ...get().comics.filter((c) => c.id !== current.id)].slice(
        0,
        24,
      );
      set({ comics });
    }
    unlockAudio();
    const comic: Comic = {
      id: uid("comic"),
      missionId,
      title: "",
      coverSceneId: null,
      coverCastId: null,
      coverStamped: false,
      directorNote: null,
      finished: false,
      pageIndex: 0,
      pages: [makePage("splash")],
      updatedAt: Date.now(),
    };
    set({
      draft: comic,
      selectedPanelId: comic.pages[0].panels[0]?.id ?? null,
      selectedBalloonId: null,
      selectedCastKey: null,
      selectedPropKey: null,
      view: "cover",
      celebrate: false,
      fork: false,
      hookLock: false,
      juice: false,
      coach: "Stamp the cover first. A place, a face, a name.",
      streak: 0,
      glitch: null,
      highlight: null,
    });
    get().persist();
    sfx.open();
  },

  loadComic: (id) => {
    const comic = get().comics.find((c) => c.id === id);
    if (!comic) return;
    const clone = structuredClone(comic);
    set({
      draft: clone,
      selectedPanelId: comic.pages[comic.pageIndex]?.panels[0]?.id ?? null,
      view: "page",
      celebrate: false,
      coach: "Jump into a glowing box to change it.",
      streak: 0,
      glitch: null,
    });
  },

  openBook: () => {
    unlockAudio();
    const draft = get().draft;
    const page = draft?.pages[draft.pageIndex];
    const target = page ? (nextEmptyPanel(page) ?? page.panels[0]) : null;
    set({
      seenHint: true,
      view: target ? "inside" : "page",
      selectedPanelId: target?.id ?? null,
      celebrate: false,
      coach: "You're inside. Pick a place. The room lights up.",
    });
    get().persist();
    sfx.open();
  },

  enterPanel: (id) => {
    unlockAudio();
    set({
      selectedPanelId: id,
      selectedBalloonId: null,
      selectedCastKey: null,
      selectedPropKey: null,
      view: "inside",
      celebrate: false,
      fork: false,
      highlight: "panel",
    });
    sfx.open();
  },

  exitPanel: () => {
    const draft = get().draft;
    const page = draft?.pages[draft.pageIndex];
    const next = page ? nextEmptyPanel(page) : null;
    set({
      view: "page",
      selectedCastKey: null,
      selectedPropKey: null,
      highlight: null,
      fork: false,
      coach: next
        ? "Tap the glowing box. That's the next room."
        : "Add another box, or finish on a close-up.",
    });
    sfx.check();
    get().persist();
  },

  stampAndAdvance: () => {
    const draft = get().draft;
    const panel = selectedPanel(get());
    if (!draft || !panel) return;
    const isFirst = draft.pages[0]?.panels[0]?.id === panel.id;
    const hookLock = get().hookLock;

    if (!panel.shot) {
      get().setShot(hookLock ? "close" : isFirst ? "wide" : "medium");
    }
    if (hookLock) get().setPurpose("reveal");

    get().pulseJuice();
    sfx.stamp();
    get().persist();

    const latest = get().draft;
    const now = selectedPanel(get());
    if (!latest || !now) return;

    if (hookLock && lastIsHook(now)) {
      get().finishBook();
      return;
    }

    set({
      fork: true,
      coach: "Add another box, or finish the book on a close-up.",
    });
  },

  addBox: () => {
    const draft = get().draft;
    if (!draft) return;
    if (totalBoxes(draft) >= MAX_BOXES) {
      set({ glitch: "Whoa. That's a graphic novel already. Finish this issue." });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("Whoa")) set({ glitch: null });
      }, 2400);
      return;
    }
    const lastPageIndex = draft.pages.length - 1;
    const lastPage = draft.pages[lastPageIndex];
    let nextDraft: Comic;
    let newId: string;

    if (lastPage.panels.length < 3) {
      const panels = [...lastPage.panels, emptyPanel()];
      const layoutId = layoutIdForCount(panels.length);
      const nextPage = remapLayout({ ...lastPage, panels }, layoutId);
      newId = nextPage.panels.at(-1)!.id;
      nextDraft = {
        ...draft,
        pages: draft.pages.map((p, i) => (i === lastPageIndex ? nextPage : p)),
        pageIndex: lastPageIndex,
        updatedAt: Date.now(),
        finished: false,
      };
    } else {
      const page = makePage("splash");
      newId = page.panels[0]!.id;
      const pages = [...draft.pages, page];
      nextDraft = {
        ...draft,
        pages,
        pageIndex: pages.length - 1,
        updatedAt: Date.now(),
        finished: false,
      };
    }

    set({
      draft: nextDraft,
      selectedPanelId: newId,
      selectedBalloonId: null,
      selectedCastKey: null,
      selectedPropKey: null,
      view: "inside",
      fork: false,
      hookLock: false,
      celebrate: false,
      highlight: "panel",
      coach: "New box. Empty paper. Pick a place.",
    });
    get().pulseJuice();
    get().persist();
    sfx.open();
    get().bumpStreak();
  },

  addPage: () => {
    get().addBox();
  },

  finishBook: () => {
    const draft = get().draft;
    if (!draft) return;
    const last = lastAlivePanel(draft);
    if (!last) {
      set({ glitch: "Stamp at least one box first." });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("Stamp at least")) set({ glitch: null });
      }, 2200);
      return;
    }
    if (!lastIsHook(last)) {
      const pageIndex = draft.pages.findIndex((p) => p.panels.some((x) => x.id === last.id));
      set({
        glitch: "Oops — last box needs a close-up. That's the hook that turns the page.",
        hookLock: true,
        fork: false,
        view: "inside",
        selectedPanelId: last.id,
        selectedCastKey: null,
        selectedPropKey: null,
        draft: { ...draft, pageIndex: pageIndex < 0 ? draft.pageIndex : pageIndex },
        coach: "Close-ups show the feeling. Pick Close-Up to finish the book.",
      });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("Oops")) set({ glitch: null });
      }, 2800);
      return;
    }

    const trimmed = trimEmptyTail(draft);
    const note = directorNoteFor(trimmed);
    const saved = {
      ...trimmed,
      directorNote: note,
      finished: true,
      updatedAt: Date.now(),
    };
    const comics = [saved, ...get().comics.filter((c) => c.id !== saved.id)].slice(0, 24);
    set({
      draft: saved,
      comics,
      view: "page",
      celebrate: true,
      fork: false,
      hookLock: false,
      highlight: null,
      selectedCastKey: null,
      selectedPropKey: null,
      coach: "That's a book. Flip it.",
    });
    get().persist();
    sfx.streak();
  },

  stampCover: () => {
    const draft = get().draft;
    if (!draft) return;
    if (!draft.coverSceneId || !draft.coverCastId || !draft.title.trim()) {
      set({ glitch: "A cover needs a place, a face, and a name." });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("A cover needs")) set({ glitch: null });
      }, 2400);
      return;
    }
    const first = draft.pages[0]?.panels[0];
    let next = { ...draft, coverStamped: true, updatedAt: Date.now() };
    if (first && !first.sceneId) {
      next = {
        ...next,
        pages: next.pages.map((page, i) =>
          i === 0
            ? {
                ...page,
                panels: page.panels.map((p, j) => (j === 0 ? { ...p, sceneId: draft.coverSceneId } : p)),
              }
            : page,
        ),
      };
    }
    set({
      draft: next,
      juice: true,
      coach: "Cover stamped. We fall into the first box.",
    });
    get().pulseJuice();
    sfx.stamp();
    get().persist();
    window.setTimeout(() => {
      if (get().draft?.id !== next.id) return;
      get().openBook();
    }, 380);
  },

  setCoverScene: (id) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, coverSceneId: id, updatedAt: Date.now() } });
    sfx.place();
    get().pulseJuice();
  },

  setCoverCast: (id) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, coverCastId: id, updatedAt: Date.now() } });
    sfx.place();
    get().pulseJuice();
  },

  goToPage: (index) => {
    const draft = get().draft;
    if (!draft) return;
    const i = Math.max(0, Math.min(draft.pages.length - 1, index));
    const page = draft.pages[i];
    set({
      draft: { ...draft, pageIndex: i },
      selectedPanelId: page.panels[0]?.id ?? null,
      view: "page",
      celebrate: false,
    });
  },

  dismissCelebrate: () => set({ celebrate: false }),

  markHintSeen: () => {
    set({ seenHint: true });
    get().persist();
  },

  selectPanel: (id) => {
    set({ selectedPanelId: id, selectedBalloonId: null, selectedCastKey: null, selectedPropKey: null });
    if (id) sfx.tap();
  },

  setCoach: (line) => set({ coach: line }),

  setLayout: (layoutId) => {
    const draft = get().draft;
    if (!draft) return;
    const next = mapCurrentPage(draft, (p) => remapLayout(p, layoutId));
    set({ draft: next, selectedPanelId: next.pages[draft.pageIndex].panels[0]?.id ?? null });
    get().persist();
    get().bumpStreak();
  },

  setTitle: (title) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, title, updatedAt: Date.now() } });
  },

  patchPanel: (panelId, patch) => {
    const draft = get().draft;
    if (!draft) return;
    const next = mapCurrentPage(draft, (page) => ({
      ...page,
      panels: page.panels.map((p) => (p.id === panelId ? { ...p, ...patch } : p)),
    }));
    set({ draft: next });
    get().persist();
    const report = evaluateCraft(next);
    if (report.glitch && report.glitch !== get().glitch) {
      set({ glitch: report.glitch });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch === report.glitch) set({ glitch: null });
      }, 2400);
    }
  },

  applySceneToPage: (sceneId) => {
    const draft = get().draft;
    if (!draft) return;
    const next = mapCurrentPage(draft, (page) => ({
      ...page,
      panels: page.panels.map((p) => ({ ...p, sceneId })),
    }));
    set({ draft: next });
    get().persist();
    sfx.place();
    get().bumpStreak();
  },

  setScene: (sceneId) => {
    const panel = selectedPanel(get());
    const draft = get().draft;
    if (!draft) return;
    const page = draft.pages[draft.pageIndex];
    const blank = page.panels.every((p) => !p.sceneId);
    if (blank && sceneId) {
      get().applySceneToPage(sceneId);
      set({ coach: "The whole page is this place now. Other boxes start here." });
      return;
    }
    if (!panel) {
      set({ glitch: "Jump into a box first." });
      sfx.glitch();
      return;
    }
    get().patchPanel(panel.id, { sceneId });
    sfx.place();
    get().bumpStreak();
  },

  setShot: (shot) => {
    const panel = selectedPanel(get());
    const draft = get().draft;
    if (!panel || !draft) return;
    if (boxNumber(draft, panel.id) === 2 && shot !== "close" && shot !== "extreme-close") {
      set({ glitch: "How do we build tension here? Pick a close-up." });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("How do we build")) set({ glitch: null });
      }, 2400);
      return;
    }
    const size = sizeForShot(shot);
    get().patchPanel(panel.id, {
      shot,
      cast: panel.cast.map((c) => ({ ...c, size })),
    });
    const why = SHOTS.find((s) => s.id === shot)?.why ?? null;
    set({ coach: why });
    sfx.place();
    get().bumpStreak();
  },

  setPurpose: (purpose) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, { purpose });
    get().bumpStreak();
  },

  addCast: (castId) => {
    const panel = selectedPanel(get());
    if (!panel) {
      set({ glitch: "Jump into a box, then drop someone in." });
      sfx.glitch();
      return;
    }
    const existing = panel.cast.find((c) => c.id === castId);
    if (existing) {
      set({ selectedCastKey: existing.key, selectedPropKey: null, selectedBalloonId: null });
      sfx.tap();
      return;
    }
    const slots = [28, 62, 46, 78];
    const placed = {
      id: castId,
      key: uid("cast"),
      x: slots[panel.cast.length % slots.length],
      y: 82,
      size: sizeForShot(panel.shot),
      flip: panel.cast.length % 2 === 1,
      rotate: 0,
      pose: 0 as const,
    };
    get().patchPanel(panel.id, { cast: [...panel.cast, placed] });
    set({
      selectedCastKey: placed.key,
      selectedPropKey: null,
      selectedBalloonId: null,
      coach: "Tap them again for Idle, Action, or React. Flip them toward the action.",
    });
    sfx.place();
    get().pulseJuice();
    get().bumpStreak();
  },

  updateCast: (key, patch) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, {
      cast: panel.cast.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    });
  },

  cyclePose: (key) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    const actor = panel.cast.find((c) => c.key === key);
    if (!actor) return;
    const pose = nextPose(actor.pose);
    const def = POSES[pose];
    get().updateCast(key, { pose });
    set({ coach: `${def.name}. ${def.why}` });
    sfx.tap();
    get().pulseJuice();
  },

  removeCast: (key) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, { cast: panel.cast.filter((c) => c.key !== key) });
    set({ selectedCastKey: null });
  },

  addProp: (propId) => {
    const panel = selectedPanel(get());
    if (!panel) {
      set({ glitch: "Jump into a box, then drop stuff in." });
      sfx.glitch();
      return;
    }
    const def = getProp(propId);
    if (!def) return;
    const list = panel.props ?? [];
    if ((propId === "rain" || propId === "fog") && list.some((p) => p.id === propId)) {
      get().patchPanel(panel.id, { props: list.filter((p) => p.id !== propId) });
      set({ selectedPropKey: null, coach: "Pulled it back out." });
      sfx.tap();
      return;
    }
    if (list.length >= MAX_PROPS) {
      set({ glitch: "Too much stuff. Keep the ones that tell the story." });
      sfx.glitch();
      return;
    }
    const slots = [24, 52, 78, 38, 66];
    const placed: PlacedProp = {
      id: propId,
      key: uid("prop"),
      x: slots[list.length % slots.length],
      y: def.y,
      size: def.size,
      flip: false,
      rotate: 0,
    };
    get().patchPanel(panel.id, { props: [...list, placed] });
    set({
      selectedPropKey: placed.key,
      selectedCastKey: null,
      selectedBalloonId: null,
      coach: def.why,
    });
    sfx.place();
    get().pulseJuice();
    get().bumpStreak();
  },

  updateProp: (key, patch) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, {
      props: (panel.props ?? []).map((p) => (p.key === key ? { ...p, ...patch } : p)),
    });
  },

  removeProp: (key) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, { props: (panel.props ?? []).filter((p) => p.key !== key) });
    set({ selectedPropKey: null });
  },

  toggleOverlay: (id) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    const has = panel.overlays.includes(id);
    get().patchPanel(panel.id, {
      overlays: has ? panel.overlays.filter((o) => o !== id) : [...panel.overlays, id],
    });
    sfx.place();
  },

  addBalloon: (kind, text = "") => {
    const panel = selectedPanel(get());
    if (!panel) return;
    const mission = getMission(get().draft!.missionId);
    if (!mission.allowSpeech && kind !== "sfx") {
      set({ glitch: "Silent page. Pictures only." });
      sfx.glitch();
      return;
    }
    if (kind !== "sfx" && kind !== "caption") {
      const lock = wordsLockLine(panel);
      if (lock) {
        set({ glitch: lock });
        sfx.glitch();
        window.setTimeout(() => {
          if (get().glitch === lock) set({ glitch: null });
        }, 2600);
        return;
      }
    }
    const speaker = panel.cast[0];
    const sfxCount = panel.balloons.filter((b) => b.kind === "sfx").length;
    const balloon = {
      id: uid("b"),
      kind,
      text,
      x: kind === "caption" ? 50 : kind === "sfx" ? Math.max(22, 82 - sfxCount * 14) : speaker ? speaker.x : 50,
      y: kind === "caption" ? 88 : kind === "sfx" ? Math.min(48, 18 + sfxCount * 12) : speaker ? Math.max(16, speaker.y - 50) : 20,
    };
    get().patchPanel(panel.id, { balloons: [...panel.balloons, balloon] });
    set({ selectedBalloonId: balloon.id, selectedCastKey: null, selectedPropKey: null });
    if (kind === "sfx") {
      sfx.kaboom();
      get().pulseJuice();
    } else {
      sfx.place();
    }
  },

  addSfx: (label) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    const n = panel.balloons.filter((b) => b.kind === "sfx").length;
    if (n >= 4) {
      set({ glitch: "One shout is louder than five. Keep the loudest." });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch?.startsWith("One shout")) set({ glitch: null });
      }, 2200);
      return;
    }
    get().addBalloon("sfx", label);
    set({ coach: `${label}. Stamp it on the picture.` });
  },

  setLine: (text) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    const lock = wordsLockLine(panel);
    if (lock && text.trim()) {
      set({ glitch: lock });
      sfx.glitch();
      window.setTimeout(() => {
        if (get().glitch === lock) set({ glitch: null });
      }, 2600);
      return;
    }
    const existing = panel.balloons.find((b) => b.kind !== "sfx");
    if (existing) get().updateBalloon(existing.id, { text });
    else get().addBalloon("speech", text);
  },

  updateBalloon: (id, patch) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, {
      balloons: panel.balloons.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  },

  removeBalloon: (id) => {
    const panel = selectedPanel(get());
    if (!panel) return;
    get().patchPanel(panel.id, { balloons: panel.balloons.filter((b) => b.id !== id) });
    set({ selectedBalloonId: null });
  },

  setGlitch: (msg) => {
    set({ glitch: msg });
    if (msg) sfx.glitch();
  },

  pulseJuice: () => {
    set({ juice: true });
    window.setTimeout(() => {
      if (get().juice) set({ juice: false });
    }, 360);
  },

  bumpStreak: () => {
    const streak = get().streak + 1;
    const bestStreak = Math.max(get().bestStreak, streak);
    set({ streak, bestStreak });
    if (streak > 0 && streak % 3 === 0) sfx.streak();
    get().persist();
  },

  saveComic: () => {
    const draft = get().draft;
    if (!draft) return;
    const saved = { ...draft, updatedAt: Date.now() };
    const comics = [saved, ...get().comics.filter((c) => c.id !== saved.id)].slice(0, 24);
    set({ comics, draft: saved });
    get().persist();
    sfx.check();
  },

  deleteComic: (id) => {
    set({ comics: get().comics.filter((c) => c.id !== id) });
    get().persist();
  },

  cancelDemo: () => {
    const t = get().demoTimer;
    if (t) window.clearTimeout(t);
    set({ demoPlaying: false, demoTimer: null, highlight: null });
  },

  runDemo: () => {
    get().cancelDemo();
    const draft = get().draft;
    if (!draft) return;
    unlockAudio();
    const fresh: Comic = {
      ...draft,
      title: "NEON RAIN",
      coverSceneId: "story-street",
      coverCastId: "shade-leopard",
      coverStamped: true,
      finished: false,
      directorNote: null,
      pageIndex: 0,
      pages: [makePage("splash")],
      updatedAt: Date.now(),
    };
    const p0 = fresh.pages[0].panels[0];
    set({
      draft: fresh,
      selectedPanelId: p0.id,
      selectedBalloonId: null,
      selectedCastKey: null,
      selectedPropKey: null,
      view: "cover",
      celebrate: false,
      fork: false,
      hookLock: false,
    });
    const mission = getMission(fresh.missionId);
    const steps: DemoStep[] = [
      {
        delay: 500,
        run: () => {
          get().pulseJuice();
          sfx.stamp();
          set({ coach: "Cover stamped. Shade on Story Street." });
        },
      },
      {
        delay: 800,
        run: () => {
          get().openBook();
          set({ coach: "Jump in. The room is already the cover's street." });
        },
      },
      {
        delay: 800,
        run: () => {
          get().patchPanel(p0.id, { shot: "wide", purpose: "setup", sceneId: "story-street" });
          set({ coach: "Wide shots show the world." });
        },
      },
      {
        delay: 700,
        run: () => {
          get().addCast("shade-leopard");
        },
      },
      {
        delay: 700,
        run: () => {
          get().addProp("bike");
          set({ coach: "A bike on the street. Stuff tells the story too." });
        },
      },
      {
        delay: 800,
        run: () => {
          if (mission.allowSpeech) get().setLine("Rain again.");
        },
      },
      {
        delay: 700,
        run: () => {
          get().addBox();
          set({ coach: "Add next box. The story keeps going." });
        },
      },
      {
        delay: 900,
        run: () => {
          const panel = selectedPanel(get());
          if (!panel) return;
          get().patchPanel(panel.id, { shot: "close", purpose: "reveal", sceneId: "story-street" });
          get().addCast("amanda-anaconda");
          set({ coach: "Close-ups show the feeling. That's the hook." });
        },
      },
      {
        delay: 800,
        run: () => {
          get().addSfx("KABOOM");
        },
      },
      {
        delay: 1000,
        run: () => {
          get().exitPanel();
          set({
            demoPlaying: false,
            demoTimer: null,
            fork: false,
            coach: "Your turn. Stamp boxes. Finish on a close-up.",
          });
        },
      },
    ];
    set({ demoPlaying: true });
    let i = 0;
    const tick = () => {
      if (!get().demoPlaying) return;
      if (i >= steps.length) {
        set({ demoPlaying: false, demoTimer: null });
        return;
      }
      const step = steps[i];
      step.run();
      i += 1;
      const id = window.setTimeout(tick, step.delay);
      set({ demoTimer: id });
    };
    tick();
  },
}));

function selectedPanel(s: State): Panel | null {
  const d = s.draft;
  if (!d || !s.selectedPanelId) return null;
  return d.pages[d.pageIndex]?.panels.find((p) => p.id === s.selectedPanelId) ?? null;
}

export function useSelectedPanel() {
  return useComicStore((s) => {
    const d = s.draft;
    if (!d || !s.selectedPanelId) return null;
    return d.pages[d.pageIndex]?.panels.find((p) => p.id === s.selectedPanelId) ?? null;
  });
}

export function useCurrentPage() {
  return useComicStore((s) => {
    const d = s.draft;
    if (!d) return null;
    return d.pages[d.pageIndex] ?? null;
  });
}
