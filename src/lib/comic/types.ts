export type ShotId =
  | "establishing"
  | "wide"
  | "medium"
  | "close"
  | "extreme-close"
  | "over-shoulder"
  | "dutch";

export type PurposeId = "setup" | "action" | "reaction" | "reveal" | "beat";

export type BalloonKind = "speech" | "thought" | "whisper" | "caption" | "sfx";

export type StudioView = "cover" | "page" | "inside";

export type InsideBeat = "where" | "who" | "camera";

export type OverlayId =
  | "rain"
  | "night"
  | "flash"
  | "speed-left"
  | "speed-right"
  | "vignette"
  | "burst";

export type PropKind = "ride" | "city" | "gear" | "sky" | "hit";

export type Balloon = {
  id: string;
  kind: BalloonKind;
  text: string;
  x: number;
  y: number;
};

export type PlacedCast = {
  id: string;
  key: string;
  x: number;
  y: number;
  size: number;
  flip: boolean;
  rotate: number;
  pose: 0 | 1 | 2;
};

export type PlacedProp = {
  id: string;
  key: string;
  x: number;
  y: number;
  size: number;
  flip: boolean;
  rotate: number;
};

export type Panel = {
  id: string;
  shot: ShotId | null;
  purpose: PurposeId | null;
  sceneId: string | null;
  cast: PlacedCast[];
  props: PlacedProp[];
  overlays: OverlayId[];
  balloons: Balloon[];
};

export type Page = {
  id: string;
  layoutId: string;
  panels: Panel[];
};

export type Comic = {
  id: string;
  missionId: string;
  title: string;
  coverSceneId: string | null;
  coverCastId: string | null;
  coverStamped: boolean;
  directorNote: string | null;
  finished: boolean;
  pageIndex: number;
  pages: Page[];
  updatedAt: number;
};

export type ObjectiveDef = {
  id: string;
  label: string;
  hint: string;
};

export type Mission = {
  id: string;
  number: string;
  title: string;
  tag: string;
  blurb: string;
  lesson: string;
  why: string;
  defaultLayout: string;
  wordCap: number | null;
  allowSpeech: boolean;
  difficulty: 1 | 2 | 3;
  objectives: ObjectiveDef[];
  botIntro: string;
};

export type LayoutCell = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

export type Layout = {
  id: string;
  name: string;
  hint: string;
  columns: number;
  rows: number;
  cells: LayoutCell[];
};

export type CastMember = {
  id: string;
  name: string;
  short: string;
  role: string;
  src: string;
  side: "hero" | "villain" | "bot";
};

export type Scene = {
  id: string;
  name: string;
  mood: string;
  src: string;
};

export type PropDef = {
  id: string;
  name: string;
  why: string;
  src: string;
  kind: PropKind;
  size: number;
  y: number;
  layer: "back" | "front";
};

export type ObjectiveResult = ObjectiveDef & { done: boolean };

export type CraftReport = {
  tension: number;
  objectives: ObjectiveResult[];
  notes: string[];
  glitch: string | null;
};
