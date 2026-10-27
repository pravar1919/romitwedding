import { CONFIG } from "./config";

// Link-preview text for WhatsApp / iMessage, built from the event list so it stays in sync.
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: CONFIG.timezone, ...o }).format(new Date(iso));
const time = (iso: string) => fmt(iso, { hour: "numeric", minute: "2-digit", hour12: true }).replace(":00", "").toUpperCase();

const days = new Map<string, string[]>();
for (const e of CONFIG.events) {
  const day = fmt(e.start, { weekday: "short", day: "numeric", month: "short" });
  days.set(day, [...(days.get(day) ?? []), `${e.name} ${time(e.start)}`]);
}

const venue = CONFIG.venues[0];

export const shareTitle = `Wedding Invitation · ${CONFIG.couple.a} weds ${CONFIG.couple.b} · 29–30 November 2026`;
export const shareDescription =
  `You are warmly invited to our wedding celebrations — join us at ${venue.name}, ${CONFIG.city.split(",")[0]}. ` +
  [...days].map(([day, items]) => `${day}: ${items.join(", ")}`).join(" · ");
export const shareImage = { url: "/og-wedding-v6.jpg", secureUrl: `${CONFIG.siteUrl}/og-wedding-v6.jpg`, type: "image/jpeg", width: 800, height: 420, alt: `${CONFIG.couple.a} & ${CONFIG.couple.b} in wedding attire` };
