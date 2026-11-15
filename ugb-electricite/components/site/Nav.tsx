"use client";

import { useEffect, useState } from "react";
import { IconArrow, IconMenu, IconX } from "./Icons";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#accueil", label: "Accueil" },
  { href: "#prestations", label: "Nos prestations" },
  { href: "#expertise", label: "Notre expertise" },
  { href: "#realisations", label: "Réalisations" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#accueil");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        className={`mx-auto flex max-w-[86rem] items-center justify-between rounded-[1.4rem] bg-night px-4 py-2.5 transition-shadow duration-500 sm:px-5 ${
          scrolled ? "shadow-[0_18px_50px_-22px_rgba(13,27,61,0.75)]" : "shadow-[0_10px_30px_-20px_rgba(13,27,61,0.6)]"
        }`}
        aria-label="Navigation principale"
      >
        <a href="#accueil" aria-label="UGB Électricité — accueil">
          <Logo />
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-[0.85rem] font-medium transition-colors duration-300 ${
                  active === l.href ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {l.label}
                <span
                  className={`absolute bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-volt transition-all duration-500 ${
                    active === l.href ? "w-4" : "w-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href="#contact" className="btn btn-volt hidden !px-5 !py-2.5 !text-[0.85rem] sm:inline-flex">
            Demander un devis <IconArrow size={16} className="btn-arrow" />
          </a>
          <button
            className="rounded-full p-2 text-white lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>

      <div
        className={`mx-auto mt-2 max-w-[86rem] overflow-hidden rounded-[1.4rem] bg-night transition-all duration-500 lg:hidden ${
          open ? "max-h-[28rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <ul className="p-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-base font-medium text-white/85 hover:bg-white/5">
                {l.label}
              </a>
            </li>
          ))}
          <li className="p-2">
            <a href="#contact" onClick={() => setOpen(false)} className="btn btn-volt w-full justify-center">
              Demander un devis
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
