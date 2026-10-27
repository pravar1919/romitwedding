# Romit & Ayushi · #ROHI

Wedding invitation site. Next.js (static export) served from Cloudflare Workers static assets.

## Editing content

Everything guests see — names, dates, events, venue, travel notes, gallery — lives in `lib/config.ts`.

- **Gallery photos:** put images in `public/gallery/` and set `src: '/gallery/<file>.jpg'` on each gallery item.
- **Ganpati image:** `public/ganpatiji.webp`. **Logo / link-preview image:** `public/rohi-logo.jpg`.
- **Page markup:** `content/invite-markup.ts`. **Behaviour & animation:** `lib/invite.ts`. **Styles:** `app/globals.css`.

## Develop

```sh
npm install
npm run dev        # http://localhost:3000
npm run preview    # production build served by wrangler at http://localhost:8787
```

## Deploy

```sh
npx wrangler login   # one-time
npm run deploy       # next build → wrangler deploy
```

For a custom domain, add it to your Cloudflare account, add it to `routes` in `wrangler.jsonc`, and set `siteUrl` in `lib/config.ts` to the same address (used for WhatsApp/iMessage link previews).
