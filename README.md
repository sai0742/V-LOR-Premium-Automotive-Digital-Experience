# VÉLORÉ — The Art of the Long Way

An original illustrated automotive archive for a **fictional** independent marque. Built with React, TypeScript and Vite. No vehicle sales, production claims, analytics, backend, or subscription service.

## Run locally

Requires Node.js 22.12+ (or a current supported Node release).

```sh
npm ci
npm run dev
```

Vite listens on `0.0.0.0:5173`. `npm run build` type-checks and generates `dist/`. Deploy that directory at the domain root on a static host (Vercel, Netlify, or Cloudflare Pages). The included `vercel.json` and `public/_redirects` serve `/anatomy` through the SPA entry point, including on direct links and reloads. Other hosts need an equivalent rewrite of `/anatomy` and `/anatomy/` to `/index.html`. GitHub Pages project subpaths additionally require asset/base and router-path configuration; a plain static-file upload without route fallback will not support direct anatomy links. No environment variables or secrets are needed. Set the canonical site URL and an absolute Open Graph image URL in `index.html` when a production domain is chosen.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

The Playwright configuration uses a development-only bundled Linux Chromium (`@sparticuz/chromium`) because the Arena environment blocks the standard Playwright browser CDN. It automatically extracts the companion NSS/NSPR libraries into the operating system’s temporary directory. `npm test` works directly in this Linux environment. For macOS/Windows or conventional CI, install standard Playwright Chromium and remove the custom `launchOptions` and Linux extraction setup from `playwright.config.ts`.

The **37 browser tests** cover five archive viewport sizes (320–1440px), five assembled/exploded atelier sizes, native scroll and scrubber controls, projected SVG leaders, direct part selection, the notebook portal/paper transition, deep links and browser history, cross-route anchors, mobile menu focus/escape, touch interaction, live cursor coordinates/loupe/magnetism, pencil-to-colour images, variable-font ink reveals, short landscape layouts, reduced-motion changes, the skippable brand introduction, pointer/touch/keyboard Auren inspection and reversible final-page scroll progress. Three axe checks cover archive/atelier semantics and contrast at desktop and phone sizes. Automated accessibility checks are a baseline, not a claim of complete accessibility conformance. Screenshots are generated in ignored `test-results/`.

## Structure

- `src/components/`: individually maintained story sections, navigation, registry, the brand introduction and the pointer-responsive Auren study.
- `src/styles/experience.css`: the short opening sequence and restrained, reduced-motion-aware vehicle inspection styling.
- `src/style.css`: the original archive layouts and responsive rules.
- `src/styles/atelier.css`: tactile theme, gallery shader, portal, paper transition and compass cursor.
- `src/styles/anatomy.css`: pinned drafting table, 3D SVG planes, annotations, controls and field notes.
- `src/components/anatomy/`: five original SVG assembly drawings and their illustrative annotations.
- `src/hooks/`: native-scroll projection, two-view History API routing and on-entry ink reveals.
- `public/images/`: local WebP illustrations and source-reference derivatives.
- `tests/`: archive, atelier and automated accessibility regression checks.

## Art & interaction

Supplied VÉLORÉ emblem and development sketch remain in the experience. The navigation uses a cropped derivative of the original emblem, not a replacement mark. The supplied watercolor is retained as an archive asset; the supplied cartoon and interface screenshots informed direction but are not presented as original vehicle artwork. Newly generated Auren, Sirène and cockpit watercolor/ink concept illustrations complete the visual story. Detail studies are deliberate crops from the same Auren artwork. Google Font families are packaged locally via Fontsource: Cormorant Garamond, DM Sans and IBM Plex Mono.

### Opening & Auren inspection

The first visit opens with the existing VÉLORÉ winged-V emblem and the established VÉLORÉ wordmark, then dissolves into the archive in about 1.8 seconds. It can be skipped, is omitted for reduced-motion visitors, and is remembered across refreshes. The introduction never locks scrolling or the underlying navigation.

The **02 — The first expression** Auren board reuses the original `auren-studio.webp` illustration. The repository contains no vehicle model, turntable, or multi-angle image sequence, so this is deliberately an honest, limited-view presentation rather than a claimed 3D/360° rotation: mouse movement, horizontal touch-drag, and arrow keys ease the complete, undistorted image plane by a few pixels, with a working recenter control. The interaction is disabled for reduced motion. A properly licensed, matching Auren model or aligned render sequence would be needed for true vehicle rotation.

### Exploded Blueprint Atelier (v2)

**Entry & navigation.** The taped “Studio Notes / Sheet 07” card in Section 04 is a real, keyboard-accessible link. Hover/focus lifts the sheet, peels its masking tape in 3D and reveals the magnetic “Explore Technical Disassembly →” badge. Touch and reduced-motion visitors always see the badge. An archival three-panel paper-fold transition opens the dedicated `/anatomy` view; the main navigation includes **Anatomy**. Same-origin page changes use the History API, with back/forward, focus placement, scroll restoration, cross-route anchors and direct-route reload support. Normal in-page anchors remain native.

**The drawing.** A sticky drafting table spans a native **400vh** scroll range. Five separately authored SVG studies share a common axonometric coordinate system:

1. Aero Coachwork Shell
2. Tubular Spaceframe Chassis
3. Naturally Aspirated V12 Powertrain
4. Double-Wishbone Suspension & Wire Wheels (72 individually drawn spokes per wheel)
5. Hand-Stitched Cockpit & Wood Rim Steering

Scroll progress rotates the camera and separates the planes along Y and Z on staggered, normalized timelines (coachwork, cockpit, powertrain, chassis, then running gear). Annotations gain contrast and live SVG leaders draw in as their corresponding assemblies move; reverse scrolling naturally reconstructs the car. Pencil contours, hatching, dimension marks, millimetre-style grids and registration crosses make up the sheet. Each leader endpoint is measured from the **actual transformed SVG anchor**, not an approximate screen coordinate. Select either the drawing or a numbered callout to inspect a part; its companions recede and a field note appears. The native range scrubber is keyboard-accessible; **Assembled / Exploded** seek the same scroll timeline. Five unpinned illustrated field notes remain available below it. There is no WebGL/model download, wheel interception or scroll-jacking.

**Tactile theme.** Charcoal `#1A1817`, vintage vermilion `#8C2D19` and warm cream stock are shared throughout the experience.

- The original dual-ring cursor has become an **architect’s crosshair + compass** with live 8px monospace X/Y coordinates. Artwork and car parts morph it into a loupe. Event-delegated magnetic targets still pull by up to 10px, including after route changes. Pointer tracking is outside React render state and its animation frame sleeps at rest.
- All gallery `Artwork` plates combine a warm sepia print, halftone grain and a real SVG Laplacian pencil-edge filter. Hover cross-dissolves the pencil pass into the colour illustration with a restrained pointer-driven 3D pan. Existing material crops and hero multiply/soft-light blending are preserved.
- Locally packaged **Cormorant Garamond Variable** (300–700, upright + italic) gives italic headings and handwritten notes an on-entry ink-settling opacity/blur reveal and genuine variable-weight swell. Text is readable before enhancement runs.
- The archive’s **100px section scroll margins** remain intact.

**Fallbacks & performance.** Coarse pointers retain their native cursor and do not run parallax; portal and assembly controls remain discoverable by touch. `prefers-reduced-motion` removes the custom cursor, magnetism, page fold, ink animation, parallax and automatic camera motion. Instead of a pinned marathon, it presents a fully exploded static sheet with instantly operable drawing controls. Very short/landscape viewports (≤520px tall) also use this unpinned manual sheet. Preferences and resizing are observed live. SVG drawings are memoized; scroll/resize work is batched into one requestAnimationFrame, and observers, listeners and pending frames/timers are cleaned up. Animated drawing subtrees are excluded from browser scroll anchoring so projection cannot feed back into scroll position.

All dimensions, mechanical choices and material descriptions in the atelier are **fictional design annotations**, not engineering or production specifications.

## Registry integration

This is explicitly a validation demo. Emails stay only in React memory while the page is open; nothing is logged, persisted, sent or actually subscribed. To enable real subscription, replace the submit handler in `Registry.tsx` with a request to a same-origin server endpoint, handle loading/failure states, obtain consent, add a privacy policy, rate-limit the endpoint and keep provider credentials server-side. Do not change the message to a subscription confirmation until that endpoint confirms success.

## Scope

All marque history, materials and layouts are artistic concepts, not factual product specifications. The materials selector shows illustrated material contexts rather than a production configurator. Supplied reference artwork is used as provided; obtain appropriate rights clearance before commercial publication. No PR should be merged without owner approval.
