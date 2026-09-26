let charts = {};
const compact = n => n >= 1000 ? (+(n / 1000).toFixed(1)) + 'K' : '' + Math.round(n);
function draw(id, config) { const el = document.getElementById(id); if (!el || !window.Chart) return; charts[id]?.destroy(); charts[id] = new Chart(el, config); }
function dates(n) { return Array.from({ length:n }, (_, i) => { const d = new Date(Date.UTC(2026, 8, 28 + i * 7)); return String(d.getUTCMonth()+1).padStart(2,'0') + '/' + String(d.getUTCDate()).padStart(2,'0') + '/' + d.getUTCFullYear(); }); }
const divider = { id:'frozenDivider', afterDraw(chart, _, opts) { const x = chart.scales.x; if (!x || opts.index == null) return; const pos=x.getPixelForValue(opts.index), c=chart.ctx; c.save(); c.strokeStyle='#52606d'; c.setLineDash([4,4]); c.beginPath(); c.moveTo(pos,chart.chartArea.top);c.lineTo(pos,chart.chartArea.bottom);c.stroke();c.restore(); } };
export function renderCharts(result, onShortfall) {
  const weeks=result.weeks, labels=dates(weeks.length), demand=weeks.map(w=>w.demand.reduce((a,b)=>a+b,0)), shipped=weeks.map(w=>w.shipments.reduce((a,b)=>a+b,0)), backlog=weeks.map(w=>w.needs.reduce((a,b)=>a+b,0)), available=weeks.map(w=>w.arrivals+w.inventory), cap=weeks.map(w=>w.capacity), safety=weeks.map(()=>result.config.safetyStock), lost=weeks.map(w=>w.lost.reduce((a,b)=>a+b,0)), fills=weeks.map((w,i)=>demand[i] ? shipped[i]/demand[i] : 1), dividerAt=Math.max(...result.config.plants.map(p=>p.leadTime||0));
  const red=lost.map((v,i)=>v||weeks[i].constrained ? demand[i] : null), green=fills.map((v,i)=>v>=.999 ? shipped[i] : null);
  draw('supplyChart',{type:'line',data:{labels,datasets:[
    {label:'Available Supply',data:available,fill:true,backgroundColor:'#AFC3EC99',borderColor:'#7C95D6',pointRadius:0,tension:.25},
    {label:'Capacity',data:cap,borderColor:'#F2A36B',pointRadius:0,borderWidth:2,tension:.25},
    {label:'Total Demand',data:demand,borderColor:'#1E2D5A',pointRadius:0,borderWidth:2,tension:.25},
    {label:'Backlog-adjusted demand',data:backlog,borderColor:'#34487A',borderDash:[5,4],pointRadius:0,tension:.25},
    {label:'Shipped',data:shipped,borderColor:'#1A8A9C',pointRadius:0,borderWidth:2.5,tension:.25},
    {label:'Safety stock',data:safety,borderColor:'#343a40',borderDash:[5,3],pointRadius:0},
    {label:'Demand noise band',data:demand.map(v=>v*1.08),borderColor:'#7C95D6',borderDash:[3,3],pointRadius:0},
    {label:'Shortfall',data:red,showLine:false,pointRadius:6,pointBackgroundColor:'#E8453C',pointBorderColor:'#fff',pointBorderWidth:1},
    {label:'Fully served',data:green,showLine:false,pointRadius:4,pointBackgroundColor:'#5ED49A'}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},onClick(e,els){const hit=els.find(x=>x.datasetIndex===7);if(hit)onShortfall?.(hit.index,e);},plugins:{legend:{position:'top',align:'end',labels:{boxWidth:9,font:{size:10},filter:i=>!['Demand noise band','Shortfall','Fully served'].includes(i.text)}},tooltip:{callbacks:{label:c=>c.dataset.label + ': ' + compact(c.raw)}},frozenDivider:{index:dividerAt}},scales:{x:{ticks:{maxTicksLimit:7,font:{size:10}},grid:{color:'#EEF0F3'}},y:{beginAtZero:true,ticks:{callback:compact},grid:{color:'#EEF0F3'}}}},plugins:[divider]});
  draw('navChart',{type:'line',data:{labels,datasets:[{data:demand,borderColor:'#1A8A9C',borderWidth:1,pointRadius:0,fill:true,backgroundColor:'#AFC3EC55'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}});
}
