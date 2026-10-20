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

The **37 browser tests** cover five archive viewport sizes (320–1440px), five assembled/exploded atelier sizes, native scroll and scrubber controls, leaders projected from live WebGL anchors, direct part selection, the notebook portal/paper transition, deep links and browser history, cross-route anchors, mobile menu focus/escape, touch interaction, live cursor coordinates/loupe/magnetism, pencil-to-colour images, variable-font ink reveals, short landscape layouts, reduced-motion changes, the skippable brand introduction, pointer/touch/keyboard Auren inspection and reversible final-page scroll progress. Three axe checks cover archive/atelier semantics and contrast at desktop and phone sizes. Automated accessibility checks are a baseline, not a claim of complete accessibility conformance. Screenshots are generated in ignored `test-results/`.

## Structure

- `src/components/`: individually maintained story sections, navigation, registry, the brand introduction and the pointer-responsive Auren study.
- `src/styles/experience.css`: the short opening sequence and restrained, reduced-motion-aware vehicle inspection styling.
- `src/style.css`: the original archive layouts and responsive rules.
- `src/styles/atelier.css`: tactile theme, gallery shader, portal, paper transition and compass cursor.
- `src/styles/anatomy.css`: pinned drafting table, WebGL plate, projected annotations, controls and field notes.
- `src/components/anatomy/`: the five original SVG assembly studies (used for the field notes and the no-WebGL fallback) and their illustrative annotations.
- `src/three/`: the procedural Auren GT (`carModel.ts`), the ink/material factory (`draft.ts`) and the renderer, camera, lights and anchor projection (`anatomyScene.ts`).
- `src/hooks/`: the damped scroll engine and projected-anchor writer, two-view History API routing and on-entry ink reveals.
- `public/images/`: local WebP illustrations and source-reference derivatives.
- `tests/`: archive, atelier and automated accessibility regression checks.

## Art & interaction

Supplied VÉLORÉ emblem and development sketch remain in the experience. The navigation uses a cropped derivative of the original emblem, not a replacement mark. The supplied watercolor is retained as an archive asset; the supplied cartoon and interface screenshots informed direction but are not presented as original vehicle artwork. Newly generated Auren, Sirène and cockpit watercolor/ink concept illustrations complete the visual story. Detail studies are deliberate crops from the same Auren artwork. Google Font families are packaged locally via Fontsource: Cormorant Garamond, DM Sans and IBM Plex Mono.

### Opening & Auren inspection

The first visit opens with the existing VÉLORÉ winged-V emblem and the established VÉLORÉ wordmark, then dissolves into the archive in about 1.8 seconds. It can be skipped, is omitted for reduced-motion visitors, and is remembered across refreshes. The introduction never locks scrolling or the underlying navigation.

The **02 — The first expression** Auren board reuses the original `auren-studio.webp` illustration. The repository contains no vehicle model, turntable, or multi-angle image sequence, so this is deliberately an honest, limited-view presentation rather than a claimed 3D/360° rotation: mouse movement, horizontal touch-drag, and arrow keys ease the complete, undistorted image plane by a few pixels, with a working recenter control. The interaction is disabled for reduced motion. A properly licensed, matching Auren model or aligned render sequence would be needed for true vehicle rotation.

### Exploded Blueprint Atelier (v2)

**Entry & navigation.** The taped “Studio Notes / Sheet 07” card in Section 04 is a real, keyboard-accessible link. Hover/focus lifts the sheet, peels its masking tape in 3D and reveals the magnetic “Explore Technical Disassembly →” badge. Touch and reduced-motion visitors always see the badge. An archival three-panel paper-fold transition opens the dedicated `/anatomy` view; the main navigation includes **Anatomy**. Same-origin page changes use the History API, with back/forward, focus placement, scroll restoration, cross-route anchors and direct-route reload support. Normal in-page anchors remain native.

**The drawing.** A sticky drafting table spans a native **400vh** scroll range. The centre of the plate is now a live **Three.js / WebGL** scene rather than a stack of SVG planes. Nothing is downloaded: the Auren GT is generated procedurally at runtime from vector geometry, so it inherits the same drafting DNA as the rest of the archive.

- **Rigging.** A transparent, full-bleed canvas sits pinned behind the typography (`z-index: 1` under the annotation layer). One `requestAnimationFrame` loop owns the whole plate. Scroll only writes a _target_; the scene chases it with exponential damping (`1 - e^(-4.6·dt)`), so every assembly accelerates and settles like a heavy mechanism instead of snapping to the wheel. Pointer parallax is damped separately at a gentler rate.
- **The machine.** The coachwork is a 64-station lofted section surface with a true circular wheel opening cut around each hub, glazing laid on the loft, and ink seams, shut lines, arch lips, grille, lamps and haunch vents projected a few tenths of a millimetre outside the skin. The spaceframe is a hand-placed triangulated tube matrix with brazed joints, cradles and floor bracing. The V12 is an alloy block with canted heads, finned covers and twelve intake trumpets with rust lips. The cockpit carries a floor pan, dash, three analogue dials, a walnut-rim wheel and stitched seats. Each wheel is a tyre, rim bed, 32 laced spokes and a brake disc.
- **Smart explosion.** `separationWindows` drives each assembly on its own staggered timeline: the body shell lifts `+1.26 m` and rolls a degree, the chassis drops `-0.40 m`, the running gear moves outboard `±0.52 m` and forward `0.14 m`, and the engine block slides forward `-0.52 m` to expose the frame. Because the parts are real 3D groups, occlusion, perspective and depth ordering are all automatic.
- **Callouts.** The numbered annotations are still real `<button>`s, but they are now **projected from live 3D anchor nodes** — a zero-size field is repositioned every frame from `Object3D.getWorldPosition() → Vector3.project(camera)`. The SVG leaders terminate on the same projected point, and both are written from the values produced that frame rather than re-reading layout. As an assembly separates, its annotation gains contrast and its vector pointer draws itself in.
- **Fallbacks.** The WebGL chunk is dynamically imported; until it arrives the plate shows the original vector coachwork study, and if WebGL is unavailable the SVG stays. `prefers-reduced-motion` and short landscape screens use the static, fully exploded sheet with instant controls. The camera, anchors, leaders and marker buttons all read from the same progress value, and the canvas itself is `aria-hidden` — the accessible surface remains the buttons, the scrubber and the insight panel.

Five separately modelled assemblies, each still documented in the field notes below:

1. Aero Coachwork Shell
2. Tubular Spaceframe Chassis
3. Naturally Aspirated V12 Powertrain
4. Double-Wishbone Suspension & Wire Wheels
5. Hand-Stitched Cockpit & Wood Rim Steering

Select either an anchor or a numbered callout to inspect a part: the selected assembly re-inks in vermilion, its companions fade to a pale ghost and a field note appears. The native range scrubber is keyboard-accessible; **Assembled / Exploded** seek the same scroll timeline. There is no scroll-jacking and no downloaded model or texture.

**Tactile theme.** Charcoal `#1A1817`, vintage vermilion `#8C2D19` and warm cream stock are shared throughout the experience.

- The original dual-ring cursor has become an **architect’s crosshair + compass** with live 8px monospace X/Y coordinates. Artwork and car parts morph it into a loupe. Event-delegated magnetic targets still pull by up to 10px, including after route changes. Pointer tracking is outside React render state and its animation frame sleeps at rest.
- All gallery `Artwork` plates combine a warm sepia print, halftone grain and a real SVG Laplacian pencil-edge filter. Hover cross-dissolves the pencil pass into the colour illustration with a restrained pointer-driven 3D pan. Existing material crops and hero multiply/soft-light blending are preserved.
- Locally packaged **Cormorant Garamond Variable** (300–700, upright + italic) gives italic headings and handwritten notes an on-entry ink-settling opacity/blur reveal and genuine variable-weight swell. Text is readable before enhancement runs.
- The archive’s **100px section scroll margins** remain intact.

**Performance.** The scene is merged into a handful of draw calls per assembly (one mesh per ink tone plus three line batches), pixel ratio is capped at 1.75, and the loop sleeps whenever the sheet is off-screen or the scroll and pointer targets have settled. `will-change` is released under reduced motion. Coarse pointers retain their native cursor and do not run parallax; portal and assembly controls remain discoverable by touch. `prefers-reduced-motion` removes the custom cursor, magnetism, page fold, ink animation, parallax and automatic camera motion. Instead of a pinned marathon, it presents a fully exploded static sheet with instantly operable drawing controls. Very short/landscape viewports (≤520px tall) also use this unpinned manual sheet. Preferences and resizing are observed live. SVG drawings are memoized; scroll/resize work is batched into one requestAnimationFrame, and observers, listeners and pending frames/timers are cleaned up. Animated drawing subtrees are excluded from browser scroll anchoring so projection cannot feed back into scroll position.

All dimensions, mechanical choices and material descriptions in the atelier are **fictional design annotations**, not engineering or production specifications.

## Registry integration

This is explicitly a validation demo. Emails stay only in React memory while the page is open; nothing is logged, persisted, sent or actually subscribed. To enable real subscription, replace the submit handler in `Registry.tsx` with a request to a same-origin server endpoint, handle loading/failure states, obtain consent, add a privacy policy, rate-limit the endpoint and keep provider credentials server-side. Do not change the message to a subscription confirmation until that endpoint confirms success.

## Scope

All marque history, materials and layouts are artistic concepts, not factual product specifications. The materials selector shows illustrated material contexts rather than a production configurator. Supplied reference artwork is used as provided; obtain appropriate rights clearance before commercial publication. No PR should be merged without owner approval.
