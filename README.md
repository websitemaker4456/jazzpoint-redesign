# JazzPoint — Area Manager App (Design Handoff)

## Project goal
JazzPoint is a telecom retail/franchise management app. This build covers the **Area Manager** view, where a manager checks their float (Jazz Load), how many days it will last, today's sales, agent stock health and KPI progress, and jumps into MYOP, Commission, Float and Hierarchy Performance. The redesign keeps the familiar grid layout but improves hierarchy, adds status colours, and replaces the three large bottom buttons with a frosted-glass pill nav.

> **About these files.** `/design/*.dc.html` are **high-fidelity HTML design references** (open them in a browser). `index.html` + `css/styles.css` + `js/main.js` are a clean, semantic starting implementation of the Main screen. Build the remaining screens to match the references, using the same stylesheet and tokens. If the target is a native/React app, recreate the designs in that stack instead of shipping this HTML.

**Hosting:** static site (Netlify/Vercel/any CDN) for the prototype build. No server code is needed. Data comes from the endpoints listed under Integrations.

---

## Page list
| File | Purpose | Status |
|---|---|---|
| `index.html` | Area Manager home: balance, runway, stats, KPIs, quick actions | ✅ exported |
| `myop.html` | MYOP campaign performance | build from `design/Area Manager - MYOP.dc.html` |
| `commission.html` | Commission earned breakdown | build from `design/Area Manager - Commission.dc.html` |
| `float.html` | Float history and runway detail | build from `design/Area Manager - Float.dc.html` |
| `hierarchy-performance.html` | KPI performance by hierarchy | build from `design/Area Manager - Hierarchy Performance.dc.html` |
| `tss-list.html` | TSS drill-down list | build from `design/…Hierarchy Performance - TSS List.dc.html` |
| `franchise-list.html` | Franchise drill-down list | build from `design/…Hierarchy Performance - Franchise List.dc.html` |

Menu, Notifications and Dark Mode are **states of `index.html`** (drawer, panel, `data-theme="dark"`), not separate pages. The `design/Area Manager - Menu / Notifications / Dark Mode.dc.html` files predate the latest Main polish, so treat `Area Manager - Main.dc.html` as the source of truth for shared parts.

---

## Main screen: section by section
1. **Header** (frosted glass). Dark→brick gradient at about 80–90% opacity, three blurred glows (red, amber, brick) behind it, and a top light sheen. Contents: JazzPoint wordmark, dark-mode toggle, notifications bell with unread badge, menu. Greeting: "Hello, Hassaan" / "Area Manager", plus an avatar.
2. **Balance card.** Left: *Available Jazz Load* amount, an "Updated …" timestamp and a refresh button. Right: *Recharge In* shows `N.N days` plus 7 segments (1 segment = 1 day). The number and the filled segments share one status colour. Tapping it goes to `float.html`.
3. **Stats row** (3 columns). *Sales Today* (value + ▲/▼ % vs yesterday chip, green or red), *Agents* (count + "N have stock"), *Low Balance* (count + stock-out % chip, coloured by threshold).
4. **My Performance.** A horizontally scrollable KPI carousel (6 cards: label, %, red progress bar). "View all" and a Hierarchy Performance row both link to `hierarchy-performance.html`.
5. **Quick Actions.** A 3×3 grid of equal-height tiles (icon chip + one-line label): MYOP, Float, Commission, Franchise Survey, Campaign, Retailer Performance, Bash Performance, Agent List, More. Tiles are visual only, with no live badges.
6. **Promo banner.** A grayscale photo, Urdu RTL copy in accent-500, and carousel dots.
7. **Bottom nav** (frosted glass pill, same gradient as the header). Home · MYOP · Commission · Float · Performance. The active tab sits on a solid red pill that slides to the tapped tab.
8. **Back-to-top.** Appears after 300px of scroll. The red conic ring fills with scroll progress.

---

## Interactions & states
- **Hover (desktop):** cards and tiles lift (`--shadow-hover`). Icon buttons get a 12% white tint on the header. The refresh button border and icon turn accent.
- **Press:** `scale(.94–.97)`, 150ms, spring easing `cubic-bezier(.32,.72,0,1)`. Nav items scale to `.88`.
- **Focus:** 2px accent `:focus-visible` outline on everything interactive.
- **Refresh balance:** idle arrow → spinning (0.7s linear loop) → check (1.2s) → idle.
- **Pull-to-refresh** (in the reference, not yet in the export): ring fills with drag distance, spins on release, morphs to a check.
- **Nav indicator:** slides in 450ms, then navigates after 300ms.
- **Panels:** notifications panel and menu drawer fade/scale in (160–180ms). The overlay, the ✕ button or `Esc` closes them. "Mark all read" clears the unread dots and the badge.
- **Dark mode:** toggles `data-theme` on `<html>`, saved in `localStorage` (`jp-theme`).
- **Reduced motion:** all animations collapse to 1ms.
- **Mobile menu:** the right-side drawer (78% width, max 290px).
- **Forms:** none on these screens. Any future forms follow the `:focus-visible` and error colour (`--color-bad`) tokens.

### Status rules
| Metric | Good | Warn | Bad |
|---|---|---|---|
| Runway days (`float ÷ avg daily use, last 7d`) | > 3 | 1.5–3 | < 1.5 |
| Sales vs yesterday | ≥ 0 → green ▲ | — | < 0 → red ▼ |
| Low balance stock-out % | < 5% neutral | 5–10% amber | ≥ 10% red |

---

## Integrations to wire up
- `GET /me` → name, role
- `GET /float` → `available`, `avgDailyUse7d`, `updatedAt` (drives balance and runway)
- `GET /dashboard/today` → `salesToday`, `salesYesterday`, `agentCount`, `agentsWithStock`, `lowBalanceCount`
- `GET /kpis` → `[{ id, label, pctOfTarget }]`
- `GET /notifications`, `POST /notifications/read-all`
- Promo banner → CMS or static JSON (`image`, `copyUr`, `link`)
- Analytics: `<!-- ANALYTICS / TAG MANAGER SNIPPET -->` in `<head>`. Track `kpi_view`, `quick_action_tap`, `balance_refresh`, `nav_tap`.

All placeholders use `data-bind="…"` attributes in `index.html`.

---

## Build instructions for Claude Code
1. Match the design references exactly (spacing, type, colour, radius, motion). Open each `design/*.dc.html` side by side with your build.
2. Use `css/styles.css` tokens only. No new hex values and no inline styles, except the dynamic KPI bar width and the `--progress` variable.
3. Build the remaining pages listed above, reusing the header, card, tile and nav classes. Inner pages use the same bottom nav with the matching `aria-current`.
4. Keep the markup semantic (`header / main / nav / section / ul`), comment each section, and keep JS vanilla and small.
5. Replace Lucide CDN icons with an inline SVG sprite or local copies before production.
6. Optimise images (WebP + JPEG fallback, `loading="lazy"`, explicit width and height).
7. Test on real devices: Android Chrome (primary), iOS Safari, 360–412px widths. Check `backdrop-filter` fallbacks (the gradient is still opaque enough to read).

---

## Acceptance checklist
- [ ] Main screen matches `design/Area Manager - Main.dc.html` at 412px wide (light and dark)
- [ ] Header and bottom nav are frosted glass with the same gradient, and content blurs behind the nav when scrolling
- [ ] Runway number and segments change colour together at the thresholds
- [ ] Sales chip is green ▲ / red ▼; Low Balance colours follow the thresholds
- [ ] KPI bars cap at 100% width when the value is above 100%
- [ ] All interactive elements have hover, press and focus-visible states
- [ ] Nav indicator slides before navigating, and the active tab is correct on every page
- [ ] Notifications and menu open and close (overlay, ✕, Esc); mark-all-read works
- [ ] Dark mode persists across reloads
- [ ] Back-to-top appears after 300px and the ring tracks scroll
- [ ] No console errors; Lighthouse mobile performance ≥ 90 and accessibility ≥ 95
- [ ] Layout holds at 360, 412, 480, 768 and 1024px
- [ ] Promo placeholder is replaced with the real asset
- [ ] All pages in the Page list exist and link correctly

---

## Design tokens
All are defined in `css/styles.css :root`, with dark overrides in `[data-theme="dark"]`.

**Colours (light / dark)**
- Accent `#ec3013` · Accent 500 `#ff563c` · Accent 700 `#ae1800` / `#ff9783`
- Accent soft (icon chip) `#fff0ec` / `rgba(236,48,19,.22)`
- Background `#f3f2f2` / `#17140f` · Surface `#ffffff` / `#241f1d`
- Text `#201e1d` / `#f4f1ef` · Muted `rgba(32,30,29,.60)` / `rgba(244,241,239,.62)`
- Divider `rgba(32,30,29,.12)` / `rgba(255,255,255,.10)` · Track `rgba(32,30,29,.08)`
- Good `#1a7f45` / `#7ddc9a` · Warn `#9a6400` / `#f5c451` · Bad `#b3200a` / `#ff8f7a`
- Header gradient `160deg: #17130f → #4d170e → #7c1405` (alpha .92 / .82 / .78)
- Nav gradient `110deg`, same stops (alpha .72 / .70 / .68), glass edge `rgba(255,255,255,.16)`
- Glows: `#ec3013` (.55), `#ff8a3d` (.28), `#7c1405` (.5)

**Type:** Archivo (Google Fonts), weights 400, 500, 600, 700, 800.
Scale: 10 · 10.5 · 12 · 13 · 15 (body) · 19 · 20 · 24 · 28 · 30px. Titles are 800 uppercase with .02em tracking.

**Spacing:** 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24px.
**Radius:** 4 (segments) · 12 (KPI, row) · 14 (tiles, stats) · 20 (balance, promo) · 24 (header bottom) · 31 (nav pill).
**Shadows:** card `0 1px 2px rgba(0,0,0,.14)` · hover `0 6px 14px rgba(0,0,0,.10)` · nav `0 12px 32px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.06)` · panel `0 20px 40px rgba(0,0,0,.30)`.
**Motion:** 150ms press, 300ms colour, 450ms nav slide, spring `cubic-bezier(.32,.72,0,1)`.

---

## Asset list
| File | Size | Format | Used in | Status |
|---|---|---|---|---|
| `assets/promo-banner.jpg` | 824×300 (2×) | JPEG/WebP | Promo banner | ⚠️ **PLACEHOLDER — supply real photo** |
| `assets/jazzpoint-logo-icon.png` | see file | PNG, transparent | App icon / splash | provided |
| `assets/jazzpoint-logo-icon-3.png` | see file | PNG, transparent | Alt logo mark | provided |
| `assets/icon-myop.png`, `icon-myop-plan.png`, `icon-kpi.png`, `icon-bash.png`, `icon-bundles.png`, `icon-prepaid.png`, `icon-postpaid.png` | see file | PNG, red line art | Legacy/Retailer icons (not used on AM Main) | provided |
| UI icons | 11–22px | Lucide (SVG) | Every icon on Main | CDN → replace with local sprite |
| Wordmark | — | Live text (Archivo 800) | Header | no file needed |
| Avatar | 44×44 | Lucide `user` | Header | ⚠️ swap for user photo if the API provides one |

---

## Folder structure
```
/design                 HTML design references (*.dc.html, support.js, image-slot.js)
/assets                 logo, icons, promo image
/css/styles.css         shared tokens + components
/js/main.js             UI interactions
index.html              Area Manager – Main
myop.html               (to build)
commission.html         (to build)
float.html              (to build)
hierarchy-performance.html, tss-list.html, franchise-list.html  (to build)
README.md
```
