import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrambleTo } from "./scramble";

gsap.registerPlugin(ScrollTrigger);

/* Section entrances, arcade-style — no generic fades:
   crt  — panels snap on like a tube powering up (squash line → bloom → settle)
   feed — paper feeds out of a slot (top-down clip reveal, for the ledger sheet)
   wipe — copy sweeps in behind a cursor bar (left-to-right clip reveal)
   type — text resolves character by character (kickers)                        */

export function bindReveals(reduce: boolean): () => void {
  if (reduce) return () => {};
  const triggers: ScrollTrigger[] = [];

  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const kind = el.dataset.reveal;

    if (kind === "crt") {
      gsap.set(el, { opacity: 0, scaleY: 0.012, transformOrigin: "50% 0%", filter: "brightness(4)" });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .to(el, { scaleY: 1, duration: 0.24, ease: "power4.in" })
              .to(el, { opacity: 1, filter: "brightness(1)", duration: 0.3, ease: "power2.out" }, 0.06)
              .fromTo(el, { skewX: -1.4 }, { skewX: 0, duration: 0.32, ease: "power2.out" }, 0.1);
          },
        })
      );
    } else if (kind === "feed") {
      gsap.set(el, { clipPath: "inset(-2% 0% 101% 0%)" });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 76%",
          once: true,
          onEnter: () =>
            gsap.to(el, { clipPath: "inset(-2% 0% -2% 0%)", duration: 0.75, ease: "power3.inOut" }),
        })
      );
    } else if (kind === "wipe") {
      gsap.set(el, { clipPath: "inset(-10% 101% -10% 0%)" });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 86%",
          once: true,
          onEnter: () =>
            gsap.to(el, { clipPath: "inset(-10% -2% -10% 0%)", duration: 0.6, ease: "expo.out" }),
        })
      );
    } else if (kind === "type") {
      const final = el.textContent || "";
      el.textContent = "";
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => scrambleTo(el, final, { duration: 460, step: 22 }),
        })
      );
    }
  });

  ScrollTrigger.refresh();
  return () => triggers.forEach((t) => t.kill());
}
