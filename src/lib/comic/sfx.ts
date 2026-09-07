let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  audio();
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.04, at = 0) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ac.currentTime + at);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

export const sfx = {
  tap: () => {
    beep(190, 0.03, "square", 0.028);
    beep(90, 0.05, "triangle", 0.022, 0.012);
  },
  click: () => {
    beep(210, 0.025, "square", 0.03);
    beep(80, 0.04, "triangle", 0.02, 0.01);
  },
  open: () => beep(280, 0.09, "triangle", 0.035),
  place: () => {
    beep(140, 0.04, "square", 0.03);
    beep(440, 0.06, "square", 0.035, 0.03);
    beep(660, 0.05, "triangle", 0.02, 0.07);
  },
  stamp: () => {
    beep(70, 0.16, "triangle", 0.07);
    beep(160, 0.09, "square", 0.04, 0.03);
    beep(90, 0.08, "sawtooth", 0.02, 0.05);
    beep(520, 0.07, "triangle", 0.025, 0.12);
  },
  kaboom: () => {
    beep(60, 0.22, "sawtooth", 0.06);
    beep(140, 0.12, "square", 0.045, 0.02);
    beep(720, 0.08, "triangle", 0.03, 0.08);
  },
  streak: () => {
    beep(520, 0.06, "square", 0.04);
    beep(780, 0.08, "square", 0.035, 0.06);
    beep(1040, 0.1, "square", 0.03, 0.12);
  },
  glitch: () => {
    beep(180, 0.12, "sawtooth", 0.04);
    beep(140, 0.1, "square", 0.03, 0.05);
  },
  check: () => {
    beep(392, 0.08, "triangle", 0.04);
    beep(523, 0.1, "triangle", 0.035, 0.08);
  },
};
