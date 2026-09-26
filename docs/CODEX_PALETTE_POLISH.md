# Color/fidelity polish pass to match the reference screenshot

Reference image: docs/reference.png (2034x907). Current render for comparison: docs/current.png. Keep ALL behavior/tests; `node --test tests/` must pass; run `node --check --input-type=module < f` on every JS file. Commit: "Match reference palette + polish". Do not push.

## Authoritative palette (pixel-sampled from the reference — use these exact hexes)
- Primary teal (icons, title, active values, Resolve/Recenter, main series line): **#1A9BB2**; darker teal for main plotted line & hover: **#147F93**; deep teal accent **#036475**
- Navy (sidebar panel, engine bar, card titles, trend/forecast lines): **#183462**
- Steel blue dropdown tiles inside navy panel (whole tile incl. label+value, white text): **#5E7191**
- Top nav bar bg **#F0F0F0**; active tab white **#FFFFFF**; logo green **#61D300**
- Sidebar bg **#F5F5F5**; field borders **#D7D7D7**; disabled/secondary button fill **#E0E0E0**; scroll thumb **#B0B0B0**
- Page / card bg **#FFFFFF**; table header bg **#F9F9F9**; table borders **#DDDDDD**; header text **#757575** (dates) — but ∑ totals bold dark
- Chart area fill (periwinkle) **#B1C7EC**; light-blue dashed bounds **#ABC9FB**; plot light bands **#E2EBF8** / **#F0F5FB**; orange baseline **#FBA86F**
- Success/peak markers **#76DB9B**; alert red **#FF5D53**
- Engine legend squares: red **#FD575C**, yellow **#FFC837**, green **#00E8AF**, green again (served) **#76DB9B**, blue **#66A3D9**
- Text dark **#23272F**

## Fixes (from side-by-side review)
1. Sidebar section headers ("SUPPLY SOURCES" etc.): NO background band — plain dark semibold uppercase with chevron (remove the #E2EBF8 band I added at the bottom of styles.css).
2. Navy panel: each dropdown is a full steel-blue (#5E7191) tile with label (13px) and value (10px) inside, white text, chevron right. Custom-styled, no native look.
3. Unit of measure / Plan Version mini cards: bold dark title-case label, value below in small grey uppercase with ‹ › arrows; a little larger than now.
4. Undo/redo: grey filled #E0E0E0 40x30 with dark icons; close ✕ white bordered.
5. Engine bar: collapsed by default (single compact row + white chevron); the exception list only shows when expanded. Squares per palette above.
6. Top nav: user pill grey-filled (#E0E0E0-ish, no border). Assistant avatar navy circle with a simple light robot face SVG (not a green dot). Help = teal outline circle "?". Share = teal three-node SVG icon. Logo mark thicker stroke #61D300.
7. Page header: replace hamburger with a teal "collapse" icon (⇤ with lines, SVG). Export/Upload: teal SVG icons + dark text (Upload not greyed). Refresh: grey filled square with teal circular-arrow icon. Dividers thin #D7D7D7.
8. Replace native-looking selects/date inputs in the card headers with custom outlined fields (1px #D7D7D7, radius 4, 34px) with notched floating labels ("Plan Components", "From", "To", "Aggregations", "Table View") and a teal kebab inside date fields; selected values in teal (#1A9BB2) with a teal dot for components. It's fine to keep a hidden native select/input underneath for behavior.
9. Segmented 1W/1M/1Q/1Y: active segment darker grey fill (#E0E0E0) bold.
10. Chart:
   - Main series (Shipped) = thick 2.5px teal #147F93 and must be visually dominant.
   - Available Supply area: #B1C7EC at ~0.35 opacity and do NOT fill the whole plot — fill between on-hand baseline and available (or just show on-hand as the small area near the bottom) so it reads like the reference's small humps.
   - Capacity = saturated orange #FBA86F 2px. Demand = navy #183462 solid; backlog-adjusted demand navy dashed; safety stock light-blue dashed #ABC9FB (not black); remove any grey dotted/black dashed series.
   - Markers: only red #FF5D53 ~12px on shortfall weeks and green #76DB9B ~10px on the top fill peaks (max ~5). No small dots on every point.
   - Gridlines light blue-grey (#E2EBF8); crosshair thin solid #8B99B0; legend uses circles/short lines, not boxes (usePointStyle).
   - Y-axis should auto-scale so the lines fill the plot (don't start the scale far above data).
   - Navigator: light grey strip (#F0F0F0) with teal mini line; hatched teal selection ONLY over the selected window, grey elsewhere.
11. Table:
   - Header ∑ totals bold dark, same size as date; use full dates MM/DD/YYYY and wider columns (~84px).
   - All header labels dark (no teal header). Total columns regular weight; Demand Total teal, Shipped Total dark.
   - Frozen-horizon (≤ lead-time) week cells teal, later dark; boundary = teal dashed vertical line.
   - Remove the red dots in cells; instead shortfall cells get subtle red text only when Fill view <90%.
   - Checkboxes 16px, light grey border.
   - Make the table show ≥ 8 rows: in Segment aggregation add per-segment sub-rows split by plant source (e.g. "Strategic Accounts · North Plant", "· Coastal Supplier") proportional to arrival share, OR add a totals row + one row per segment per plant — pick whatever keeps numbers consistent. The card should not show large empty space; if rows are fewer, shrink the card.
   - Thin grey scrollbars (#B0B0B0 thumb, no arrow buttons) via ::-webkit-scrollbar.
12. Page bg white; cards: very light border #EDEDED + soft shadow 0 1px 4px rgba(24,52,98,.06).

After changes, take no screenshots; just verify syntax/tests/assets and commit.
