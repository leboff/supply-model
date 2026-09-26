// Pure, deterministic supply allocation model. This file deliberately has no UI code.
export const POLICIES = ['priority', 'fair', 'margin', 'hybrid'];

export function seededRandom(seed = 42) {
  let value = (Number(seed) >>> 0) || 1;
  return () => {
    value |= 0; value = value + 0x6D2B79F5 | 0;
    let t = Math.imul(value ^ value >>> 15, 1 | value);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const defaults = {
  weeks: 26, seed: 2026, startingInventory: 1300, safetyStock: 250,
  policy: 'priority', reservePct: 35,
  plants: [
    { name: 'North Plant', capacity: 620, yield: 96, leadTime: 2, ramp: 0, outageStart: 0, outageEnd: 0 },
    { name: 'Coastal Supplier', capacity: 420, yield: 93, leadTime: 3, ramp: 0, outageStart: 0, outageEnd: 0 }
  ],
  segments: [
    { name: 'Strategic Accounts', baseline: 290, growth: 0.5, seasonality: 12, noise: 4, tier: 1, margin: 120, backorder: true },
    { name: 'Enterprise', baseline: 240, growth: 0.4, seasonality: 10, noise: 5, tier: 2, margin: 94, backorder: true },
    { name: 'Mid-Market', baseline: 210, growth: 0.3, seasonality: 8, noise: 6, tier: 3, margin: 68, backorder: false },
    { name: 'E-commerce', baseline: 150, growth: 0.7, seasonality: 18, noise: 9, tier: 3, margin: 52, backorder: false }
  ]
};

export function cloneDefaults() { return JSON.parse(JSON.stringify(defaults)); }
export function mergeScenario(base, patch) {
  const output = JSON.parse(JSON.stringify(base));
  return Object.assign(output, patch);
}

function allocate(policy, needs, available, segments, reservePct) {
  const out = Array(needs.length).fill(0);
  if (policy === 'fair') {
    const total = needs.reduce((a, b) => a + b, 0);
    if (total) needs.forEach((need, i) => out[i] = Math.min(need, available * need / total));
    return out;
  }
  if (policy === 'hybrid') {
    const top = segments.map((s, i) => s.tier === Math.min(...segments.map(x => x.tier)) ? i : -1).filter(i => i >= 0);
    let remaining = available;
    const topNeed = top.reduce((sum, i) => sum + needs[i], 0);
    const reserve = Math.min(remaining * reservePct / 100, topNeed);
    top.forEach(i => out[i] += topNeed ? reserve * needs[i] / topNeed : 0);
    remaining -= reserve;
    const leftNeed = needs.reduce((sum, n, i) => sum + n - out[i], 0);
    needs.forEach((n, i) => out[i] += leftNeed ? remaining * (n - out[i]) / leftNeed : 0);
    return out.map((n, i) => Math.min(n, needs[i]));
  }
  const order = segments.map((s, i) => i).sort((a, b) => policy === 'margin'
    ? segments[b].margin - segments[a].margin : segments[a].tier - segments[b].tier || a - b);
  let remaining = available;
  order.forEach(i => { out[i] = Math.min(needs[i], remaining); remaining -= out[i]; });
  return out;
}

export function simulate(input = defaults) {
  const c = JSON.parse(JSON.stringify(input));
  const random = seededRandom(c.seed);
  const arrivals = Array(c.weeks + 12).fill(0);
  const backlog = Array(c.segments.length).fill(0);
  const totals = c.segments.map(() => ({ demand: 0, shipped: 0, lost: 0, margin: 0, unconstrainedMargin: 0 }));
  let inventory = c.startingInventory;
  const weeks = [];
  for (let w = 0; w < c.weeks; w++) {
    const produced = c.plants.map(p => {
      const outage = p.outageStart && w + 1 >= p.outageStart && w + 1 <= p.outageEnd;
      const capacity = outage ? 0 : p.capacity * (1 + (p.ramp || 0) * w / 100);
      const good = capacity * p.yield / 100;
      arrivals[Math.min(arrivals.length - 1, w + Math.max(0, p.leadTime || 0))] += good;
      return { capacity, good };
    });
    const received = arrivals[w]; inventory += received;
    const demand = c.segments.map((s, i) => {
      const seasonal = 1 + s.seasonality / 100 * Math.sin((w / 13) * Math.PI * 2 + i);
      const noisy = 1 + (random() * 2 - 1) * s.noise / 100;
      return Math.max(0, s.baseline * Math.pow(1 + s.growth / 100, w) * seasonal * noisy);
    });
    const openingBacklog = [...backlog];
    const needs = demand.map((d, i) => d + (c.segments[i].backorder ? backlog[i] : 0));
    const shipments = allocate(c.policy, needs, inventory, c.segments, c.reservePct || 0);
    const shipped = shipments.reduce((a, b) => a + b, 0);
    inventory -= shipped;
    const lost = demand.map((d, i) => {
      const unfilled = Math.max(0, needs[i] - shipments[i]);
      backlog[i] = c.segments[i].backorder ? unfilled : 0;
      return c.segments[i].backorder ? 0 : unfilled;
    });
    demand.forEach((d, i) => {
      totals[i].demand += d; totals[i].shipped += shipments[i]; totals[i].lost += lost[i];
      totals[i].margin += shipments[i] * c.segments[i].margin;
      totals[i].unconstrainedMargin += d * c.segments[i].margin;
    });
    const totalNeed = needs.reduce((a,b) => a+b,0);
    const capacity = produced.reduce((a,p) => a + p.capacity, 0);
    const futureGood = produced.reduce((a,p) => a + p.good, 0);
    const constrained = shipped + 1e-6 < totalNeed;
    weeks.push({ week: w + 1, demand, openingBacklog, needs, shipments, lost, backlog: [...backlog],
      arrivals: received, inventory, production: futureGood, capacity, utilization: capacity ? futureGood / capacity : 0,
      constrained, constraint: !constrained ? 'None' : (received === 0 && futureGood > 0 ? 'Lead-time' : (futureGood < totalNeed ? 'Capacity' : 'Inventory')) });
  }
  const totalDemand = totals.reduce((a,x) => a + x.demand, 0), totalShipped = totals.reduce((a,x) => a + x.shipped, 0);
  return { config: c, weeks, totals, summary: {
    demand: totalDemand, shipped: totalShipped, fillRate: totalDemand ? totalShipped / totalDemand : 1,
    backlog: backlog.reduce((a,b) => a+b,0), lost: totals.reduce((a,x) => a+x.lost,0), inventory,
    margin: totals.reduce((a,x) => a+x.margin,0), unconstrainedMargin: totals.reduce((a,x) => a+x.unconstrainedMargin,0),
    constrainedWeeks: weeks.filter(x => x.constrained).length,
    utilization: weeks.reduce((a,x) => a+x.utilization,0) / c.weeks
  }};
}
