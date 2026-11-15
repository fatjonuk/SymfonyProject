import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import {
  IconArrow,
  IconBolt,
  IconBulb,
  IconCheck,
  IconClock,
  IconCompass,
  IconDoc,
  IconLeaf,
  IconMail,
  IconPhone,
  IconPin,
  IconPlug,
  IconShield,
  IconWrench,
} from "./Icons";
import { Logo } from "./Logo";
import { QuoteForm } from "./QuoteForm";

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.3em] ${light ? "text-white/60" : "text-night/55"}`}>
      <span className="h-px w-8 bg-volt" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Prestations                                                         */
/* ------------------------------------------------------------------ */

const SERVICES = [
  {
    icon: IconPlug,
    title: "Installation électrique",
    text: "Neuf, extension ou rénovation : conception du réseau, pose du tableau, des circuits et des équipements jusqu’à la mise en service.",
    points: ["Tableau & protections", "Circuits dédiés", "Réseau courant faible"],
  },
  {
    icon: IconShield,
    title: "Mise en conformité",
    text: "Diagnostic de l’existant, remise aux normes NF C 15-100 et sécurisation des personnes, jusqu’à l’attestation de conformité.",
    points: ["Diagnostic complet", "Mise à la terre", "Différentiels 30 mA"],
  },
  {
    icon: IconBulb,
    title: "Éclairage intérieur & extérieur",
    text: "Mise en lumière des volumes et des façades : spots encastrés, suspensions, rubans LED, jardin, terrasse et allées.",
    points: ["Scénarios & variateurs", "Éclairage paysager", "Détection de présence"],
  },
  {
    icon: IconWrench,
    title: "Dépannage & maintenance",
    text: "Recherche de panne, remplacement d’appareillage, contrôles périodiques : des interventions précises et rapides.",
    points: ["Recherche de défaut", "Remplacement", "Contrats d’entretien"],
  },
  {
    icon: IconCompass,
    title: "Étude & conseils personnalisés",
    text: "Analyse de vos besoins, plans d’implantation, choix des équipements et optimisation de vos consommations.",
    points: ["Plans & schémas", "Bilan de puissance", "Choix des matériels"],
  },
];

export function Services() {
  return (
    <section id="prestations" className="relative bg-ivory px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[86rem]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div data-reveal>
            <Eyebrow>Nos prestations</Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-night">
              Une expertise électrique complète, <span className="serif-accent text-night/80">pensée dans le moindre détail.</span>
            </h2>
          </div>
          <p data-reveal data-delay="0.1" className="max-w-lg text-[1.02rem] leading-relaxed text-mute lg:justify-self-end">
            De l’étude à la mise en service, nous concevons des installations sûres, durables et évolutives. Chaque projet est suivi par un
            interlocuteur unique, avec la même exigence de précision.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <article
              key={s.title}
              data-reveal
              data-delay={(i % 3) * 0.08}
              className="service-card group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white p-7 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <span className="service-icon grid h-14 w-14 place-items-center rounded-2xl bg-night text-volt">
                  <s.icon size={24} />
                </span>
                <span className="text-sm font-semibold tabular-nums text-night/25">0{i + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-[-0.01em] text-night">{s.title}</h3>
              <p className="mt-3 text-[0.94rem] leading-relaxed text-mute">{s.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.points.map((p) => (
                  <li key={p} className="rounded-full bg-ivory px-3 py-1.5 text-[0.74rem] font-semibold text-night/70">
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <a
            href="#contact"
            data-reveal
            data-delay="0.16"
            className="service-card group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-night p-7 text-white sm:p-8"
          >
            <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-volt/20 blur-3xl transition-transform duration-1000 group-hover:scale-125" />
            <span className="service-icon grid h-14 w-14 place-items-center rounded-2xl bg-volt text-night">
              <IconBolt size={24} />
            </span>
            <div className="mt-10">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                Un projet en tête ? <span className="serif-accent block text-[1.15em] text-volt">Parlons-en.</span>
              </h3>
              <p className="mt-3 text-[0.94rem] leading-relaxed text-white/65">Étude gratuite de votre besoin et devis détaillé.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-volt">
                Demander un devis <IconArrow size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Expertise                                                           */
/* ------------------------------------------------------------------ */

const METHOD = [
  { t: "Écoute & visite", d: "Nous analysons vos usages, votre bâti et vos contraintes sur place." },
  { t: "Étude & devis détaillé", d: "Plan d’implantation, bilan de puissance et chiffrage poste par poste." },
  { t: "Réalisation soignée", d: "Saignées propres, câblage repéré, tableau peigné et étiqueté." },
  { t: "Contrôles & mise en service", d: "Mesures d’isolement, tests des différentiels, essais de chaque circuit." },
  { t: "Suivi dans le temps", d: "Dossier de l’installation remis, conseils d’usage et maintenance." },
];

const PILLARS = [
  { icon: IconShield, t: "Norme NF C 15-100", d: "Des installations conformes et sécurisées." },
  { icon: IconBolt, t: "Recharge de véhicules", d: "Bornes et prises renforcées à domicile." },
  { icon: IconLeaf, t: "Efficacité énergétique", d: "LED, pilotage et suivi des consommations." },
  { icon: IconDoc, t: "Traçabilité", d: "Schémas, repérage et dossier complet." },
];

export function Expertise() {
  return (
    <section id="expertise" className="relative overflow-hidden bg-sand/60 px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[86rem] gap-16 lg:grid-cols-[1fr_1.05fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div data-reveal>
            <Eyebrow>Notre expertise</Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-night">
              Chaque circuit est pensé, tracé <span className="serif-accent text-night/80">et protégé.</span>
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-mute">
              Une installation électrique réussie ne se voit pas : elle se vit au quotidien, en toute sécurité. Notre méthode garantit un
              travail lisible, contrôlé et documenté, du tableau jusqu’au dernier point lumineux.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3" data-reveal data-delay="0.1">
            {PILLARS.map((p) => (
              <div key={p.t} className="rounded-2xl bg-white/70 p-4 backdrop-blur">
                <p.icon size={20} className="text-night" />
                <p className="mt-3 text-sm font-bold text-night">{p.t}</p>
                <p className="mt-1 text-[0.8rem] leading-snug text-mute">{p.d}</p>
              </div>
            ))}
          </div>
        </div>

        <ol className="relative">
          {METHOD.map((m, i) => (
            <li key={m.t} data-reveal data-delay={i * 0.05} className="group relative border-t border-night/12 py-8 first:border-t-0 lg:py-10">
              <div className="flex gap-6 sm:gap-10">
                <span className="serif-accent text-[2.6rem] leading-none text-night/25 transition-colors duration-500 group-hover:text-volt sm:text-[3.4rem]">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-[-0.01em] text-night sm:text-2xl">{m.t}</h3>
                  <p className="mt-2 max-w-md text-[0.96rem] leading-relaxed text-mute">{m.d}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Réalisations                                                        */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  {
    img: "/renders/maison-ouverte.jpg",
    tag: "Construction neuve",
    title: "Maison contemporaine R+1",
    text: "Installation complète : tableau, circuits d’éclairage, prises, circuits spécialisés et extérieurs.",
  },
  {
    img: "/renders/tableau.jpg",
    tag: "Rénovation",
    title: "Tableau électrique & mise aux normes",
    text: "Remplacement du tableau, protections différentielles et repérage de chaque départ.",
  },
  {
    img: "/renders/exterieur.jpg",
    tag: "Extérieur",
    title: "Jardin, terrasse & piscine",
    text: "Bornes d’allée, spots de sous-face et éclairage paysager piloté.",
  },
  {
    img: "/renders/facade.jpg",
    tag: "Villa",
    title: "Architecture & lumière",
    text: "Intégration discrète des équipements dans une architecture contemporaine.",
  },
];

function ProjectCard({ p, delay = 0, ratio }: { p: (typeof PROJECTS)[number]; delay?: number; ratio: string }) {
  const big = ratio.includes("5/4") || ratio.includes("21/9");
  return (
    <article data-reveal data-delay={delay} className="group">
      <div className={`relative overflow-hidden rounded-[1.75rem] bg-sand ${ratio}`}>
        <div data-parallax="5" className="absolute inset-x-0 -top-[6%] h-[112%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.img}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-night backdrop-blur">
          {p.tag}
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className={`font-bold tracking-[-0.015em] text-night ${big ? "text-2xl" : "text-xl"}`}>{p.title}</h3>
          <p className="mt-2 max-w-md text-[0.94rem] leading-relaxed text-mute">{p.text}</p>
        </div>
        <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night/15 text-night transition-all duration-500 group-hover:border-night group-hover:bg-night group-hover:text-volt">
          <IconArrow size={18} />
        </span>
      </div>
    </article>
  );
}

export function Realisations() {
  return (
    <section id="realisations" className="bg-ivory px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[86rem]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div data-reveal>
            <Eyebrow>Réalisations</Eyebrow>
            <h2 className="mt-6 max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-night">
              Des projets à la hauteur <span className="serif-accent text-night/80">de vos exigences.</span>
            </h2>
          </div>
          <a data-reveal href="#contact" className="btn btn-primary self-start lg:self-auto">
            Parler de votre projet <IconArrow size={17} className="btn-arrow" />
          </a>
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <ProjectCard p={PROJECTS[0]} ratio="aspect-[4/3] lg:aspect-[5/4]" />
          <div className="grid gap-10 lg:gap-8">
            <ProjectCard p={PROJECTS[1]} delay={0.1} ratio="aspect-[16/10]" />
            <ProjectCard p={PROJECTS[2]} delay={0.15} ratio="aspect-[16/10]" />
          </div>
        </div>
        <div className="mt-10 lg:mt-12">
          <ProjectCard p={PROJECTS[3]} ratio="aspect-[4/3] sm:aspect-[21/9]" />
        </div>
        <p className="mt-8 text-xs text-night/40">Visuels : maquette 3D UGB Électricité.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Engagements                                                         */
/* ------------------------------------------------------------------ */

const PROMISES = [
  { icon: IconShield, t: "Sécurité & conformité", d: "Des installations réalisées selon la norme NF C 15-100, contrôlées avant chaque mise en service." },
  { icon: IconDoc, t: "Devis clair et détaillé", d: "Un chiffrage poste par poste, sans surprise, expliqué avant le démarrage du chantier." },
  { icon: IconCheck, t: "Chantier propre et respecté", d: "Protection des sols et du mobilier, nettoyage quotidien et délais tenus." },
  { icon: IconClock, t: "Réactivité & suivi", d: "Un interlocuteur unique, joignable, qui assure le suivi après l’intervention." },
];

export function Engagements() {
  return (
    <section className="relative overflow-hidden bg-night px-5 py-24 text-white sm:px-8 lg:py-36">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-volt/10 blur-[120px]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#fff" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="relative mx-auto max-w-[86rem]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div data-reveal>
            <Eyebrow light>Nos engagements</Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
              La confiance se construit <span className="serif-accent text-volt">à chaque chantier.</span>
            </h2>
          </div>
          <p data-reveal data-delay="0.1" className="max-w-lg text-[1.02rem] leading-relaxed text-white/60 lg:justify-self-end">
            Nous intervenons chez vous comme si c’était chez nous : avec rigueur, transparence et le souci du travail bien fait.
          </p>
        </div>
        <div className="mt-16 h-px origin-left bg-white/15" data-line />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <div
              key={p.t}
              data-reveal
              data-delay={i * 0.08}
              className="group border-white/10 py-10 sm:pr-8 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-volt transition-colors duration-500 group-hover:bg-volt group-hover:text-night">
                <p.icon size={22} />
              </span>
              <h3 className="mt-6 text-lg font-bold">{p.t}</h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-white/55">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export function Contact() {
  return (
    <section id="contact" className="bg-ivory px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[86rem] gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div data-reveal>
          <Eyebrow>Contact</Eyebrow>
          <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-night">
            Demandez votre <span className="serif-accent text-night/80">devis personnalisé.</span>
          </h2>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-mute">
            Décrivez-nous votre projet : nous revenons vers vous rapidement pour en parler et organiser une visite si nécessaire.
          </p>
          <ul className="mt-10 space-y-3">
            {[
              { icon: IconPhone, label: SITE.phone, href: SITE.phoneHref },
              { icon: IconMail, label: SITE.email, href: `mailto:${SITE.email}` },
              { icon: IconPin, label: SITE.area },
              { icon: IconClock, label: SITE.hours },
            ].map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <a href={c.href} className="group flex items-center gap-4 rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_20px_40px_-25px_rgba(13,27,61,0.4)]">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-night text-volt">
                      <c.icon size={19} />
                    </span>
                    <span className="font-semibold text-night">{c.label}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl bg-white/60 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-sand text-night">
                      <c.icon size={19} />
                    </span>
                    <span className="font-medium text-night/80">{c.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal data-delay="0.1">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-night px-5 pb-10 pt-20 text-white sm:px-8">
      <div className="mx-auto max-w-[86rem]">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-[0.95rem] leading-relaxed text-white/55">L’énergie de vos projets, la confiance en plus.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40">Navigation</p>
              <ul className="mt-4 space-y-2.5 text-white/75">
                <li><a className="hover:text-volt" href="#accueil">Accueil</a></li>
                <li><a className="hover:text-volt" href="#prestations">Nos prestations</a></li>
                <li><a className="hover:text-volt" href="#expertise">Notre expertise</a></li>
                <li><a className="hover:text-volt" href="#realisations">Réalisations</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40">Prestations</p>
              <ul className="mt-4 space-y-2.5 text-white/75">
                <li>Installation électrique</li>
                <li>Mise en conformité</li>
                <li>Éclairage</li>
                <li>Dépannage</li>
              </ul>
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40">Contact</p>
              <ul className="mt-4 space-y-2.5 text-white/75">
                <li><a className="hover:text-volt" href={SITE.phoneHref}>{SITE.phone}</a></li>
                <li><a className="hover:text-volt" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
                <li><a className="font-semibold text-volt" href="#contact">Demander un devis</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} UGB Électricité. Tous droits réservés.</p>
          <p>Mentions légales · Politique de confidentialité</p>
        </div>
      </div>
    </footer>
  );
}
