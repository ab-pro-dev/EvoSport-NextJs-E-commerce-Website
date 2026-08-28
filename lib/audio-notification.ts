/**
 * Web Audio API synthesized notification sound engine.
 * Provides multiple distinct sound patterns with zero external file dependencies,
 * guaranteed offline support, and robust browser autoplay policy handling.
 */

export type NotificationSoundType = "chime" | "crystal" | "pulse" | "pop" | "bell" | "fanfare";

export interface SoundOption {
  id: NotificationSoundType;
  name: string;
  description: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "chime", name: "Classic Chime", description: "Subtle two-tone ascending chime (Default)" },
  { id: "crystal", name: "Crystal Arpeggio", description: "Sparkling three-tone shimmer" },
  { id: "pulse", name: "Sport Pulse", description: "Snappy athletic double-beep" },
  { id: "pop", name: "Soft Pop", description: "Gentle percussive bubble tone" },
  { id: "bell", name: "Modern Bell", description: "Warm harmonic notification bell" },
  { id: "fanfare", name: "Victory Flourish", description: "Energetic three-note ascending flourish" },
];

let audioCtx: AudioContext | null = null;
let userHasInteracted = false;
let pendingSoundToPlay: NotificationSoundType | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!audioCtx || audioCtx.state === "closed") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  } catch (err) {
    console.debug("[audio-notification] Failed to initialize AudioContext:", err);
  }

  return audioCtx;
}

/**
 * Ensures AudioContext is in 'running' state, attempting resume if suspended.
 */
async function resumeAudioContext(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === "running") return true;
  try {
    await ctx.resume();
    return (ctx.state as string) === "running";
  } catch {
    return false;
  }
}

// Register user interaction handlers that remain active to keep audio context awake
if (typeof window !== "undefined") {
  const handleUserGesture = () => {
    userHasInteracted = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        if (pendingSoundToPlay && isSoundEnabled()) {
          const sound = pendingSoundToPlay;
          pendingSoundToPlay = null;
          playSynthesizedSound(sound, ctx);
        }
      }).catch(() => {});
    }
  };

  window.addEventListener("pointerdown", handleUserGesture, { passive: true });
  window.addEventListener("keydown", handleUserGesture, { passive: true });
  window.addEventListener("touchstart", handleUserGesture, { passive: true });
  window.addEventListener("click", handleUserGesture, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended" && userHasInteracted) {
        ctx.resume().catch(() => {});
      }
    }
  });
}

/**
 * Local preference helpers
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem("evosport_sound_enabled");
    if (val === null) {
      // Check legacy key
      const legacyMuted = localStorage.getItem("evosport_sound_muted");
      if (legacyMuted !== null) return legacyMuted !== "true";
      return true;
    }
    return val === "true";
  } catch {
    return true;
  }
}

export function isSoundMuted(): boolean {
  return !isSoundEnabled();
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("evosport_sound_enabled", enabled ? "true" : "false");
    localStorage.setItem("evosport_sound_muted", enabled ? "false" : "true");
    window.dispatchEvent(
      new CustomEvent("evosport_sound_toggle", {
        detail: { soundEnabled: enabled, muted: !enabled },
      })
    );
  } catch {}
}

export function setSoundMuted(muted: boolean): void {
  setSoundEnabled(!muted);
}

export function getSavedNotificationSound(): NotificationSoundType {
  if (typeof window === "undefined") return "chime";
  try {
    const val = localStorage.getItem("evosport_sound_type") as NotificationSoundType;
    if (val && SOUND_OPTIONS.some((o) => o.id === val)) {
      return val;
    }
  } catch {}
  return "chime";
}

export function setSavedNotificationSound(sound: NotificationSoundType): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("evosport_sound_type", sound);
    window.dispatchEvent(
      new CustomEvent("evosport_sound_preference_changed", {
        detail: { sound, soundEnabled: isSoundEnabled() },
      })
    );
  } catch {}
}

export function initNotificationPreferences(prefs: {
  soundEnabled?: boolean;
  notificationSound?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    if (prefs.soundEnabled !== undefined) {
      localStorage.setItem("evosport_sound_enabled", prefs.soundEnabled ? "true" : "false");
      localStorage.setItem("evosport_sound_muted", prefs.soundEnabled ? "false" : "true");
    }
    if (prefs.notificationSound) {
      const valid = SOUND_OPTIONS.some((o) => o.id === prefs.notificationSound);
      if (valid) {
        localStorage.setItem("evosport_sound_type", prefs.notificationSound);
      }
    }
    window.dispatchEvent(
      new CustomEvent("evosport_sound_preference_changed", {
        detail: {
          sound: getSavedNotificationSound(),
          soundEnabled: isSoundEnabled(),
        },
      })
    );
  } catch {}
}

/**
 * Synthesizes the chosen sound using Web Audio API nodes
 */
function playSynthesizedSound(sound: NotificationSoundType, ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;

    switch (sound) {
      case "crystal": {
        // Sparkling three-tone crystalline arpeggio (C6 -> E6 -> G6)
        const notes = [1046.5, 1318.51, 1567.98];
        notes.forEach((freq, i) => {
          const startTime = now + i * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.23);
        });
        break;
      }

      case "pulse": {
        // Snappy athletic double-beep (E5 -> A5)
        const beeps = [
          { freq: 659.25, start: 0, dur: 0.07 },
          { freq: 880.0, start: 0.09, dur: 0.12 },
        ];

        beeps.forEach(({ freq, start, dur }) => {
          const startTime = now + start;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + dur + 0.01);
        });
        break;
      }

      case "pop": {
        // Gentle percussive bubble pop (frequency ramp 350 -> 850 -> 250)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.03);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }

      case "bell": {
        // Warm harmonic notification bell (fundamental C5 + gentle partials)
        const partials = [
          { freq: 523.25, gainVal: 0.2 },
          { freq: 1046.5, gainVal: 0.08 },
          { freq: 1569.75, gainVal: 0.04 },
        ];

        partials.forEach(({ freq, gainVal }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.39);
        });
        break;
      }

      case "fanfare": {
        // Energetic three-note ascending flourish (F5 -> A5 -> C6)
        const notes = [698.46, 880.0, 1046.5];
        notes.forEach((freq, i) => {
          const startTime = now + i * 0.08;
          const dur = i === 2 ? 0.26 : 0.11;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + dur + 0.01);
        });
        break;
      }

      case "chime":
      default: {
        // Classic two-tone chime (D5: 587.33Hz -> A5: 880Hz)
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

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.09);

        gain2.gain.setValueAtTime(0.001, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.24, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.09);
        osc2.stop(now + 0.38);
        break;
      }
    }
  } catch (err) {
    console.debug("[audio-notification] Synth playback error:", err);
  }
}

/**
 * Preview a sound regardless of global soundEnabled toggle (for settings test button)
 */
export async function previewNotificationSound(
  soundId: NotificationSoundType = "chime"
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const isRunning = await resumeAudioContext(ctx);
    if (isRunning) {
      playSynthesizedSound(soundId, ctx);
    }
  } catch (err) {
    console.debug("[audio-notification] Preview sound failed:", err);
  }
}

/**
 * Plays the user's configured notification sound when a new alert/notification arrives.
 * Respects soundEnabled toggle and handles browser audio autoplay policies gracefully.
 */
export async function playNotificationSound(soundId?: NotificationSoundType): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;

  const targetSound = soundId || getSavedNotificationSound();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      const resumed = await resumeAudioContext(ctx);
      if (resumed) {
        playSynthesizedSound(targetSound, ctx);
      } else {
        // Queue pending sound to play upon the next user interaction
        pendingSoundToPlay = targetSound;
      }
    } else {
      playSynthesizedSound(targetSound, ctx);
    }
  } catch (err) {
    console.debug("[audio-notification] playNotificationSound error:", err);
  }
}
