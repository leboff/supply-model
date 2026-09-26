# Restyle: make the Constrained Supply Model look like a Logility-style enterprise planning app

Keep ALL existing model logic, tests, URL-hash sharing, CSV export, compare mode and presets working. `js/model.js` must not change behavior; `node --test tests/` must still pass. This is a UI/layout/theming rewrite of `index.html`, `css/styles.css`, `js/app.js`, `js/charts.js`.

## Visual language (Logility brand, sampled from logility.com)
- Font: "Kumbh Sans" from Google Fonts (fallback: "Open Sans", system-ui). Numbers in grids use `font-variant-numeric: tabular-nums`.
- Colors (CSS variables):
  - `--navy: #12232D` (top app bar, left nav rail, primary text headings)
  - `--ink: #04030F` (body text)
  - `--teal: #3B8F81` (primary brand / primary buttons / active states / selected tab underline); hover `#2F7568`
  - `--lime: #8FCE00` (positive / healthy accents, sparingly)
  - `--orange: #F4562C` (exceptions, shortages, alerts)
  - `--purple: #6750A0` (secondary series)
  - `--blue: #215FC9` (info / links / tertiary series)
  - Surfaces: app background `#F6F8F8`, panels `#FFFFFF`, borders `#DDE3E6`, muted text `#5B6B73`, grid header `#EEF2F3`.
- LIGHT theme (enterprise planner look), NOT the current dark theme. Square-ish corners (4px radius), thin 1px borders, subtle shadows only on panels. Dense, professional, data-first. No emoji anywhere.

## Layout (mimic an enterprise supply chain planning workbench)
1. **Top app bar** (navy, 52px): left: a simple text/SVG wordmark "Supply Planning Workbench" with a small teal geometric mark (do NOT use or copy Logility's actual logo; generic mark only). Center-left: breadcrumb "Supply Planning › Constrained Allocation › Scenario: <preset name>". Right: plan version pill ("Plan v26.39 · Draft"), a "Run Plan" teal button (re-runs sim), and a user avatar circle "BL".
2. **Left nav rail** (navy, 64px icons + labels on hover or 200px expanded on desktop): Home, Demand, Inventory, **Supply** (active, teal left border), S&OP, Scenarios, Reports. Only Supply is functional; others are visual (clicking shows a small toast "Module not included in this mock").
3. **Workspace header** row: page title "Constrained Supply Plan", subtitle with horizon ("26 weekly buckets · starting Wk 40 2026"), and tabs: **Overview | Planning Grid | Allocation | Exceptions | Assumptions** (teal underline on active). Tab content switches client-side.
4. **Right-hand "Parameters" panel** (collapsible, 320px) holding the existing controls, restyled as compact form fields grouped in accordion sections (Scenario presets, Supply sources, Demand segments, Allocation policy). Presets as a segmented control / dropdown. On narrow screens it becomes a slide-over drawer.

## Tab contents
- **Overview**: KPI tiles row (Fill Rate, Units Shipped, Lost Sales, Backlog, Margin Captured vs Unconstrained (show % and $ gap), Ending Inventory, Constrained Weeks, Avg Capacity Utilization) — each tile: label, big number, small delta vs pinned scenario A (green up/orange down arrows) and a tiny sparkline. Below: two charts side by side: "Supply vs Demand" (demand line, available supply bars, constrained weeks shaded light orange) and "Fill Rate by Segment".
- **Planning Grid** (the signature Logility look): a spreadsheet-style time-phased grid. Columns = weeks (Wk 40 … Wk 13 style labels, sticky first column, horizontal scroll). Rows grouped with expand/collapse caret: 
  - Supply: Capacity (per plant), Planned Production, Arrivals, Projected On-Hand, Safety Stock
  - Demand: Gross Demand by segment, Total Demand
  - Allocation: Shipped by segment, Backlog, Lost Sales
  - Measures: Fill Rate %, Capacity Utilization %
  Conditional formatting: cells where on-hand < safety stock tinted light orange; shortage/lost-sales cells orange text; fill rate ≥ 98% lime-tinted. Totals column at far right. Compact 28px rows, zebra striping, sticky header row.
- **Allocation**: stacked bar chart of shipments by segment per week + a table ranking segments by fill rate, margin, lost units; show which policy is active with a short description.
- **Exceptions**: a list/table of generated exception alerts (derive from sim output): e.g. "Wk 47 — Projected on-hand below safety stock (−180)", "Wk 44–47 — North Plant outage: capacity −100%", "Mid-Market — fill rate 71% below 90% target", with severity chips (High=orange, Medium=purple, Low=blue), and a count badge on the tab.
- **Assumptions**: the "How the model works" explanation, restyled as documentation, plus a table of current parameter values.

## Charts
- Chart.js with brand palette: segments in order teal, navy, purple, blue, lime; demand line navy dashed; shortages orange. Light gridlines `#E6EBED`, Kumbh Sans ticks, legend at bottom, no chart borders. 

## Footer / status bar
Thin status bar at bottom: "Mock data — for illustration only · Last run: <time> · Policy: <policy> · Seed: <seed>".

## Engineering
- Keep static (nginx), no build step. Keep file structure; you may add `js/grid.js`, `js/exceptions.js`.
- Must render well at 1440px desktop and be usable on a phone (nav rail collapses to a bottom bar or hamburger; grid scrolls horizontally).
- Verify: `node --test tests/` passes; serve with `python3 -m http.server` and curl every referenced local asset (no 404s). 
- Commit: `git commit -am "Logility-style enterprise planning UI"` (add new files). Do not push.
