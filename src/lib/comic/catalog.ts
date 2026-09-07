import type {
  CastMember,
  Layout,
  Mission,
  OverlayId,
  PropDef,
  PropKind,
  PurposeId,
  Scene,
  ShotId,
} from "./types";

export const SHOTS: {
  id: ShotId;
  name: string;
  chip: string;
  why: string;
}[] = [
  {
    id: "establishing",
    name: "Establish",
    chip: "Est",
    why: "Wide shots show the world. The reader needs the room.",
  },
  {
    id: "wide",
    name: "Wide",
    chip: "Wide",
    why: "Wide shots show the world. The reader needs the room.",
  },
  {
    id: "medium",
    name: "Medium",
    chip: "Med",
    why: "Medium shots show the move — from the waist up.",
  },
  {
    id: "close",
    name: "Close-Up",
    chip: "Close",
    why: "Close-ups show the feeling on a face. That's how you crank the tension.",
  },
  {
    id: "extreme-close",
    name: "X-Close",
    chip: "X",
    why: "One detail that matters: an eye, a key, a cracked screen.",
  },
  {
    id: "over-shoulder",
    name: "Over-shoulder",
    chip: "O/S",
    why: "Two people talking. We stand with one of them.",
  },
  {
    id: "dutch",
    name: "Dutch",
    chip: "Tilt",
    why: "The world is off-balance. Use it once, then earn it.",
  },
];

export const PURPOSES: { id: PurposeId; name: string; why: string }[] = [
  { id: "setup", name: "Setup", why: "The reader needs the board before the move." },
  { id: "action", name: "Action", why: "Something happens. Keep the camera moving." },
  { id: "reaction", name: "Reaction", why: "The feeling after the hit. Often a close-up." },
  { id: "reveal", name: "Reveal", why: "New information. Best in the last panel." },
  { id: "beat", name: "Beat", why: "A pause. Silence can be the loudest panel." },
];

export const LAYOUTS: Layout[] = [
  {
    id: "splash",
    name: "Splash",
    hint: "One big moment. Use it when the picture is the sentence.",
    columns: 1,
    rows: 1,
    cells: [{ col: 1, row: 1, colSpan: 1, rowSpan: 1 }],
  },
  {
    id: "stack",
    name: "Stack",
    hint: "Before and after. Time drops straight down.",
    columns: 1,
    rows: 2,
    cells: [
      { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "three-beat",
    name: "Three Beat",
    hint: "Setup, action, punch. The last panel is the hook.",
    columns: 1,
    rows: 3,
    cells: [
      { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "four-square",
    name: "Four Square",
    hint: "A conversation grid. Change who owns the frame.",
    columns: 2,
    rows: 2,
    cells: [
      { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "banner-two",
    name: "Banner",
    hint: "Establish on top. Split the beat below.",
    columns: 2,
    rows: 2,
    cells: [
      { col: 1, row: 1, colSpan: 2, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "inset",
    name: "Inset",
    hint: "A wide world plus a close thought. Contrast is the craft.",
    columns: 2,
    rows: 2,
    cells: [
      { col: 1, row: 1, colSpan: 1, rowSpan: 2 },
      { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "cinematic",
    name: "Cinematic",
    hint: "A hero panel, then two cuts. Feels like a movie page.",
    columns: 3,
    rows: 2,
    cells: [
      { col: 1, row: 1, colSpan: 3, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 2, colSpan: 2, rowSpan: 1 },
    ],
  },
  {
    id: "six-pack",
    name: "Six Pack",
    hint: "A full page. Change the camera or it reads like a flipbook.",
    columns: 2,
    rows: 3,
    cells: [
      { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
      { col: 1, row: 3, colSpan: 1, rowSpan: 1 },
      { col: 2, row: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
];

export const ME_BOT_SRC = "/art/bot/me-bot.webp";
export const ME_BOT_HUD_SRC = "/art/bot/me-bot-hud.webp";
export const ME_BOT_CHEER_SRC = "/art/bot/me-bot-cheer-hud.webp";

export const CAST: CastMember[] = [
  { id: "nova-mouse", name: "Nova the Mouse", short: "Nova", role: "Star-blaster", src: "/art/cast/nova-mouse.webp", side: "hero" },
  { id: "shade-leopard", name: "Shade the Leopard", short: "Shade", role: "Vine-caster", src: "/art/cast/shade-leopard.webp", side: "hero" },
  { id: "tide-diver", name: "Tide the Diver", short: "Tide", role: "Water-bender", src: "/art/cast/tide-diver.webp", side: "hero" },
  { id: "blaze-rooster", name: "Blaze the Rooster", short: "Blaze", role: "Firewing", src: "/art/cast/blaze-rooster.webp", side: "hero" },
  { id: "crimson-claw", name: "Crimson Claw", short: "Crimson", role: "Thunder claws", src: "/art/cast/crimson-claw.webp", side: "hero" },
  { id: "dylynn-duckling", name: "Dylynn the Duckling", short: "Dylynn", role: "Water runner", src: "/art/cast/dylynn-duckling.webp", side: "hero" },
  { id: "volt-meerkat", name: "Volt the Meerkat", short: "Volt", role: "Lookout", src: "/art/cast/volt-meerkat.webp", side: "hero" },
  { id: "logan-lobster", name: "Logan the Lobster", short: "Logan", role: "Storm-claws", src: "/art/cast/logan-lobster.webp", side: "hero" },
  { id: "bruno-bear", name: "Bruno the Bear", short: "Bruno", role: "Strongest paws", src: "/art/cast/bruno-bear.webp", side: "hero" },
  { id: "me-bot", name: "M.E. Bot", short: "M.E.", role: "Reads the city", src: "/art/bot/me-bot.webp", side: "bot" },
  { id: "blood-moon-cat", name: "Blood Moon", short: "Blood Moon", role: "Rules the rooftops", src: "/art/cast/blood-moon-cat.webp", side: "villain" },
  { id: "amanda-anaconda", name: "Amanda the Anaconda", short: "Amanda", role: "Toxic coils", src: "/art/cast/amanda-anaconda.webp", side: "villain" },
  { id: "chance-chameleon", name: "Chance the Chameleon", short: "Chance", role: "Vanishes, then strikes", src: "/art/cast/chance-chameleon.webp", side: "villain" },
  { id: "nyx-koala", name: "Nyx the Koala", short: "Nyx", role: "Storm-vines", src: "/art/cast/nyx-koala.webp", side: "villain" },
  { id: "razor-raptor", name: "Razor the Raptor", short: "Razor", role: "Acid-green claws", src: "/art/cast/razor-raptor.webp", side: "villain" },
];

export const HEROES = CAST.filter((c) => c.side !== "villain");
export const VILLAINS = CAST.filter((c) => c.side === "villain");

const STARTER_CREW_IDS = [
  "nova-mouse",
  "shade-leopard",
  "blaze-rooster",
  "tide-diver",
  "crimson-claw",
  "bruno-bear",
] as const;
const STARTER_TROUBLE_IDS = ["amanda-anaconda", "blood-moon-cat", "chance-chameleon"] as const;

export const STARTER_CREW = STARTER_CREW_IDS.map((id) => CAST.find((c) => c.id === id)!);
export const STARTER_TROUBLE = STARTER_TROUBLE_IDS.map((id) => CAST.find((c) => c.id === id)!);
export const MORE_CREW = HEROES.filter((c) => !STARTER_CREW_IDS.includes(c.id as (typeof STARTER_CREW_IDS)[number]));
export const MORE_TROUBLE = VILLAINS.filter(
  (c) => !STARTER_TROUBLE_IDS.includes(c.id as (typeof STARTER_TROUBLE_IDS)[number]),
);

export const SCENES: Scene[] = [
  { id: "story-street", name: "Story Street", mood: "The STORY OF M.E. sign is on. Openings live here.", src: "/art/scenes/story-street.jpg" },
  { id: "steam-alley", name: "Steam Alley", mood: "Narrow, graffiti, secrets.", src: "/art/scenes/steam-alley.jpg" },
  { id: "neon-skyline", name: "Rain-Lit Skyline", mood: "The whole neon city from a wet walkway.", src: "/art/scenes/neon-skyline.jpg" },
  { id: "rooftop", name: "Rooftop", mood: "Billboards, railing, a stand-off.", src: "/art/scenes/rooftop.jpg" },
  { id: "sky-walkway", name: "Sky Walkway", mood: "Glass catwalk. Perfect for a chase.", src: "/art/scenes/sky-walkway.jpg" },
  { id: "container-alley", name: "Container Docks", mood: "Crates and steam pipes. Hiding spots.", src: "/art/scenes/container-alley.jpg" },
  { id: "train-platform", name: "Shin-Meiji Platform", mood: "A getaway. A meet-up. A last train.", src: "/art/scenes/train-platform.jpg" },
  { id: "river-bridge", name: "Mirai Bridge", mood: "Long shot over the neon river.", src: "/art/scenes/river-bridge.jpg" },
  { id: "fountain-plaza", name: "Neko Cafe Plaza", mood: "Holo-cats overhead. Talks and calm before it breaks.", src: "/art/scenes/fountain-plaza.jpg" },
];

export const OVERLAYS: { id: OverlayId; name: string; why: string }[] = [
  { id: "rain", name: "Rain", why: "Weather is mood. Wet streets slow a scene down." },
  { id: "night", name: "Night", why: "Drop the exposure. Secrets live in the dark." },
  { id: "flash", name: "Flash", why: "A burst of light — a camera, lightning, a reveal." },
  { id: "speed-left", name: "Speed L", why: "Motion lines. The subject is moving left, fast." },
  { id: "speed-right", name: "Speed R", why: "Motion lines the other way. Pick a direction and commit." },
  { id: "vignette", name: "Focus", why: "Dark edges pull the eye to the middle. Use on a close-up." },
  { id: "burst", name: "Impact", why: "A hit, a shout, a door slam. One panel, not every panel." },
];

function prop(
  id: string,
  name: string,
  why: string,
  kind: PropKind,
  size: number,
  y: number,
  layer: "back" | "front" = "back",
): PropDef {
  return { id, name, why, src: `/art/props/${id}.webp`, kind, size, y, layer };
}

export const PROPS: PropDef[] = [
  prop("bike", "Bike", "A getaway. Or they just rolled up.", "ride", 44, 82),
  prop("car", "Racer", "Fast. Someone is leaving — or arriving.", "ride", 48, 80),
  prop("bus", "Bus", "A whole crowd in one picture.", "ride", 50, 80),
  prop("taxi", "Taxi", "Hail it. Miss it. Chase it.", "ride", 48, 80),
  prop("truck", "Truck", "Heavy. Blocking the alley.", "ride", 50, 80),
  prop("police", "Cruiser", "Trouble just pulled up.", "ride", 46, 80),
  prop("train", "Train", "Last car. Don't miss it.", "ride", 52, 78),
  prop("boat", "Boat", "The river is a way out.", "ride", 44, 82),
  prop("helicopter", "Copter", "Someone is watching from above.", "ride", 40, 28, "front"),
  prop("rocket", "Rocket", "This page just got bigger.", "ride", 48, 36, "front"),
  prop("drone", "Drone", "A tiny eye in the sky.", "ride", 26, 26, "front"),

  prop("bench", "Bench", "A place to wait. Or hide in plain sight.", "city", 38, 82),
  prop("barrel", "Barrel", "Something is in it. Or about to blow.", "city", 32, 82),
  prop("crate", "Crate", "Hide behind it. Stack it. Kick it over.", "city", 34, 82),
  prop("door", "Door", "Who is on the other side?", "city", 68, 55),
  prop("ladder", "Ladder", "Up or down. The page can climb.", "city", 58, 60),
  prop("trash", "Can", "City floor. Someone dumped a clue.", "city", 28, 84),
  prop("streetlight", "Lamp", "A pool of light. Stand in it — or out of it.", "city", 72, 52),
  prop("trafficlight", "Lights", "Stop. Go. The street decides.", "city", 40, 38, "front"),
  prop("warning", "Warning", "The sign already knows.", "city", 30, 48, "front"),
  prop("sign", "Sign", "Blank neon. Write the street with the picture.", "city", 34, 40, "front"),
  prop("antenna", "Dish", "The city is listening.", "city", 40, 28, "front"),

  prop("flashlight", "Light", "Point it. The dark has a hole now.", "gear", 22, 70, "front"),
  prop("lantern", "Lantern", "A quiet glow. Old-school scared.", "gear", 24, 70, "front"),
  prop("phone", "Phone", "A call. A photo. A last message.", "gear", 18, 62, "front"),
  prop("map", "Map", "They are lost — or they just found it.", "gear", 32, 58, "front"),
  prop("case", "Case", "Locked. What is inside is the plot.", "gear", 28, 74, "front"),
  prop("key", "Key", "X-close gold. This opens the next page.", "gear", 20, 58, "front"),
  prop("chip", "Chip", "The thing everyone wants.", "gear", 20, 56, "front"),
  prop("tools", "Wrench", "Fix it. Or smash it.", "gear", 22, 70, "front"),
  prop("plant", "Plant", "Life in the neon. Soften a hard room.", "gear", 36, 82),

  prop("rain", "Rain", "Wet streets. Slow the scene down.", "sky", 108, 50, "front"),
  prop("fog", "Fog", "You can't see far. That's the point.", "sky", 108, 50, "front"),
  prop("storm", "Storm", "Lightning over the city. One panel, then earn it.", "sky", 64, 30, "front"),
  prop("smoke", "Smoke", "Something already happened.", "sky", 48, 40, "front"),
  prop("moon", "Moon", "Night is on. Put it high.", "sky", 34, 20, "front"),
  prop("sun", "Sun", "Harsh light. Noon has no secrets — except this one.", "sky", 38, 20, "front"),
  prop("star", "Stars", "A sparkle. Use it when the night wins.", "sky", 48, 26, "front"),

  prop("explosion", "BOOM", "The hit. One panel. Not every panel.", "hit", 56, 50, "front"),
  prop("fire", "Fire", "The room is not safe.", "hit", 42, 72, "front"),
  prop("collision", "BAM", "Impact lines. Someone got hit.", "hit", 58, 48, "front"),
  prop("spark", "Spark", "Power just went wrong.", "hit", 70, 48, "front"),
  prop("hole", "Hole", "The floor gave up.", "hit", 48, 78),
  prop("bomb", "Timer", "The clock is running out.", "hit", 28, 48, "front"),
];

export const PROP_KINDS: { id: PropKind; label: string }[] = [
  { id: "ride", label: "Rides" },
  { id: "city", label: "City" },
  { id: "gear", label: "Gear" },
  { id: "sky", label: "Sky" },
  { id: "hit", label: "Hits" },
];

export const SFX_STAMPS: { label: string; why: string }[] = [
  { label: "KABOOM", why: "The hit. One panel. Not every panel." },
  { label: "POW", why: "A punch. Short and loud." },
  { label: "BAM", why: "Impact. Someone got hit." },
  { label: "WHOOSH", why: "Someone moves, fast." },
  { label: "SNEAK", why: "Quiet feet. Don't wake the page." },
  { label: "GASP", why: "They just saw it." },
  { label: "CRASH", why: "Something broke. The room knows." },
  { label: "SHHH", why: "Someone is listening." },
];

export const MISSIONS: Mission[] = [
  {
    id: "cold-open",
    number: "01",
    title: "Cold Open",
    tag: "Your first book",
    blurb: "Stamp a cover. Jump in. Add boxes. Finish on a close-up.",
    lesson: "Start wide so they know the room. End close so they feel it.",
    why: "Readers decide in three panels whether to keep going. A narrator dump is a closed door. Pictures open it.",
    defaultLayout: "three-beat",
    wordCap: 20,
    allowSpeech: true,
    difficulty: 1,
    botIntro: "Cover first. Then we fall into box 1. Last box is a close-up.",
    objectives: [
      { id: "first-establishing", label: "Panel 1 is an establish or wide shot", hint: "Start with WHERE." },
      { id: "has-character", label: "A character is on the page", hint: "WHO has to appear as a picture." },
      { id: "purpose-early", label: "An action or reveal by panel 4", hint: "The problem has to show up." },
      { id: "word-cap", label: "No balloon over 20 words", hint: "If it is long, it is a lecture." },
      { id: "last-hook", label: "Last panel is a close, X-close, or reveal", hint: "End on a question, not a shrug." },
    ],
  },
  {
    id: "show-dont-tell",
    number: "02",
    title: "Show, Don't Tell",
    tag: "Faces talk",
    blurb: "Faces do the talking. Keep the words tiny.",
    lesson: "Faces and cameras carry feeling. Words only support.",
    why: "If you write 'she was angry,' you stole a close-up. Let the picture do the verb.",
    defaultLayout: "four-square",
    wordCap: 12,
    allowSpeech: true,
    difficulty: 1,
    botIntro: "Twelve words max. One silent panel. Two close shots. That is the whole lesson.",
    objectives: [
      { id: "two-close", label: "At least two close or X-close shots", hint: "Feeling needs distance change." },
      { id: "word-cap", label: "Every balloon is 12 words or fewer", hint: "Cut until it stings a little." },
      { id: "silent-panel", label: "One silent panel", hint: "A panel with no speech, thought, or caption." },
      { id: "shot-variety-2", label: "At least two different cameras", hint: "Same shot twice is a stuck zoom." },
    ],
  },
  {
    id: "gutter-time",
    number: "03",
    title: "Gutter Time",
    tag: "Time jump",
    blurb: "The space between boxes is time. You control it.",
    lesson: "The empty strip between panels is time. You control how fast the story moves.",
    why: "Two panels of the same street with a jumped clock — the reader feels hours without the word later.",
    defaultLayout: "three-beat",
    wordCap: 16,
    allowSpeech: true,
    difficulty: 2,
    botIntro: "Same place, small change = seconds. New place = a jump. Mark one jump with a caption.",
    objectives: [
      { id: "three-plus", label: "At least three panels", hint: "Time needs a sequence." },
      { id: "same-scene-pair", label: "Two panels share a location", hint: "That pair is seconds or minutes." },
      { id: "scene-change", label: "A location change on the page", hint: "That gutter is a time jump." },
      { id: "time-caption", label: "One caption that marks time", hint: "Later. Two hours. After the bell." },
    ],
  },
  {
    id: "the-turn",
    number: "04",
    title: "The Turn",
    tag: "The twist",
    blurb: "Last box changes everything they thought.",
    lesson: "A page needs a reversal. The last panel changes what the reader thought.",
    why: "Setup is a promise. The turn is the broken promise. That is why people flip the page.",
    defaultLayout: "cinematic",
    wordCap: 18,
    allowSpeech: true,
    difficulty: 2,
    botIntro: "First panels lie a little. Last panel tells the truth. Tension should climb.",
    objectives: [
      { id: "setup-early", label: "A setup panel in the first half", hint: "Promise something." },
      { id: "last-reveal", label: "Last panel purpose is reveal", hint: "That is the turn." },
      { id: "shot-variety-3", label: "Three different cameras", hint: "The turn should feel like a cut." },
      { id: "tension-60", label: "Tension at 60 or higher", hint: "Contrast, silence, and a hook raise it." },
    ],
  },
  {
    id: "silent-page",
    number: "05",
    title: "Silent Page",
    tag: "No words",
    blurb: "Zero talking. The pictures have to speak.",
    lesson: "If a picture can say it, do not write it.",
    why: "Silent pages train you to think in shots. They are the hardest and the most comic.",
    defaultLayout: "six-pack",
    wordCap: 0,
    allowSpeech: false,
    difficulty: 3,
    botIntro: "Zero balloons. Zero captions. Camera distance has to do all the talking.",
    objectives: [
      { id: "zero-speech", label: "No speech, thought, or caption", hint: "SFX impact stamps are the only exception." },
      { id: "five-filled", label: "At least five panels have pictures", hint: "Empty panels are not silence. They are skips." },
      { id: "three-shot-changes", label: "Camera distance changes three times", hint: "Wide then close then wide is a sentence." },
      { id: "last-close", label: "Last panel is a close or X-close", hint: "Land on a face or a detail." },
    ],
  },
  {
    id: "two-voices",
    number: "06",
    title: "Two Voices",
    tag: "Two people",
    blurb: "Two people. Take turns on camera.",
    lesson: "Talk is a tennis match. Alternate who owns the frame.",
    why: "If one face fills every panel, the other person disappeared. Shot reverse-shot keeps both alive.",
    defaultLayout: "four-square",
    wordCap: 16,
    allowSpeech: true,
    difficulty: 2,
    botIntro: "Two people. Take turns on camera. One over-shoulder. One reaction close-up.",
    objectives: [
      { id: "two-characters", label: "Two different characters on the page", hint: "Cast at least two." },
      { id: "over-shoulder-one", label: "One over-shoulder shot", hint: "Stand with a speaker." },
      { id: "reaction-close", label: "One close reaction", hint: "Listening is a shot, not a pause." },
      { id: "word-cap", label: "No balloon over 16 words", hint: "Real talk is short." },
    ],
  },
  {
    id: "free-ink",
    number: "00",
    title: "Free Ink",
    tag: "Make anything",
    blurb: "No assignment. Still a last-box hook.",
    lesson: "No mission. Still a page. Still a camera. Still a last-panel hook.",
    why: "Craft does not clock out because the assignment ended.",
    defaultLayout: "banner-two",
    wordCap: null,
    allowSpeech: true,
    difficulty: 1,
    botIntro: "Your page. I will still flag walls of text and stuck cameras.",
    objectives: [
      { id: "has-picture", label: "At least one panel has a picture", hint: "Start with a place or a person." },
      { id: "has-shot", label: "Every used panel has a camera", hint: "If you placed art, name the shot." },
      { id: "shot-variety-2", label: "Two different cameras", hint: "Even free pages need cuts." },
    ],
  },
];

export const PRIMARY_SHOTS = SHOTS.filter(
  (s) => s.id === "wide" || s.id === "medium" || s.id === "close",
);

export const EXTRA_SHOTS = SHOTS.filter(
  (s) => s.id !== "wide" && s.id !== "medium" && s.id !== "close",
);

export function layoutIdForCount(n: number) {
  if (n <= 1) return "splash";
  if (n === 2) return "stack";
  return "three-beat";
}

export const MAX_BOXES = 24;

export function getMission(id: string) {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}

export function getLayout(id: string) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function getShot(id: ShotId | null) {
  return SHOTS.find((s) => s.id === id) ?? null;
}

export function getScene(id: string | null) {
  return SCENES.find((s) => s.id === id) ?? null;
}

export function getCast(id: string) {
  return CAST.find((c) => c.id === id) ?? null;
}

export function getProp(id: string) {
  return PROPS.find((p) => p.id === id) ?? null;
}

export function propsInKind(kind: PropKind) {
  return PROPS.filter((p) => p.kind === kind);
}

export function sizeForShot(shot: ShotId | null): number {
  if (shot === "extreme-close") return 118;
  if (shot === "close") return 92;
  if (shot === "over-shoulder") return 64;
  if (shot === "wide" || shot === "establishing") return 48;
  if (shot === "dutch") return 72;
  return 70;
}

export const SHOT_RANK: Record<ShotId, number> = {
  establishing: 0,
  wide: 1,
  medium: 2,
  close: 3,
  "extreme-close": 4,
  "over-shoulder": 2.5,
  dutch: 2,
};
