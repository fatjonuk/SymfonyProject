"use client";

import gsap from "gsap";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  SCROLL,
  clearSelection,
  goToExplore,
  initScroll,
  initStatic,
  replay,
  resetCamera,
  rotateBy,
  selectDevice,
  selectRoom,
  setFilter,
  setOpen,
  switchIsOn,
  toggleLight,
  toggleSwitch,
  zoomBy,
} from "@/lib/anim";
import { useUI, type CircuitFilter } from "@/lib/store";
import {
  CIRCUIT_COLORS,
  DEVICES,
  DEVICE_CIRCUIT,
  SWITCH_LIGHTS,
  deviceById,
  groupById,
  roomById,
  type Device,
} from "@/components/three/data";
import {
  IconArrow,
  IconBolt,
  IconClose,
  IconCube,
  IconEyeOff,
  IconMinus,
  IconOpen,
  IconPlus,
  IconPower,
  IconReplay,
  IconRotateLeft,
  IconRotateRight,
  IconTarget,
  IconX,
} from "./Icons";

const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

/** Chapters of the scroll sequence (bounds in % of the timeline). */
const CHAPTERS: { label: string; short?: string; text: string }[] = [
  { label: "Maison", text: "Une installation électrique pensée dans les moindres détails." },
  { label: "Décomposition", text: "Toiture, façades, étage : la maison s’ouvre et révèle ce qui ne se voit pas." },
  { label: "Tableau électrique", short: "Tableau", text: "Le tableau électrique : le cœur de votre installation." },
  { label: "Circuits", text: "Chaque circuit, une installation maîtrisée." },
  { label: "Exploration", text: "Explorez notre savoir-faire." },
];
const BOUNDS = [0, 15, 40, 55, 80, 100];

/** Titles and descriptions shown when a device is selected. */
const TYPE_INFO: Record<Device["type"], { tag: string; color: string; title?: string; text?: string }> = {
  panel: {
    tag: "Tableau",
    color: "#F2B705",
    title: "Tableau électrique",
    text: "Distribution, protection et organisation des circuits électriques de votre habitation.",
  },
  outlet: {
    tag: "Prise",
    color: CIRCUIT_COLORS.outlet,
    title: "Installation de prises électriques",
    text: "Des installations adaptées aux usages de chaque pièce.",
  },
  light: {
    tag: "Luminaire",
    color: CIRCUIT_COLORS.light,
    title: "Éclairage intérieur et extérieur",
    text: "Des solutions d’éclairage fonctionnelles et esthétiques.",
  },
  switch: {
    tag: "Interrupteur",
    color: CIRCUIT_COLORS.light,
    title: "Commandes d’éclairage",
    text: "Des commandes pratiques, intégrées à votre installation.",
  },
  special: { tag: "Circuit spécialisé", color: CIRCUIT_COLORS.special },
};

const FILTERS: { id: CircuitFilter; label: string; color?: string }[] = [
  { id: "all", label: "Tous les circuits" },
  { id: "light", label: "Éclairage", color: CIRCUIT_COLORS.light },
  { id: "outlet", label: "Prises", color: CIRCUIT_COLORS.outlet },
  { id: "special", label: "Spécialisés", color: CIRCUIT_COLORS.special },
  { id: "none", label: "Masquer" },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Copy synchronised with the scroll                                   */
/* ------------------------------------------------------------------ */

function Eyebrow({ index }: { index: number }) {
  return (
    <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-night/60">
      <span className="h-px w-8 bg-volt" />
      <span className="tabular-nums">0{index + 1}</span>
      {CHAPTERS[index].label}
    </p>
  );
}

function CircuitFilters() {
  const filter = useUI((s) => s.filter);
  return (
    <div
      className="-mx-5 mt-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="group"
      aria-label="Circuits affichés"
    >
      {FILTERS.map((f) => (
        <button key={f.id} className="filter-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
          {f.color ? (
            <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
          ) : f.id === "none" ? (
            <IconEyeOff size={14} />
          ) : null}
          {f.label}
        </button>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
      {FILTERS.filter((f) => f.color).map((f) => (
        <li key={f.id} className="flex items-center gap-2 text-[0.8rem] font-semibold text-night/80">
          <span className="h-[3px] w-6 rounded-full" style={{ background: f.color, boxShadow: `0 0 10px ${f.color}` }} />
          {f.id === "special" ? "Circuits spécialisés" : f.label}
        </li>
      ))}
    </ul>
  );
}

function Copy({ isStatic }: { isStatic: boolean }) {
  const step = useUI((s) => s.step);
  const explore = useUI((s) => s.mode === "explore");
  const hasPanel = useUI((s) => !!s.selected);
  const show = (on: boolean) =>
    `transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${on ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}`;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-28 transition-opacity duration-500 sm:px-8 lg:inset-y-0 lg:left-[6vw] lg:right-auto lg:flex lg:w-[min(32rem,34vw)] lg:items-center lg:px-0 lg:pt-0 ${
        hasPanel ? "max-lg:opacity-0" : ""
      }`}
    >
      <div className="relative w-full max-w-xl">
        {/* 01 — hero copy, shown while the house is still closed */}
        <div className={show(step === 0)} aria-hidden={step !== 0}>
          <p className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-night/70">
            <span className="h-px w-8 bg-volt" />
            UGB Électricité
          </p>
          <h1 className="mt-5 text-[clamp(2.05rem,4.4vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-night">
            L’énergie de vos projets, <span className="serif-accent block text-[1.08em] text-night/85">la confiance en plus.</span>
          </h1>
          <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-mute sm:mt-5">{CHAPTERS[0].text}</p>
          <div className={`mt-6 flex flex-wrap gap-3 sm:mt-7 ${step === 0 ? "pointer-events-auto" : ""}`}>
            <a href="#prestations" className="btn btn-primary" tabIndex={step === 0 ? 0 : -1}>
              Découvrir notre savoir-faire <IconArrow size={17} className="btn-arrow" />
            </a>
            {!isStatic && (
              <button onClick={goToExplore} className="btn btn-ghost" tabIndex={step === 0 ? 0 : -1}>
                <IconCube size={17} /> Explorer l’installation 3D
              </button>
            )}
          </div>
          {isStatic && explore && (
            <div className="pointer-events-auto">
              <CircuitFilters />
            </div>
          )}
        </div>

        {/* 02 → 05 — one short line per chapter */}
        {CHAPTERS.map((c, i) =>
          i === 0 ? null : (
            <div key={c.label} className={`absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2`} aria-hidden={step !== i}>
              <div className={show(step === i)}>
                {/* while an info panel is open the headline steps aside: the scene comes first */}
                <div className={`transition-opacity duration-500 ${i === 4 && hasPanel ? "opacity-0" : ""}`}>
                  <Eyebrow index={i} />
                  <p className="serif-accent mt-4 text-[clamp(1.7rem,3.3vw,3.1rem)] leading-[1.08] text-night sm:mt-5">{c.text}</p>
                </div>
                {i === 3 && <Legend />}
                {i === 4 && (
                  <div className={show(explore) + (explore && step === 4 ? " pointer-events-auto" : "")}>
                    <p
                      className={`mt-4 hidden max-w-sm text-[0.95rem] leading-relaxed text-mute transition-opacity duration-500 sm:block ${
                        hasPanel ? "opacity-0" : ""
                      }`}
                    >
                      Faites glisser pour tourner autour de la maison, puis cliquez sur un équipement pour afficher son circuit.
                    </p>
                    <CircuitFilters />
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/** Progress of the sequence, one segment per chapter. Updated outside React. */
function PhaseRail() {
  const step = useUI((s) => s.step);
  const explore = useUI((s) => s.mode === "explore");
  const bars = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tick = () => {
      const t = SCROLL.p * 100;
      bars.current.forEach((el, i) => {
        if (!el) return;
        const f = Math.min(1, Math.max(0, (t - BOUNDS[i]) / (BOUNDS[i + 1] - BOUNDS[i])));
        el.style.transform = `scaleX(${f})`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-x-5 bottom-6 z-20 transition-opacity duration-500 lg:inset-x-auto lg:bottom-9 lg:left-[6vw] lg:w-[min(32rem,34vw)] ${
        explore ? "max-lg:opacity-0" : ""
      }`}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        {CHAPTERS.map((c, i) => (
          <div key={c.label} className="flex-1">
            <div className="h-[3px] overflow-hidden rounded-full bg-night/12">
              <div
                ref={(el) => {
                  bars.current[i] = el;
                }}
                className="h-full origin-left rounded-full bg-night"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <p
              className={`mt-2 hidden text-[0.64rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-500 xl:block ${
                i === step ? "text-night" : "text-night/35"
              }`}
            >
              {c.short ?? c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollHint() {
  const show = useUI((s) => s.step === 0 && s.mode === "timeline" && s.ready);
  return (
    <div
      className={`pointer-events-none absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-3xl bg-ivory/75 px-4 py-3 backdrop-blur-sm transition-opacity duration-700 lg:bottom-7 lg:bg-transparent lg:backdrop-blur-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!show}
    >
      <span className="scroll-mouse" />
      <span className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-night/55">Faites défiler</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exploration mode                                                    */
/* ------------------------------------------------------------------ */

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-night/5 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-night/70">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function DeviceCard({ d }: { d: Device }) {
  const off = useUI((s) => s.off);
  const filter = useUI((s) => s.filter);
  const info = TYPE_INFO[d.type];
  const room = roomById(d.room);
  const group = groupById(DEVICE_CIRCUIT[d.id] ?? "");
  const generic = !!info.title;
  const lit = !off[d.id];
  const swOn = switchIsOn(d.id, off);

  return (
    <>
      <Tag color={info.color}>{info.tag}</Tag>
      <h3 className="mt-3 pr-6 text-xl font-bold leading-tight text-night">{info.title ?? d.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mute">{info.text ?? d.text}</p>

      {/* the device that was clicked, and the circuit feeding it */}
      <dl className="mt-4 space-y-2.5 border-t border-night/10 pt-4 text-[0.82rem]">
        {generic && d.type !== "panel" && (
          <div>
            <dt className="font-bold text-night">{d.title}</dt>
            <dd className="mt-0.5 leading-snug text-mute">{d.text}</dd>
          </div>
        )}
        {group && (
          <div className="flex items-center gap-2">
            <dt className="text-night/50">Circuit</dt>
            <dd className="flex items-center gap-2 font-semibold text-night">
              <span className="h-[3px] w-5 rounded-full" style={{ background: CIRCUIT_COLORS[group.kind] }} />
              {group.label}
            </dd>
          </div>
        )}
      </dl>

      {d.type === "light" && (
        <button className="card-action mt-4" aria-pressed={lit} onClick={() => toggleLight(d.id)}>
          <IconPower size={16} /> {lit ? "Éteindre ce luminaire" : "Allumer ce luminaire"}
        </button>
      )}
      {d.type === "switch" && (
        <button className="card-action mt-4" aria-pressed={swOn} onClick={() => toggleSwitch(d.id)}>
          <IconPower size={16} /> {swOn ? "Éteindre" : "Allumer"} · {SWITCH_LIGHTS[d.id]?.length ?? 0} luminaire
          {(SWITCH_LIGHTS[d.id]?.length ?? 0) > 1 ? "s" : ""}
        </button>
      )}
      {d.type === "panel" && (
        <div className="mt-4">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-night/50">Visualiser les circuits</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FILTERS.filter((f) => f.id !== "none").map((f) => (
              <button key={f.id} className="filter-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.color && <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {d.specs && (
        <ul className="mt-4 hidden space-y-1.5 border-t border-night/10 pt-4 sm:block">
          {d.specs.map((s) => (
            <li key={s} className="flex gap-2 text-[0.8rem] font-medium text-night/80">
              <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-volt" />
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href="#contact" className="btn btn-primary !px-4 !py-2.5 !text-[0.82rem]">
          Demander un devis <IconArrow size={15} className="btn-arrow" />
        </a>
        {room && (
          <button onClick={() => selectRoom(room.id)} className="text-[0.82rem] font-semibold text-night underline-offset-4 hover:underline">
            Voir la pièce : {room.name}
          </button>
        )}
      </div>
    </>
  );
}

function RoomCard({ id }: { id: string }) {
  const r = roomById(id);
  if (!r) return null;
  const list = DEVICES.filter((d) => d.room === r.id);
  const count = (ty: Device["type"]) => list.filter((d) => d.type === ty).length;
  const stats = [
    { n: count("outlet"), l: "prises" },
    { n: count("light"), l: "points lumineux" },
    { n: count("switch"), l: "commandes" },
    { n: count("special") + count("panel"), l: "circuits dédiés" },
  ].filter((s) => s.n > 0);
  return (
    <>
      <Tag color="#F2B705">Pièce</Tag>
      <h3 className="mt-3 pr-6 text-xl font-bold leading-tight text-night">Installation électrique — {r.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mute">{r.text}</p>
      {stats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl bg-ivory px-3 py-2.5">
              <p className="text-lg font-bold tabular-nums text-night">{s.n}</p>
              <p className="text-[0.72rem] font-medium text-mute">{s.l}</p>
            </div>
          ))}
        </div>
      )}
      {list.length > 0 && (
        <ul className="mt-4 max-h-40 space-y-1 overflow-auto border-t border-night/10 pt-3 pr-1">
          {list.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => selectDevice(d.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.8rem] font-medium text-night/80 hover:bg-night/5"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_INFO[d.type].color }} />
                {d.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <a href="#contact" className="btn btn-primary mt-5 !px-4 !py-2.5 !text-[0.82rem]">
        Demander un devis <IconArrow size={15} className="btn-arrow" />
      </a>
    </>
  );
}

function InfoPanel() {
  const selected = useUI((s) => s.selected);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clearSelection();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!selected) return null;
  const device = selected.kind === "device" ? deviceById(selected.id) : undefined;
  return (
    <aside
      key={selected.kind + selected.id}
      className="fade-up absolute inset-x-3 bottom-4 z-30 max-h-[46svh] overflow-auto rounded-3xl bg-white/95 p-5 shadow-[0_30px_80px_-30px_rgba(13,27,61,0.55)] backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-8 sm:top-28 sm:max-h-[calc(100svh-14rem)] sm:w-[22.5rem] sm:p-6"
      aria-live="polite"
    >
      <button
        onClick={clearSelection}
        className="absolute right-4 top-4 rounded-full p-1.5 text-night/50 transition hover:bg-night/5 hover:text-night"
        aria-label="Fermer le panneau"
      >
        <IconX size={18} />
      </button>
      {device ? <DeviceCard d={device} /> : <RoomCard id={selected.id} />}
    </aside>
  );
}

function Dock({ isStatic }: { isStatic: boolean }) {
  const explore = useUI((s) => s.mode === "explore");
  const open = useUI((s) => s.open);
  const hasPanel = useUI((s) => !!s.selected);
  return (
    <div
      className={`absolute bottom-5 left-1/2 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0 ${
        explore ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      } ${hasPanel ? "max-sm:pointer-events-none max-sm:opacity-0" : ""}`}
      aria-hidden={!explore}
    >
      <div className="dock flex flex-wrap items-center justify-center gap-1 rounded-[1.6rem] p-1.5 sm:flex-nowrap sm:rounded-full">
        <button className="dock-btn dock-icon" onClick={() => rotateBy(-Math.PI / 4)} aria-label="Tourner la maison vers la gauche" title="Tourner à gauche">
          <IconRotateLeft size={17} />
        </button>
        <button className="dock-btn dock-icon" onClick={() => rotateBy(Math.PI / 4)} aria-label="Tourner la maison vers la droite" title="Tourner à droite">
          <IconRotateRight size={17} />
        </button>
        <button className="dock-btn dock-icon" onClick={() => zoomBy(1.3)} aria-label="Zoom arrière" title="Zoom arrière">
          <IconMinus size={17} />
        </button>
        <button className="dock-btn dock-icon" onClick={() => zoomBy(0.75)} aria-label="Zoom avant" title="Zoom avant">
          <IconPlus size={17} />
        </button>
        <button
          className="dock-btn"
          onClick={() => {
            clearSelection();
            resetCamera();
          }}
          title="Réinitialiser la caméra"
        >
          <IconTarget size={16} /> <span className="sm:hidden">Vue</span>
          <span className="hidden sm:inline">Réinitialiser</span>
        </button>
        <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" />
        <button className="dock-btn" onClick={() => selectDevice("panel")}>
          <IconBolt size={16} /> Tableau
        </button>
        <button className="dock-btn" onClick={() => setOpen(!open)}>
          {open ? <IconClose size={16} /> : <IconOpen size={16} />}
          <span className="sm:hidden">{open ? "Fermer" : "Ouvrir"}</span>
          <span className="hidden sm:inline">{open ? "Refermer la maison" : "Ouvrir la maison"}</span>
        </button>
        {!isStatic && (
          <button className="dock-btn" onClick={replay}>
            <IconReplay size={16} /> Rejouer
          </button>
        )}
      </div>
    </div>
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

/** Simplified experience for devices that cannot display the 3D scene. */
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
  const stage = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [isStatic, setStatic] = useState(false);

  useEffect(() => {
    const el = section.current;
    const pin = stage.current;
    if (!el || !pin) return;
    const ok = hasWebGL();
    setWebgl(ok);
    // Rendering is paused whenever the 3D stage is off screen.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    let cleanup = () => {};
    if (ok) {
      // Reduced motion: no scroll-driven sequence, the open house is shown directly.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setStatic(reduce);
      cleanup = reduce ? initStatic() : initScroll(el, pin);
    }
    return () => {
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <section ref={section} id="accueil" className="relative w-full bg-ivory">
      {/* Pinned stage: stays on screen while the scroll drives the sequence */}
      <div ref={stage} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ivory">
        <div className="absolute inset-0">
          {webgl === true && <Experience active={visible} />}
          {webgl === false && <Fallback />}
        </div>

        {webgl !== false && <Loader />}
        <Copy isStatic={isStatic || webgl === false} />

        {webgl === true && (
          <>
            {!isStatic && <PhaseRail />}
            {!isStatic && <ScrollHint />}
            <InfoPanel />
            <Dock isStatic={isStatic} />
          </>
        )}
      </div>
    </section>
  );
}
