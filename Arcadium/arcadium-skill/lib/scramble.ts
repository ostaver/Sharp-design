/* Text decode/scramble — the site reveals text by resolving characters,
   never by fading. Used by headings and the hero title. */

const GLYPHS = "▚▞▛▟#%&@$?!=+<>/\\|~^*01";

export function scrambleTo(
  el: HTMLElement,
  finalText: string,
  opts: { duration?: number; step?: number; onDone?: () => void } = {}
): () => void {
  const duration = opts.duration ?? 900;
  const stepMs = opts.step ?? 28;
  const start = performance.now();
  const chars = finalText.split("");
  const settleAt = chars.map((_, i) => (i / chars.length) * duration * 0.75 + Math.random() * duration * 0.25);

  const timer = window.setInterval(() => {
    const t = performance.now() - start;
    let done = true;
    let out = "";
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === " " || t >= settleAt[i]) {
        out += chars[i];
      } else {
        done = false;
        out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
    }
    el.textContent = out;
    if (done) {
      window.clearInterval(timer);
      el.textContent = finalText;
      opts.onDone?.();
    }
  }, stepMs);

  return () => window.clearInterval(timer);
}
