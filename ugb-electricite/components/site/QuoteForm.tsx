"use client";

import { useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

const TYPES = ["Installation électrique", "Mise en conformité", "Éclairage", "Dépannage / maintenance", "Borne de recharge", "Étude & conseil"];
const PROPERTY = ["Maison", "Appartement", "Local professionnel", "Autre"];

type Errors = Partial<Record<"name" | "email" | "phone" | "message" | "consent" | "form", string>>;

export function QuoteForm() {
  const [types, setTypes] = useState<string[]>([]);
  const [property, setProperty] = useState(PROPERTY[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const toggle = (t: string) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
      types,
      property,
    };
    const err: Errors = {};
    if (data.name.length < 2) err.name = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = "Adresse e-mail invalide.";
    if (data.phone && !/^[+\d][\d\s.-]{7,}$/.test(data.phone)) err.phone = "Numéro de téléphone invalide.";
    if (data.message.length < 10) err.message = "Décrivez votre projet en quelques mots.";
    if (!data.consent) err.consent = "Merci d’accepter d’être recontacté.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("idle");
      setErrors({ form: "L’envoi a échoué. Merci de réessayer ou de nous appeler directement." });
    }
  }

  if (status === "sent") {
    return (
      <div className="flex h-full min-h-[28rem] flex-col items-start justify-center rounded-[2rem] bg-white p-8 sm:p-12">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-volt text-night">
          <IconCheck size={26} />
        </span>
        <h3 className="mt-8 text-3xl font-semibold tracking-[-0.02em] text-night">
          Merci, <span className="serif-accent">votre demande est bien envoyée.</span>
        </h3>
        <p className="mt-4 max-w-md text-mute">Nous étudions votre projet et revenons vers vous très rapidement.</p>
      </div>
    );
  }

  const label = "mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.12em] text-night/60";
  const err = (k: keyof Errors) => errors[k] && <p className="mt-1.5 text-[0.8rem] font-medium text-orange-700">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(13,27,61,0.5)] sm:p-10">
      <fieldset>
        <legend className={label}>Votre projet</legend>
        <div className="flex flex-wrap gap-2" role="group">
          {TYPES.map((t) => (
            <button key={t} type="button" role="checkbox" aria-checked={types.includes(t)} onClick={() => toggle(t)} className="chip">
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className={label}>Type de bien</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {PROPERTY.map((p) => (
            <button key={p} type="button" role="radio" aria-checked={property === p} onClick={() => setProperty(p)} className="chip">
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Nom & prénom
          </label>
          <input id="name" name="name" autoComplete="name" className="field" aria-invalid={!!errors.name} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="city" className={label}>
            Ville / code postal
          </label>
          <input id="city" name="city" autoComplete="postal-code" className="field" />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            E-mail
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className={label}>
            Téléphone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" aria-invalid={!!errors.phone} />
          {err("phone")}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="message" className={label}>
          Description du projet
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="field resize-none"
          placeholder="Surface, travaux envisagés, délais…"
          aria-invalid={!!errors.message}
        />
        {err("message")}
      </div>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-[0.85rem] leading-snug text-mute">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#0D1B3D]" />
        J’accepte que mes données soient utilisées pour être recontacté au sujet de ma demande.
      </label>
      {err("consent")}

      {errors.form && <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">{errors.form}</p>}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-8 w-full justify-center sm:w-auto">
        {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande de devis"}
        <IconArrow size={17} className="btn-arrow" />
      </button>
    </form>
  );
}
