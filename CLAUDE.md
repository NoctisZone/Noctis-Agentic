# CLAUDE.md: Noctis Agentic (noctisagentic.zone)

Rules for this repository. ARCHITECTURE.md is the design, PLAN.md the phases and fees.

## This repository is public

- Never commit internal tracker IDs, secrets or anything secret-shaped, or exploit mechanics.
- Never state that a weakness is open. Describe the guarantee the code or the design makes, not the gap. A
  mechanism may be explained only in the change that closes it.
- Risk analysis, costs, funding, dates, partner detail and the design pack stay in `local/`, which is
  gitignored. Keep them there.
- Re-read every diff against these rules before committing.

## Naming

- The platform is **Noctis Agentic**. Never call it "the Zone", "Agentic Zone" or "Zone contract": Noctis
  Zone is the separate launchpad for people at noctis.zone.
- Noctis Agentic is not linked to noctis.zone or noctisswap.zone. Never say or imply that it shares their
  contracts, pools or fees, or that its coins graduate onto NoctisSwap.

## Fees

- Noctis Agentic charges **machine fees**; noctis.zone and noctisswap.zone charge human fees. Never write
  "same as noctis.zone".
- Launch $10 in NIGHT · registration $5 plus a $25 bond · curve 1.5% (0.5 creator, 1.0 platform) · after
  graduation 0.50% (0.25 creator, 0.20 platform, 0.05 pool) plus 1 NIGHT per sealed order.
- Take every fee from `FEES` in `assets/js/shared.js`. Never type a fee into a page.

## Stack

- Static HTML, CSS and vanilla JavaScript. No framework, no bundler, no build step, no npm dependencies.
- `404.html` must stay byte-identical to `index.html`; it serves every deep link on GitHub Pages.
- `assets/js/noctis-agentic-core.js` is lifted verbatim from the design. Don't reorder or "tidy" its seeded
  random calls: that changes the city and every avatar.
- `assets/css/tokens.css` is the design's token sheet, unchanged except for its font import. Don't retype
  tokens or hard-code a hex that has one.

## Never

- Add a wallet connect button. Sign-in is Midnight City only.
- Add human buy, sell or launch controls. Agents trade; people watch and set policy.
- Add Cardano or Solana. Midnight only.
- Draw coin logos as pixel art. They are solid colour circles with Montserrat 800 initials.
- Add a 2D city or a 2D/3D toggle.
- Show the retro monitor on a phone.
- Bold the pixel font (Jersey 20). Keep `font-synthesis-weight: none`.
- Show visible scrollbars.
- Remove the concept label while the site shows illustrative data.

## Always

- `data-theme="agentic"` on html, body and the app root.
- The 5-colour cycle `HUE[i % 5]` (#FF2FB0 #00E5FF #00FFA3 #FFD400 #FF7A1A) for repeated items.
- 2px solid borders and no radius, except coin circles and the CRT frame.
- Offset pixel shadows only (`Npx Npx 0`), never blurred shadows on UI.
- Shielded values render `▒▒▒▒` until REVEAL, and the real value is not in the DOM while hidden.
- Cross-site links are absolute, with `target="_blank" rel="noopener"`.
- View preferences persist under `noctis-agentic-view` only.
- Respect `prefers-reduced-motion`: MOTION defaults to OFF.
- A `:focus-visible` pink ring on every control, and 44px touch targets on phones.

## Fonts

Jersey 20 (headlines, numbers, buttons) · JetBrains Mono (labels, figures) · Inter (sentences) ·
Montserrat 700/800 (coin initials only). Self-hosted from `assets/fonts/`.
