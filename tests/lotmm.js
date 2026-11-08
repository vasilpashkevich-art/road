// A shop whose door sits on a busy through road: cars queue to get in, cars pull out, other colours pass by.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1000,height:760},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const setup=await p.evaluate(()=>__ev(`(()=>{ mapId='random'; newGame('random'); closeMenu(); T.overflow=1e9; for(let k=0;k<8;k++) growArea(); budget=999;
  water=new Set(); mount=new Set(); trees=new Map(); waterImg=null; for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[]; for(const [a,set] of [...E]) for(const x of [...set]) delEdge(a,x);
  const L=(a,b)=>link(a,b,{run:null,warned:true,added:[],bridges:[],tunnels:[]});
  const line=(c0,r0,c1,r1)=>{ let c=c0,r=r0; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); L(idx(c,r),idx(nc,nr)); c=nc; r=nr; } };
  const H=(c,r,col,door)=>{ const i=idx(c,r); const h={ i, type:'house', color:col, pins:0, reserved:0, overT:0, t:9, door, doorCell: nb(i).find(x=>x[0]===door)[1] }; h.cars=[mkCar(h),mkCar(h)]; cars.push(...h.cars); doors.add(h.doorCell); occ.set(i,h); bld.set(i,h); };
  // the green square shop, its door on the through road (column 10)
  let sh=null; for (const lat of [0,2]){ const fit=shopFit(idx(11,8),3,lat,'mm'); if(fit && !sh){ sh=makeShop(idx(11,8),3,lat,'mm',fit,3); } }
  if(!sh) return 'no fit'; sh.t=9; doors.add(sh.doorCell); for(const x of sh.cells) occ.set(x,sh); bld.set(sh.i,sh);
  line(10,1,10,16); autoDoor(sh.doorCell);
  // green houses
  H(8,4,3,1); line(9,4,10,4); H(8,12,3,1); line(9,12,10,12); H(8,6,3,1); line(9,6,10,6);  H(8,10,3,1); line(9,10,10,10);
  // yellow through traffic: houses at the top, a kiosk at the bottom
  H(9,2,2,1); H(11,2,2,3); H(9,3,2,1);
  const k=makeShop(idx(11,15),3,0,'kiosk',shopCells(idx(11,15),3,0,'kiosk'),2); k.t=9; doors.add(k.doorCell); for(const x of k.cells) occ.set(x,k); bld.set(k.i,k);
  for(const h of bld.values()) autoDoor(h.doorCell);
  colorsInPlay=4; spawnHouseT=1e9; spawnShopT=1e9;
  uz=1.7; placeCamera(true,0); pan.x=cx(idx(10,8))-(view.x+view.w/2); pan.y=cy(idx(10,8))-(view.y+view.h/2); placeCamera(false,0);
  return 'ok door '+sh.doorCell+' links '+eOf(sh.doorCell).size; })()`));
console.log(setup);
let worst=0;
for(let k=0;k<30;k++){ const r=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<400;i++){ if(choosing){ choosing=false; $('weekBox').hidden=true; } for(const s of bld.values()) if(s.type==='shop') s.pins=Math.max(s.pins, 5); tick(1/40);} 
   const st=cars.filter(c=>c.phase!=='home'&&(c.stuck||0)>15); return JSON.stringify({t:Math.round(time), trips, stuck15:st.length, maxStuck:Math.round(Math.max(0,...cars.map(c=>c.stuck||0))), phases:st.map(c=>c.phase+':'+(c.phase==='go'?c.segs[c.si].cell:'-'))}); })()`)));
  worst=Math.max(worst,r.maxStuck); console.log(JSON.stringify(r)); if(r.maxStuck>30){ await p.screenshot({path:__dirname+'/shots/lot_stuck.png'}); break; } }
await p.screenshot({path:__dirname+'/shots/lotscene.png'}); console.log('worst',worst,errs); await b.close();})();
