// rings on a plain road with a bend right next to it, and on a junction whose diagonal arm turns away: they must go in, and cars must drive them
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1000,height:760},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
console.log(await p.evaluate(()=>__ev(`(()=>{ mapId='minsk'; newGame('minsk'); closeMenu(); T.overflow=1e9; for(let k=0;k<8;k++) growArea(); budget=999;
  water=new Set(); mount=new Set(); trees=new Map(); waterImg=null; for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[]; for(const [a,set] of [...E]) for(const x of [...set]) delEdge(a,x);
  const I=(c,r)=>idx(c,r+2); const L=(a,b)=>link(a,b,{run:null,warned:true,added:[],bridges:[],tunnels:[]});
  const line=(c0,r0,c1,r1)=>{ r0+=2; r1+=2; let c=c0,r=r0; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); L(idx(c,r),idx(nc,nr)); c=nc; r=nr; } };
  const H=(c,r,col,door)=>{ const i=idx(c,r+2); const h={ i, type:'house', color:col, pins:0, reserved:0, overT:0, t:9, door, doorCell: nb(i).find(x=>x[0]===door)[1] }; h.cars=[mkCar(h),mkCar(h)]; cars.push(...h.cars); doors.add(h.doorCell); occ.set(i,h); bld.set(i,h); };
  const con=(a,b)=>{ const par=new Map([[a,-1]]), q=[a]; for(let h=0;h<q.length;h++){ const u=q[h]; if(u===b) break; for(let d=0;d<8;d+=2){ const v=at8(u,d); if(v<0||par.has(v)||(occ.has(v))||(roads.has(v)&&v!==b)||(doors.has(v)&&v!==b)) continue; par.set(v,u); q.push(v);} } if(!par.has(b)) return false; let u=b; const pr=[]; while(par.get(u)!==-1){ pr.push([par.get(u),u]); u=par.get(u);} return pr.reverse().map(([x,y])=>L(x,y)).join(); };
  const S=(c,r,col)=>{ r+=2; for(let rot=0;rot<4;rot++) for(const lat of [0,2]){ const fit=shopFit(idx(c,r),rot,lat,'mm'); if(fit){ const sh=makeShop(idx(c,r),rot,lat,'mm',fit,col); sh.t=9; doors.add(sh.doorCell); for(const x of sh.cells) occ.set(x,sh); bld.set(sh.i,sh); return sh; } } return null; };
  // A: a straight road, the ring one cell before a bend
  H(1,6,0,1); line(2,6,9,6); line(9,6,12,3); const sA=S(14,2,0); if(!sA) return 'noA'; const okA=con(I(12,3),sA.doorCell); autoDoor(sA.doorCell);
  // B: a crossing whose diagonal arm turns down right past it
  H(4,11,0,1); line(5,11,10,11); line(8,11,8,9); line(8,11,7,12); line(7,12,7,13); H(6,13,0,1); H(8,8,0,2);
  const sB=S(13,11,0); if(!sB) return 'noB'; const okB=con(I(10,11),sB.doorCell); autoDoor(sB.doorCell);
  for(const h of bld.values()) autoDoor(h.doorCell);
  colorsInPlay=1; spawnHouseT=1e9; spawnShopT=1e9; ringN=5;
  const ra=canRing(I(8,6)), rb=canRing(I(8,11)); tapRing(I(8,6)); tapRing(I(8,11));
  uz=1.5; placeCamera(true,0); pan.x=cx(idx(9,12))-(view.x+view.w/2); pan.y=cy(idx(9,12))-(view.y+view.h/2); placeCamera(false,0);
  return JSON.stringify({area,okA,okB,r123:roads.has(idx(12,3)),e:[...eOf(idx(12,3))].map(x=>[col_(x),row_(x)]),ra,rb,rings:[...rings],dA:[col_(sA.doorCell),row_(sA.doorCell),nb(sA.doorCell).map(([d,x])=>[d,occ.has(x)?"o":roads.has(x)?"r":doors.has(x)?"d":"."].join(""))],dB:[col_(sB.doorCell),row_(sB.doorCell),eOf(sB.doorCell).size]}); })()`)));
let worst=0;
for(let k=0;k<20;k++){ const r=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<400;i++){ paused=false; if(choosing){ choosing=false; $('weekBox').hidden=true; } for(const s of bld.values()) if(s.type==='shop') s.pins=Math.max(s.pins, 5); tick(1/40);} 
   return JSON.stringify({t:Math.round(time), trips, maxStuck:Math.round(Math.max(0,...cars.map(c=>c.stuck||0)))}); })()`)));
  worst=Math.max(worst,r.maxStuck); if(k%5==4) console.log(JSON.stringify(r)); if(k===8) await p.screenshot({path:__dirname+'/shots/ringbend.png'}); }
console.log(await p.evaluate(()=>__ev(`JSON.stringify([...bld.values()].map(b=>[b.type,col_(b.i),row_(b.i),b.color,b.pins,[...eOf(b.doorCell)].length, hasEdge(b.i,b.doorCell)]))`))); console.log('worst',worst,errs); await b.close();})();
