# Build: Constrained Supply Model (mock, interactive)

Build a polished, self-contained, single-page web app that simulates a **supply-constrained planning & allocation model** with mock data. It will be deployed as a static site behind nginx in Docker, so NO build step, NO backend. Plain HTML/CSS/vanilla JS (ES modules OK). Charting via Chart.js loaded from a CDN (jsdelivr) is fine.

## Model (keep the math in its own module `js/model.js`, pure functions, no DOM)
Multi-period (weekly, default 26 weeks) simulation:
- **Supply side**: 1–3 plants/suppliers, each with weekly capacity, yield %, lead time (weeks), and an optional capacity ramp or outage window (e.g. plant 2 down weeks 8–11). Starting inventory. Optional safety-stock target.
- **Demand side**: 3–5 customer segments/channels (e.g. Strategic Accounts, Enterprise, Mid-Market, E-commerce, Distributors), each with baseline weekly demand, growth %/wk, seasonality amplitude, random noise (seeded RNG so results are reproducible), priority tier, unit margin, and a backorder vs lost-sale flag (backlog carries forward if backorder; otherwise lost).
- **Allocation policies** (user-selectable): 
  1. Priority (strict tier order)
  2. Fair-share (pro-rata to demand)
  3. Margin-maximizing (highest margin first)
  4. Hybrid: reserve X% for top tier, pro-rata the rest
- Each week: arrivals from production (respecting lead time & yield) → available = on-hand → allocate across (new demand + backlog) → update backlog/lost sales/inventory.
- **Outputs/KPIs**: fill rate overall & by segment, units shipped, backlog over time, lost sales, revenue/margin captured vs unconstrained, inventory, capacity utilization, weeks constrained, and the "binding constraint" per week (capacity vs lead-time vs inventory).

## UI
- Left panel: grouped controls (Supply, Demand, Policy, Scenario) with sliders + numeric inputs; changes re-run instantly.
- Scenario presets buttons: "Balanced", "Supply Shock (plant outage)", "Demand Surge", "Long Lead Times", and a "Randomize seed".
- Main area: KPI cards row; charts: (1) supply vs demand stacked over time with constrained weeks shaded, (2) fill rate by segment over time, (3) backlog & inventory lines, (4) allocation by segment stacked bar; and a sortable per-week table (collapsible).
- Compare mode: pin current scenario as "A" and show deltas vs current in KPI cards.
- Export: download results CSV, and copy a shareable URL (encode params in the URL hash; loading a hash restores the scenario).
- Clean modern dark theme, responsive, looks good on a phone (controls collapse into a drawer on narrow screens). Title: "Constrained Supply Model". Small footer: "Mock data — for illustration only".
- A short collapsible "How the model works" section explaining the logic and equations in plain English.

## Engineering
- Files: `index.html`, `css/styles.css`, `js/model.js`, `js/app.js`, `js/charts.js`, plus `Dockerfile` (nginx:alpine, copies site to /usr/share/nginx/html, listens on 80), `docker-compose.yml` for Dokploy:
  ```yaml
  services:
    supply:
      build: .
      restart: unless-stopped
      networks: [dokploy-network]
  networks:
    dokploy-network:
      external: true
  ```
  and an `nginx.conf` with `Cache-Control: no-cache` for html/js/css and gzip on.
- Tests: `tests/model.test.mjs` runnable with plain `node --test` (Node built-in test runner, no npm deps) covering: conservation (shipped + backlog + lost == demand per segment, cumulatively), no allocation exceeds available, priority policy serves higher tiers first, fair-share proportions, lead time delays arrivals, seed reproducibility.
- Run `node --test tests/` and make sure all pass. Also sanity-check the page loads by serving it (`python3 -m http.server`) and fetching index.html + the JS modules with curl (no 404s). Do NOT use docker.
- README.md with a one-paragraph description and how to run locally.
- `git add -A && git commit -m "Constrained supply model: initial build"` when done. Do not push.
