let charts = {};
const colors = ['#62d5c2','#7c8cff','#f6b44d','#f1708c','#a78bfa'];
function draw(id, config) { charts[id]?.destroy(); charts[id] = new Chart(document.getElementById(id), config); }
export function renderCharts(result) {
  const labels = result.weeks.map(w => `W${w.week}`), segs = result.config.segments;
  draw('supplyChart', { type:'bar', data:{ labels, datasets:[
    { label:'Arrivals', data:result.weeks.map(w=>w.arrivals), backgroundColor:'#62d5c2', stack:'s' },
    { label:'Demand', data:result.weeks.map(w=>w.demand.reduce((a,b)=>a+b,0)), type:'line', borderColor:'#f6b44d', pointRadius:0 }
  ]}, options: base('Supply arrivals vs demand', true) });
  draw('fillChart', { type:'line', data:{labels,datasets:segs.map((s,i)=>({label:s.name,data:result.weeks.map(w=>w.demand[i]?w.shipments[i]/w.demand[i]*100:100),borderColor:colors[i],pointRadius:0,tension:.25}))},options:base('Weekly fill rate (%)') });
  draw('stockChart', { type:'line', data:{labels,datasets:[{label:'Inventory',data:result.weeks.map(w=>w.inventory),borderColor:'#62d5c2',pointRadius:0},{label:'Backlog',data:result.weeks.map(w=>w.backlog.reduce((a,b)=>a+b,0)),borderColor:'#f1708c',pointRadius:0}]},options:base('Units') });
  draw('allocationChart', { type:'bar', data:{labels,datasets:segs.map((s,i)=>({label:s.name,data:result.weeks.map(w=>w.shipments[i]),backgroundColor:colors[i],stack:'a'}))},options:base('Units allocated',true) });
}
function base(title, stacked=false) { return { responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#b8c1d9'}},title:{display:true,text:title,color:'#eef2ff',font:{size:13}}},scales:{x:{stacked,ticks:{color:'#8490ae'},grid:{color:'#28324b'}},y:{stacked,ticks:{color:'#8490ae'},grid:{color:'#28324b'},beginAtZero:true}}}; }
