# Rework: match the Logility DemandAI+ "Workbench" screen layout exactly (adapted to supply)

Reference screenshot description is below. Replace the current enterprise layout with a faithful recreation of this screen's STRUCTURE and STYLE, adapted to our constrained-supply model. Keep `js/model.js` behavior unchanged and `node --test tests/` passing. Keep CSV export, URL-hash sharing, presets and pin/compare working (move them into the new header controls). Static site, no build step. Chart.js via CDN plus `chartjs-plugin-annotation` via jsdelivr is allowed. Font: Inter (Google Fonts), fallback Open Sans/system-ui.

Do NOT use Logility's logo or the word "logility". Use a generic wordmark "supplyplan" in bold charcoal preceded by a small green (#6CC24A) rounded-rectangle outline icon (inline SVG). No emoji anywhere (check index.html <title>).

## Palette
page bg #F3F5F7; cards #FFFFFF with 1px #E4E7EB border, radius 6, faint shadow; primary teal #1A8A9C (hover #157A8A); navy #1E2D5A; lighter navy #34487A; periwinkle area #AFC3EC @60%; light-blue #7C95D6; blue #4F74D1; orange #F2A36B; alert red #E8453C; success green #5ED49A; text #23272F; secondary #6B7280; borders #E5E7EB; gridlines #EEF0F3; disabled bg #E6E8EB text #A0A6AE; segmented active #E9EDF2.

## 1. Top nav bar (white, 58px, bottom border)
Left: logo mark + "supplyplan". Tabs (13px, ~20px padding): **Workbench** (active, semibold) | Events | Data | Portfolio Management | Engine | Performance Management. Non-Workbench tabs show a small toast "Not included in this mock". Right cluster: navy circular assistant avatar (small robot glyph via SVG) with teal accent, teal outline "?" help icon, teal share icon (three nodes; clicking copies share link), user chip (bordered box ~170px: gray circle "BL", "Bryan Leboff", chevron).

## 2. Page header row (on page bg, 48px)
Left: teal collapse-sidebar icon (toggles sidebar) + "Workbench" in teal 20px. Right, items separated by thin vertical dividers #D9DDE2: toggle switch ON (teal) labeled "Sync filters"; download icon "Export" (CSV); upload icon "Upload" (disabled look, toast); square refresh button (re-run/reset to preset); "Save adjustments" button — disabled grey until the user edits a grid cell or param, then turns teal and "saves" = pins scenario A (compare deltas).

## 3. Left sidebar (white card ~240px, own vertical scroll)
- "Filters" title + right-aligned undo / redo (grey #E1E4E8 40x30, wired to param history) and a white bordered ✕ close.
- Two mini summary cards side by side: "Unit of measure ‹ UNITS ›" and "Plan Version ‹ 09/28/2026 ›" (tiny grey uppercase).
- Navy panel (#1E2D5A radius 6) with two stacked dropdowns (bg #34487A white text): "Scenario" (sub-label = current preset: Balanced / Supply Shock / Demand Surge / Long Lead Times) and "Allocation policy" (Priority / Fair-share / Margin-max / Hybrid).
- Section header chevron + "SUPPLY SOURCES" (11px semibold navy uppercase, letter-spacing): outlined 44px fields with floating labels for each plant's weekly capacity, yield %, lead time, outage window.
- Section "DEMAND SEGMENTS": per segment baseline, growth, priority tier, margin, backorder toggle. Plus "Demand multiplier" and "Seed".
- Section "PLAN SETTINGS": weeks, starting inventory, safety stock, hybrid reserve %.
- Pinned bottom navy bar: "Engine status: StateCompleted" bold + legend of 8px colored squares with counts derived from the sim: red = high-severity exceptions, yellow = weeks below safety stock, green = weeks fully served, teal = weeks constrained, blue = segments with lost sales. Chevron toggles a small list of exceptions.

## 4. Main card 1: "Current Plan graph" + green 6px live dot
Header controls right-aligned: outlined select with notched floating label "Plan Components" (SHOW • Capacity/Arrivals/On-hand toggles as a multi-select with colored dot), From / To date inputs (floating labels, kebab icon) controlling the visible week window, segmented 1W | 1M | 1Q | 1Y (bucket aggregation: 1M = 4-week sums, 1Q = 13-week, 1Y = all), expand ⛶ and collapse ⌃ icons (teal).
Legend row (10-11px grey, right aligned) and Chart.js plot:
- Periwinkle filled area = Available Supply (arrivals + on-hand)
- Orange line = Capacity (sum of plants, after yield)
- Navy line = Total Demand
- Navy dashed = Backlog-adjusted demand (demand + carried backlog)
- Teal 2.5px line = Shipped
- Dark dashed = Safety stock
- Light-blue dashed upper/lower envelope = demand ± noise band (e.g. ±1.5σ from segment noise)
- Red ~12px circle markers on weeks with lost sales / stockout; green ~10px markers on weeks with 100% fill peaks.
- Vertical dashed "today" line at week 1 boundary is not needed; instead dashed divider between "Plan" and "Frozen horizon" at the max lead time week.
- Hovering/clicking a red marker opens a popover card anchored near the point: title "Supply Shortfall" in red, body "Wk 44 shows 1,240 units less than demand." (computed), teal "Resolve" button that applies a suggested fix (e.g., bump the constrained plant capacity by the shortfall or switch to Hybrid policy) and re-runs. Show a crosshair + date pill on the x-axis for the hovered week.
- Below the plot: a ~35px range navigator — mini line of total demand for the full horizon, with a draggable/selectable window (diagonal teal hatch, handles) that sets From/To.
Y-axis ticks formatted like 0, 500, 1K, 1.5K (compact). X ticks as dates MM/DD/YYYY starting 09/28/2026 weekly.

## 5. Main card 2: "Current Plan Table" + green dot
Header controls: "Aggregations" outlined dropdown (Segment / Plant / Total), "Table View" composite select (e.g. "Shipped | Demand" — choose measure shown in week columns: Shipped, Demand, Lost Sales, Backlog, Fill Rate), From/To, segmented 1W/1M/1Q/1Y, teal "Recenter" button (resets window), expand/collapse.
Grid:
- Header row 40px, bold 12-13px; date columns two lines: date, then "Σ 12.3K" total.
- Rows 35px, 1px horizontal borders, checkbox column (~30px), frozen left columns: Segment, Tier, Policy Rule, **Demand Total** (teal, sortable with arrow), **Shipped Total**, Fill %. Horizontal scroll under the frozen pane; vertical scroll.
- Numbers right-aligned, compact K formatting. Weeks inside the frozen horizon (≤ max lead time) in teal; later weeks in dark text; vertical dashed line at the boundary.
- Cells are editable in Demand view (click → input); an edit overrides that segment/week demand in a local override map passed to the simulation (add an optional `demandOverrides` param to the config consumed by model.js ONLY if it doesn't change existing test behavior — default empty), marks "Save adjustments" active, and re-runs.
- Shortfall cells (lost > 0) get a small red dot; fill <90% cells red text.
- Aggregation rows by Plant show capacity/arrivals/utilization per plant.

## Behavior
Whole page fits a 1440–2000px desktop like the screenshot: sidebar left, the two cards stacked on the right each ~45% of viewport height. On mobile, sidebar becomes a drawer, cards full width, grid scrolls.

## Verify & commit
- `node --test tests/` passes (add a test for demandOverrides if you add it).
- Run `node --check --input-type=module < file` on EVERY js file (a syntax error slipped through last time).
- Serve with `python3 -m http.server` and curl all local assets (no 404s).
- Additionally, run a headless smoke test if Chrome/Chromium is available (`chromium --headless --dump-dom` or similar) to confirm the grid table has > 5 rows and 2 canvases render; if not available, skip.
- `git add -A && git commit -m "Workbench layout (DemandAI+-style)"`. Do not push.
