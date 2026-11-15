"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { A, EXPLODE, flyTo, overview, playIntro, setCircuits, setFramingOffset, setOpen, skipIntro } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { CIRCUIT_COLORS, CIRCUIT_LABELS, DEVICES, deviceById, roomById, type CircuitKind, type Device } from "@/components/three/data";
import {
  IconArrow,
  IconCircuit,
  IconClose,
  IconCube,
  IconHand,
  IconOpen,
  IconReplay,
  IconSkip,
  IconTarget,
  IconX,
} from "./Icons";

const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

const STEPS = ["Maison", "Décomposition", "Tableau électrique", "Réseaux", "Activation"];

const TYPE_LABEL: Record<Device["type"], { label: string; color: string }> = {
  panel: { label: "Tableau", color: "#F2B705" },
  outlet: { label: "Prise", color: CIRCUIT_COLORS.outlet },
  switch: { label: "Commande", color: CIRCUIT_COLORS.light },
  light: { label: "Éclairage", color: CIRCUIT_COLORS.light },
  special: { label: "Circuit spécialisé", color: CIRCUIT_COLORS.special },
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function focusDevice(d: Device) {
  const lift = d.level === "upper" ? A.floor * EXPLODE.floorLift : 0;
  useUI.getState().set({ selected: { kind: "device", id: d.id } });
  flyTo([d.pos[0], d.pos[1] + lift, d.pos[2]], d.type === "panel" ? 6 : 8);
}

function focusRoom(id: string) {
  const r = roomById(id);
  if (!r) return;
  const lift = r.level === "upper" ? A.floor * EXPLODE.floorLift : 0;
  useUI.getState().set({ selected: { kind: "room", id } });
  flyTo([r.focus.target[0], r.focus.target[1] + lift, r.focus.target[2]], r.focus.dist);
}

/* ------------------------------------------------------------------ */

function PhaseRail() {
  const step = useUI((s) => s.step);
  const playing = useUI((s) => s.playing);
  if (!playing) return null;
  return (
    <div className="pointer-events-none absolute bottom-[6.5rem] left-1/2 z-20 w-[min(92vw,34rem)] -translate-x-1/2 lg:bottom-9 lg:left-[6vw] lg:translate-x-0">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-[3px] overflow-hidden rounded-full bg-night/12">
              <div
                className="h-full rounded-full bg-night transition-[width] duration-[1200ms] ease-out"
                style={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }}
              />
            </div>
            <p
              className={`mt-2 hidden text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 sm:block ${
                i === step ? "text-night" : "text-night/35"
              }`}
            >
              <span className="mr-1 tabular-nums">0{i + 1}</span> {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const circuits = useUI((s) => s.circuits);
  const step = useUI((s) => s.step);
  const explore = useUI((s) => s.explore);
  const show = circuits || step >= 3;
  return (
    <div
      className={`pointer-events-none absolute right-4 top-24 z-20 ${explore ? "block" : "hidden sm:block"} rounded-2xl bg-white/75 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(13,27,61,0.5)] backdrop-blur-md transition-all duration-700 sm:right-8 sm:top-28 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-night/50">Réseau électrique</p>
      <ul className="space-y-1.5">
        {(Object.keys(CIRCUIT_LABELS) as CircuitKind[]).map((k) => (
          <li key={k} className="flex items-center gap-2.5 text-[0.78rem] font-semibold text-night">
            <span className="h-[3px] w-6 rounded-full" style={{ background: CIRCUIT_COLORS[k], boxShadow: `0 0 10px ${CIRCUIT_COLORS[k]}` }} />
            {CIRCUIT_LABELS[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard() {
  const selected = useUI((s) => s.selected);
  const set = useUI((s) => s.set);
  if (!selected) return null;

  let body: React.ReactNode = null;
  if (selected.kind === "device") {
    const d = deviceById(selected.id);
    if (!d) return null;
    const t = TYPE_LABEL[d.type];
    const room = roomById(d.room);
    body = (
      <>
        <span className="inline-flex items-center gap-2 rounded-full bg-night/5 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-night/70">
          <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
          {t.label}
        </span>
        <h3 className="mt-3 text-xl font-bold leading-tight text-night">{d.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{d.text}</p>
        {d.specs && (
          <ul className="mt-4 space-y-1.5 border-t border-night/10 pt-4">
            {d.specs.map((s) => (
              <li key={s} className="flex gap-2 text-[0.8rem] font-medium text-night/80">
                <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-volt" />
                {s}
              </li>
            ))}
          </ul>
        )}
        {room && (
          <button onClick={() => focusRoom(room.id)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-night hover:text-night/70">
            Voir la pièce : {room.name} <IconArrow size={16} />
          </button>
        )}
      </>
    );
  } else {
    const r = roomById(selected.id);
    if (!r) return null;
    const list = DEVICES.filter((d) => d.room === r.id);
    const count = (ty: Device["type"]) => list.filter((d) => d.type === ty).length;
    const stats = [
      { n: count("outlet"), l: "prises" },
      { n: count("light"), l: "points lumineux" },
      { n: count("switch"), l: "commandes" },
      { n: count("special") + count("panel"), l: "circuits dédiés" },
    ].filter((s) => s.n > 0);
    body = (
      <>
        <span className="inline-flex items-center gap-2 rounded-full bg-night/5 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-night/70">
          <span className="h-2 w-2 rounded-full bg-volt" />
          Pièce
        </span>
        <h3 className="mt-3 text-xl font-bold leading-tight text-night">Installation électrique — {r.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mute">{r.text}</p>
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.l} className="rounded-xl bg-ivory px-3 py-2.5">
                <p className="text-lg font-bold text-night tabular-nums">{s.n}</p>
                <p className="text-[0.72rem] font-medium text-mute">{s.l}</p>
              </div>
            ))}
          </div>
        )}
        {list.length > 0 && (
          <ul className="mt-4 max-h-36 space-y-1 overflow-auto border-t border-night/10 pt-3 pr-1">
            {list.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => focusDevice(d)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.8rem] font-medium text-night/80 hover:bg-night/5"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_LABEL[d.type].color }} />
                  {d.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <aside
      key={selected.kind + selected.id}
      className="fade-up absolute inset-x-3 bottom-[5.5rem] z-30 max-h-[55svh] overflow-auto rounded-3xl bg-white/92 p-5 shadow-[0_30px_80px_-30px_rgba(13,27,61,0.55)] backdrop-blur-xl sm:inset-x-auto sm:right-8 sm:top-1/2 sm:bottom-auto sm:w-[22rem] sm:-translate-y-1/2 sm:p-6"
      aria-live="polite"
    >
      <button
        onClick={() => set({ selected: null })}
        className="absolute right-4 top-4 rounded-full p-1.5 text-night/50 transition hover:bg-night/5 hover:text-night"
        aria-label="Fermer"
      >
        <IconX size={18} />
      </button>
      {body}
    </aside>
  );
}

function Dock() {
  const { playing, open, circuits, explore, set } = useUI();
  return (
    <div className="absolute bottom-5 left-1/2 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0">
      <div className="dock flex items-center gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]">
        {playing ? (
          <button className="dock-btn" onClick={skipIntro}>
            <IconSkip size={16} /> Passer l’animation
          </button>
        ) : (
          <>
            <button className="dock-btn" aria-pressed={open} onClick={() => setOpen(!open)}>
              {open ? <IconClose size={16} /> : <IconOpen size={16} />}
              {open ? "Refermer la maison" : "Ouvrir la maison"}
            </button>
            <button className="dock-btn" aria-pressed={circuits} onClick={() => setCircuits(!circuits)}>
              <IconCircuit size={16} />
              {circuits ? "Masquer les circuits" : "Afficher les circuits"}
            </button>
            <button className="dock-btn" onClick={() => focusDevice(deviceById("panel")!)}>
              <IconTarget size={16} /> Tableau
            </button>
            <button
              className="dock-btn"
              onClick={() => {
                set({ selected: null });
                overview();
              }}
            >
              <IconCube size={16} /> Vue d’ensemble
            </button>
            <button className="dock-btn" onClick={playIntro}>
              <IconReplay size={16} /> Rejouer l’animation
            </button>
            {explore && (
              <button
                className="dock-btn"
                onClick={() => {
                  set({ explore: false });
                  setFramingOffset(0.17);
                }}
              >
                <IconX size={16} /> Quitter
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FinalMessage() {
  const show = useUI((s) => s.finalMessage);
  const explore = useUI((s) => s.explore);
  return (
    <div
      className={`pointer-events-none absolute inset-x-5 bottom-[5.6rem] z-20 transition-all duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] lg:inset-x-auto lg:bottom-9 lg:left-[6vw] lg:w-[min(30rem,34vw)] ${
        show && !explore ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 border-l-2 border-volt pl-4">
        <p className="serif-accent text-[clamp(1.25rem,1.9vw,1.7rem)] leading-snug text-night">
          Une installation maîtrisée, du tableau jusqu’au dernier luminaire.
        </p>
      </div>
    </div>
  );
}

function Hint() {
  const playing = useUI((s) => s.playing);
  const ready = useUI((s) => s.ready);
  const explore = useUI((s) => s.explore);
  if (playing || !ready) return null;
  return (
    <p className="fade-up pointer-events-none absolute bottom-[4.6rem] left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[0.72rem] font-medium text-night/55 sm:flex lg:bottom-[5.6rem] lg:left-auto lg:right-10 lg:translate-x-0">
      <IconHand size={15} />
      {explore ? "Glisser pour tourner · molette pour zoomer · clic droit pour déplacer" : "Glisser pour tourner · cliquez sur une pièce ou un équipement"}
    </p>
  );
}

function Loader() {
  const ready = useUI((s) => s.ready);
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-ivory transition-opacity duration-1000 ${
        ready ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={ready}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 animate-ping rounded-full bg-volt/40" />
          <span className="absolute inset-2 rounded-full bg-volt" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-night/60">Préparation de la maquette 3D</p>
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-end justify-center lg:items-center lg:justify-end lg:pr-[4vw]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/renders/maison-ouverte.jpg" alt="Maison contemporaine et son installation électrique" className="h-[55%] w-full object-contain lg:h-[80%] lg:w-[70%]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const explore = useUI((s) => s.explore);
  const set = useUI((s) => s.set);

  useEffect(() => {
    setWebgl(hasWebGL());
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const startExplore = () => {
    skipIntro();
    set({ explore: true });
    setFramingOffset(0);
    if (!useUI.getState().open) setOpen(true);
    if (!useUI.getState().circuits) setCircuits(true);
    section.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={section} id="accueil" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ivory">
      <div className="absolute inset-0">
        {webgl === true && <Experience active={visible} />}
        {webgl === false && <Fallback />}
      </div>

      {webgl !== false && <Loader />}

      {/* Copy */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-28 transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)] sm:px-8 lg:inset-y-0 lg:left-[6vw] lg:right-auto lg:flex lg:w-[min(32rem,34vw)] lg:items-center lg:px-0 lg:pt-0 ${
          explore ? "-translate-x-6 opacity-0" : "opacity-100"
        }`}
      >
        <div className="fade-up max-w-xl">
          <p className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-night/70">
            <span className="h-px w-8 bg-volt" />
            UGB Électricité
          </p>
          <h1 className="mt-5 text-[clamp(2.1rem,4.4vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-night">
            L’énergie de vos projets, <span className="serif-accent block text-[1.08em] text-night/85">la confiance en plus.</span>
          </h1>
          <p className="mt-5 hidden max-w-md text-[0.98rem] leading-relaxed text-mute sm:block">
            Installation, rénovation et mise en conformité électrique pour maisons et bâtiments exigeants. Une exécution précise, du tableau
            jusqu’au dernier luminaire.
          </p>
          <div className={`mt-7 flex flex-wrap gap-3 ${explore ? "" : "pointer-events-auto"}`}>
            <a href="#prestations" className="btn btn-primary">
              Découvrir notre savoir-faire <IconArrow size={17} className="btn-arrow" />
            </a>
            <button onClick={startExplore} className="btn btn-ghost">
              <IconCube size={17} /> Explorer l’installation 3D
            </button>
          </div>
        </div>
      </div>

      {webgl === true && (
        <>
          <PhaseRail />
          <Legend />
          <FinalMessage />
          <InfoCard />
          <Hint />
          <Dock />
        </>
      )}
    </section>
  );
}
