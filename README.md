# FEXO — Frontend

A [Next.js](https://nextjs.org) (App Router + TypeScript) storefront for
FEXO — light, minimal Zara/Snitch-style design (white/off-white with dark
text), GSAP scroll reveals + Lenis smooth scroll + magnetic buttons +
animated loader, fully responsive.

This app was converted from the previous Django-templates frontend
(`templates/` + `static/`, now removed) that the [backend](../Fexo_backend)
repo used to render server-side. It is now a standalone app.

## Status: mock-data phase (no backend wiring yet)

The Django backend has no REST API today (no DRF, no serializers) — it's
still a plain server-rendered Django project. So for now this app runs
entirely on:

- **Mock content** — `src/lib/mock-data.ts` (products, categories,
  collections, banners, testimonials, journal posts, FAQs, etc.), read
  through the accessor functions in `src/lib/data.ts`.
- **Client-side mock cart / wishlist / auth** — `src/context/*.tsx`,
  persisted to `localStorage` (see `src/lib/storage.ts`). Add-to-bag,
  wishlist toggling, coupon codes, sign up / sign in, saved addresses, and
  placing an order all actually work today, just without a server behind
  them.

Every one of those seams has a `// PHASE 2:` comment marking the Django
REST endpoint it should call once the backend grows an API — wiring this
app up to the real backend is deliberately a separate, later piece of
work.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build (also type-checks)
npm run lint    # ESLint
```

## Structure

```
src/
├── app/          # routes (App Router) — one folder per URL segment
├── components/
│   ├── chrome/   # nav, footer, loader, search overlay, mobile menu,
│   │             # Lenis/GSAP wiring (ports of the old fexo.js)
│   ├── product/  # product card/grid/gallery/actions/reviews
│   ├── ui/       # small shared bits (page header, star rating, ...)
│   └── account/  # account sidebar, auth guard
├── context/      # Cart / Wishlist / Auth / Message providers (mock, see above)
└── lib/          # types, mock data, data-access functions, pricing math,
                   # localStorage helpers
```

`src/app/globals.css` is `fexo.css` ported close to as-is — same CSS
custom properties and `.fx-*` class names as the original templates, so
markup and styling stay easy to cross-reference against the old repo's
git history.

## Editing
- Content: edit `src/lib/mock-data.ts`.
- Data-access seam (what becomes real API calls in Phase 2): `src/lib/data.ts`.
- Styling: `src/app/globals.css`, hand-written, no preprocessor.
