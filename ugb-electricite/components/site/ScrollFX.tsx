"use client";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/** Scroll-driven reveals and subtle parallax for the editorial sections. */
export function ScrollFX() {
  // In-page anchors: animated in JS (CSS smooth scrolling conflicts with the
  // scroll-driven 3D sequence).
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = link.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const y = id === "accueil" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      const dist = Math.abs(y - window.scrollY);
      gsap.to(window, {
        scrollTo: { y, autoKill: true },
        duration: reduce ? 0 : Math.min(1.8, Math.max(0.7, dist / 3500)),
        ease: "power2.inOut",
        overwrite: true,
      });
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

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
