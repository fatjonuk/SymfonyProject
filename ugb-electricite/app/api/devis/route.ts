import { NextResponse } from "next/server";

/**
 * Quote request endpoint.
 * Validates the payload; plug your e-mail service / CRM where indicated.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: silently accept bots without processing.
  if (typeof body.website === "string" && body.website.length > 0) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || body.consent !== true) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });
  }

  const request = {
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone: String(body.phone ?? "").slice(0, 40),
    city: String(body.city ?? "").slice(0, 120),
    property: String(body.property ?? "").slice(0, 60),
    types: Array.isArray(body.types) ? body.types.map(String).slice(0, 10) : [],
    message: message.slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  // TODO: send `request` by e-mail (Resend, SMTP…) or push it to a CRM.
  console.info("[devis] nouvelle demande", { ...request, message: `${request.message.length} caractères` });

  return NextResponse.json({ ok: true });
}
