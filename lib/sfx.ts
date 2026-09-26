// Tiny synthesized sound effects (Web Audio), so there are no audio files to load.

let ctx: AudioContext | null = null;

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Browsers only allow audio after a tap, so call this from the tap handler. */
export function unlockAudio() {
  try {
    audio();
  } catch {
    // No Web Audio support: stay silent.
  }
}

function blip(frequency: number, start: number, duration: number, volume: number, type: OscillatorType) {
  const a = audio();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** The click of a peg passing the pointer. */
export function playTick() {
  try {
    const a = audio();
    blip(1900, a.currentTime, 0.035, 0.08, "triangle");
  } catch {}
}

/** A short rising chime for the win. */
export function playWin() {
  try {
    const a = audio();
    const t = a.currentTime + 0.02;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      blip(f, t + i * 0.085, 0.5, 0.12, "sine");
      blip(f * 2, t + i * 0.085, 0.25, 0.03, "triangle");
    });
  } catch {}
}
