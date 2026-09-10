# Brinks Home BHX Design System

The design system for **BHX** — [bhx.brinkshome.com](https://bhx.brinkshome.com), the Brinks Home™ partner-facing marketing site where security and alarm business owners join the Dealer or Direct programs, become enterprise partners, or sell their alarm accounts and businesses to Brinks Home.

Brinks Home is one of the largest home security companies in North America, trusted by over 1 million people, with 165+ years behind the Brinks name. BHX is its B2B front door: partner acquisition, account acquisition, and the Account Value Calculator.

## Sources

Everything here was lifted from code, not from screenshots.

| Source | What came from it |
| --- | --- |
| `github.com/LiveWatch/app279-brinks-home-x` (branch `main`) | The BHX Nuxt 3 app — page structure, components (`TopNavBar`, `CustomButton`, `MinimalFooterBase`, `QuestionAnswerAccordion`, section templates), the type scale in `assets/css/global.css`, and the UI icon set in `public/` |
| `github.com/LiveWatch/bhs-shared-assets` (branch `master`) | The company-wide pattern library (ITCSS + Bootstrap 4 SCSS). Colour palette, spacing, radii, shadows, button/card/navbar/modal rules, the Brinks Home logo files, the rebrand icon library, and the webfonts |
| [bhx.brinkshome.com](https://bhx.brinkshome.com) (live) | Real product copy — page content is authored in Contentful, so it is not in the repo |

Both repos are private. If you have access, read them for anything this system doesn't cover — `bhs-shared-assets/src/scss/` is the authoritative source for every value here, and the app repo shows how those values get used on a real page.

Products represented: **one** — the BHX partner marketing site. The wider Brinks Home consumer site, customer portal and technician app live in other repos and are out of scope.

## Content fundamentals

**Voice: confident, plain, partner-to-partner.** BHX is selling a business relationship to people who already run businesses. Copy is direct and benefit-first, never breathless.

- **Second person, and "we" for Brinks.** "Whether you're scaling your business or interested in selling it, Brinks Home meets you where you are." / "We ensure that our partners are set up for success."
- **Title Case for every heading**, sentence case for body. "Secure Opportunities and Unlock Growth", "Working With Brinks Home is a Win/Win", "Built on Trust", "Award-Winning Service".
- **Headlines are short and promise-shaped**, usually 3–7 words: "Grow Your Business With Brinks Home™", "Funding by the Numbers", "Building Trust, Together", "Take the Next Step".
- **Body paragraphs are 1–3 sentences.** One idea, then stop. Long explanations belong in the FAQ accordion, where full paragraphs are fine.
- **Buttons are 2–3 words, sentence-shaped, no punctuation:** "Join Today", "Get Started", "Join Us", "Contact Us", "Get Template", "Upload Template", "Read Our Blog", "Submit". The polite decline is "Not at This Time".
- **Numbers do the arguing.** "165+ years", "over 1 million people", "92%* of calls resolved without transfer", "44 States Where Sales Were Funded", "10:1 Ratio of Dealers to Funding Specialists". Every claim that can carry an asterisk does, with the footnote right below: "*As of March 2024, per Cresta analysis."
- **Trademark discipline:** the brand is written **Brinks Home™** on first appearance in a heading or legal line. Never "Brinks" alone.
- **Errors are full sentences with a period:** "This field is required.", "Email address is invalid.", "Phone number is invalid.", "Please select a file to upload."
- **Legal copy is long, unbroken and small** — the TCPA consent paragraph under every form runs 60+ words at 0.667rem. Don't shorten it, don't bullet it.
- **No emoji. Ever.** No exclamation marks outside a quoted testimonial. No first-person singular except in partner quotes.
- **Em dashes are used freely** in headings and body: "It's not just about selling security, but fostering relationships—and having fun along the way."

## Visual foundations

**The look:** dark navy institutional, one loud green, a lot of white space, real photography of real people. It reads like a bank that sells security, which is exactly right.

**Colour.** Four colours carry everything: dark blue `#0F2835` (nav, dark sections, all headings and body text), light blue `#1E5B71` (accent sections, borders, rules, active markers), CTA green `#17824A` (every conversion action, nothing else), and warm gray `#DCD8D1` (form backgrounds, quiet sections). A six-step blue ramp (`#253541` → `#14779B`) covers footers and hovers. Purples and greens exist in the palette for theme classes but almost never appear on BHX. **Max two background colours per page** — typically white alternating with dark blue, plus one light-blue block. Text on dark is pure white; muted text on dark is `rgba(255,255,255,.73)`.

**Type.** Root font size is **18px**, so 1rem = 18px and every value below is bigger than it looks. Headings are **Work Sans** 700 (h6 is 600); body is **Roboto**; **Nib** is the brand display face (trial cuts, rarely used on BHX). Desktop ladder: h1 2.667rem/55px, h2 2.11rem/45px, h3 1.44rem/33px, h4 1.33rem/31px, h5 1.11rem/27px, h6 0.89rem/25px. Body 0.89rem/24px, `big` 1.333rem/31px, `small` 0.667rem/19px. Base line-height is the golden ratio, 1.618. All-caps runs (the layered heading, eyebrows) get 0.025em tracking at weight 800 and are scaled to 0.91× to compensate for optical size.

**Layout.** A single centred container, max 1366px, 2rem gutters (1rem under 576px). Sections pad 2rem top and bottom on mobile, 3rem on desktop. Content is centre-aligned on marketing pages and left-aligned inside forms and articles. The navbar is fixed to the top with a 2px/6px shadow; nothing else is fixed. Grids are 3-up for features, 4–5-up for program tiles, 2-up for forms.

**Backgrounds and imagery.** Full-bleed photography with a `rgba(40,67,84,.902)` scrim behind copy; otherwise flat colour. Photography is warm, natural-light, people-at-work — technicians, sales reps, handshakes — never stock-abstract, never grayscale, never grainy. **No gradients anywhere.** No patterns, no textures, no illustrations beyond the flat brand icon set.

**Corners, borders, shadows.** Radii are deliberately shallow: 0.18rem default, 0.3rem for cards, **5px for buttons**, 50% for numeral discs. Borders are heavy — 2px is the default border width, form inputs are 2px, and modals carry a **15px solid dark-blue frame** that is the single most recognisable structural detail in the brand. Shadows are tight, black and low-opacity: header `0 2px 6px rgba(0,0,0,.08)`, card `2px 3px 1px 1px rgba(0,0,0,.06)`, button `0 2px 6px 1px rgba(0,0,0,.18)`. Never a coloured or blurred-out shadow.

**Cards** are white, `0.3rem` radius, no border by default, a faint shadow, image on top at a fixed height, then heading, one paragraph, and a CTA pinned to the bottom. The partner-bio variant adds a 1px `#7E8183` hairline and reveals a solid dark-blue overlay on hover.

**Motion and states.** Everything is short and literal. Buttons swap background colour over 200ms ease-out — no lift, no scale. Cards lift `translateY(-2px)` and deepen their shadow (100ms/200ms ease-out). Nav chevrons rotate 180° over 300ms ease-in-out; the FAQ chevron rotates 90°. Accordions animate `grid-template-rows: 0fr → 1fr` over 200ms — no fade, no measured height. Press state is an inset shadow `inset 0 3px 5px rgba(0,0,0,.125)`; links darken 7%. Focus is a darkened 2px border, never a glow ring. **There are no bounces, springs, parallax effects or entrance animations in this brand.**

**Transparency and blur.** Transparency is used for exactly three things: the photo scrim, the modal backdrop `rgba(0,0,0,.5)`, and idle tab fills `rgba(40,67,84,.12)`. **Blur is never used.**

## Iconography

Two shipped sets, both real files in `assets/icons/` — copied out of the source repos, none redrawn.

- **`assets/icons/ui/`** — flat single-colour UI glyphs from the BHX app's `public/` directory: `chat-bubble-outline`, `icon-chevron-down`, `phone_white`, `icon-check-white`, `calculator`, `cloud-upload`, `attach-email`, `download`, `icon-send`, `help`, `info`, `refresh`, `delete`, `fileupload`, `arrowup`, `right-blue-arrow`, `Wheelchair`. Rendered at 1.5rem beside button text or 1rem inline. Most carry their colour in the file (`#0F2835` or white), so pick the right file rather than recolouring.
- **`assets/icons/brand/`** — the Brinks Home rebrand icon library from `bhs-shared-assets/static/icons/rebrand/`: `bh_icons_award`, `bh_icons_badge_check`, `bh_icons_app`, `bh_icons_chat`, `bh_icons_document`, `bh_icons_book`, `bh_icons_cart`, `bh_icons_code`, `bh_icons_alarm_on/off`, `bh_icons_door_sensor`, plus `Check`, `Menu`, `Phone`, `Search`, `SmartPlugs`. Single-weight line icons on a 24px grid. The full library also contains large product illustrations (SmartPanel, VideoDoorbell, Thermostat, cameras) — pull those from the repo if a page needs product imagery.

The shared-assets repo also ships an **icomoon icon font and an SVG sprite** (`static/icons/symbol-defs.svg`, ~360 individual icomoon SVGs). Legacy Brinks pages reference it as `icon-*` classes; BHX itself has moved to plain `<img>` tags pointing at SVG files, which is the pattern this system follows. **No icon CDN is used and none should be introduced** — if a glyph is missing, take it from `bhs-shared-assets/static/icons/`. Emoji are never used. Unicode characters are used only for `™`, `©`, `&times;` (modal close) and `&mdash;`.

**No logo was invented.** `assets/logos/` contains the real shipped files: `BH_primary_white_TM.svg`, `BH_primary_blue_TM.svg`, `brinks-home-primary-tm.svg`, `BrinksShield.svg`, `faveicon_32x32.png`.

## Fonts

| Family | Role | Where it comes from |
| --- | --- | --- |
| Work Sans 400/500/600/700 | All headings | Google Fonts, exactly as the BHX app loads it |
| Roboto Light/Regular/Medium/Bold/Black | Body copy, buttons, form text | `.ttf` files copied from `bhs-shared-assets/static/fonts/` |
| Nib Light/Regular/Semibold/Bold/Black/Italic | Brand display face | `.otf` **trial** files copied from `bhs-shared-assets/static/fonts/` |

⚠️ **Nib is a trial licence.** The files in the source repo are named `nib-*-trial.otf`. Do not ship them to production without a licensed cut. Nothing on BHX currently depends on Nib — it is included because the shared-assets repo declares it as a brand face.

## Index

| Path | What's there |
| --- | --- |
| `styles.css` | The entry point consumers link — imports Work Sans and every token file |
| `tokens/` | `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `fonts.css` (@font-face) |
| `assets/` | `logos/`, `icons/ui/`, `icons/brand/`, `fonts/` |
| `guidelines/` | 19 specimen cards for colour, type, spacing, brand and motion |
| `components/` | React primitives, grouped by concern (below) |
| `ui_kits/bhx/` | Clickable recreation of the BHX partner site — see its `README.md` |
| `SKILL.md` | Agent Skills entry point |
| `github.md` | Source-repo association for one-click sync |

### Components

**`components/core/`** — `Button`, `Icon`, `Logo`, `LayeredHeading`, `Section`, `Card`, `Banner`, `Steps`
**`components/forms/`** — `Field`, `Input`, `Select`, `Checkbox`, `FileUpload`
**`components/navigation/`** — `NavBar`, `Footer`, `Tabs`
**`components/feedback/`** — `Accordion`, `Modal`

Every component has a sibling `.d.ts` (props) and `.prompt.md` (when to use it, with a usage example). Each directory has one `@dsCard` HTML showing its variants.

**Component inventory is source-driven.** Each of these maps to something real: `Button` ← `CustomButton.vue` + `_components.bootstrap.buttons.scss`, `Icon` ← `Icon.vue`, `Logo` ← `BrinksLogo.vue`, `LayeredHeading` ← `HeadingLayered.vue` + `_components.layered-heading.scss`, `Section` ← `SectionBase.vue`/`BgImgWrapper.vue`/`_objects.section.scss`, `Card` ← the program-tile and partner-bio patterns, `Banner` ← `BannerComponent.vue`, `Steps` ← `_components.steps.scss`, form parts ← `ContactUsForm.vue`/`Multiselect.vue`, `NavBar` ← `TopNavBar.vue`, `Footer` ← `MinimalFooterBase.vue`, `Tabs` ← the FAQ tab row in `sectionTypeT.vue`, `Accordion` ← `QuestionAnswerAccordion.vue`, `Modal` ← `RequestConsultationModal.vue` + `_components.bootstrap.modal.scss`.

**Intentional additions:** `Field` (a label + error wrapper — the source repeats this markup inline on every form field, so it was factored out) and `Icon`'s asset-path helper. Nothing else was invented.

**Deliberately not built:** `GaugeMeter.vue` (the Account Value Calculator gauge — a chart.js data widget), `sectionInteractiveMap.vue` (180 KB of inline state SVG), `AwardsCarousel`/`CustomCarousel` (keen-slider wrappers; the UI kit shows their content as static grids), and the icomoon icon-font layer.

### Asset paths in components

Components reference their icons and logos relatively (`assets/icons/...`). When a page lives in a subdirectory, set the base before rendering:

```html
<script>window.BHX_ASSET_BASE = "../../";</script>
```

Absolute URLs and paths starting with `/` are passed through untouched.
