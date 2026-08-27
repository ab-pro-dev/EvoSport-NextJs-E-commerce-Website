/**
 * Web Audio API synthesized notification chime.
 * Generates a clean, subtle two-tone chime without external audio files or broken path risks.
 */

let audioCtx: AudioContext | null = null;
let userInteracted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

if (typeof window !== "undefined") {
  const unlockAudio = () => {
    userInteracted = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };

  window.addEventListener("click", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("evosport_sound_muted") === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("evosport_sound_muted", muted ? "true" : "false");
    window.dispatchEvent(new CustomEvent("evosport_sound_toggle", { detail: { muted } }));
  } catch {
    // Ignore localStorage write error
  }
}

export function playNotificationSound(): void {
  if (typeof window === "undefined") return;
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended" && userInteracted) {
      ctx.resume().catch(() => {});
    }

    if (ctx.state === "suspended") return;

    const now = ctx.currentTime;

    // First tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1);

    gain2.gain.setValueAtTime(0.001, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  } catch (err) {
    // Gracefully handle any browser audio policy or synthesis exception
    console.debug("[audio-notification] playNotificationSound suppressed:", err);
  }
}
