# VÉLORÉ — The Art of the Long Way

An original illustrated automotive archive for a **fictional** independent marque. Built with React, TypeScript and Vite. No vehicle sales, production claims, analytics, backend, or subscription service.

## Run locally

Requires Node.js 22.12+ (or a current supported Node release).

```sh
npm ci
npm run dev
```

Vite listens on `0.0.0.0:5173`. `npm run build` type-checks and generates `dist/`. Deploy that directory to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages with an appropriate Vite base). No environment variables or secrets are needed. Set the canonical site URL and an absolute Open Graph image URL in `index.html` when a production domain is chosen.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

The Playwright configuration uses a development-only bundled Linux Chromium (`@sparticuz/chromium`) because the Arena environment blocks the standard Playwright browser CDN. It automatically extracts the companion NSS/NSPR libraries into the operating system’s temporary directory. `npm test` works directly in this Linux environment. For macOS/Windows or conventional CI, install standard Playwright Chromium and remove the custom `launchOptions` and Linux extraction setup from `playwright.config.ts`.

Eight browser tests cover five viewport sizes (320, 375, 768, 1024, 1440), document overflow, image loading, console errors, material switching, form validation, anchor navigation, mobile menu focus/escape and reduced motion. Screenshots are generated in ignored `test-results/`.

## Structure

- `src/components/`: individually maintained story sections, navigation, registry and shared presentation primitives.
- `src/style.css`: palette, type, layouts, interactions and responsive/reduced-motion rules.
- `public/images/`: local WebP illustrations and source-reference derivatives.
- `tests/site.spec.ts`: browser regression checks.

## Art & interaction

Supplied VÉLORÉ emblem and development sketch remain in the experience. The navigation uses a cropped derivative of the original emblem, not a replacement mark. The supplied watercolor is retained as an archive asset; the supplied cartoon and interface screenshots informed direction but are not presented as original vehicle artwork. Newly generated Auren, Sirène and cockpit watercolor/ink concept illustrations complete the visual story. Detail studies are deliberate crops from the same Auren artwork. Google Font families are packaged locally via Fontsource: Cormorant Garamond, DM Sans and IBM Plex Mono.

Motion is CSS and IntersectionObserver only: sequenced-feeling entrance, on-entry reveals, restrained image hover, tactile links, and a compact scrolled navigation. Paper shadows and rotated notebook layers provide depth; there is **no interactive 3D model**, scroll-jacking or continuous animation. Observer and event listeners are cleaned up. Content is visible without reveal scripts. Reduced-motion disables motion and smooth scrolling.

## Registry integration

This is explicitly a validation demo. Emails stay only in React memory while the page is open; nothing is logged, persisted, sent or actually subscribed. To enable real subscription, replace the submit handler in `Registry.tsx` with a request to a same-origin server endpoint, handle loading/failure states, obtain consent, add a privacy policy, rate-limit the endpoint and keep provider credentials server-side. Do not change the message to a subscription confirmation until that endpoint confirms success.

## Scope

All marque history, materials and layouts are artistic concepts, not factual product specifications. The materials selector shows illustrated material contexts rather than a production configurator. Supplied reference artwork is used as provided; obtain appropriate rights clearance before commercial publication. No PR should be merged without owner approval.
