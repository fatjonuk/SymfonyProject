"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/** Scroll-driven reveals and subtle parallax for the editorial sections. */
export function ScrollFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.classList.add("reduced");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: Number(el.dataset.delay ?? 0),
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 8);
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.6, ease: "power3.inOut", scrollTrigger: { trigger: el, start: "top 90%", once: true } },
        );
      });
    });
    return () => ctx.revert();
  }, []);
  return null;
}
