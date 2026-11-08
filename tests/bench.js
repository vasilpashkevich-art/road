// Traffic bench: fixed scenes with steady flows; measures how well cars drive.
// node bench.js [html] [scene,...]  → per scene: orders/min, longest stand, cars standing >5 s, body overlaps, slip-throughs
const {chromium}=require('playwright'); const fs=require('fs');
const HTML=process.argv[2]||__dirname+'/hw.html', ONLY=(process.argv[3]||'').split(',').filter(Boolean), SECS=+process.env.SECS||300, SHOT=process.env.SHOT;
const LIB=`
const A=(c,r)=>idx(area.c0+c, area.r0+r);
function clearAll(){ water=new Set(); mount=new Set(); trees=new Map(); waterImg=null; for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[]; for(const [a,set] of [...E]) for(const x of [...set]) delEdge(a,x); rings=new Set(); zoneRings(); lights=new Map(); }
function road(...pts){ for(let k=1;k<pts.length;k++){ let [c,r]=pts[k-1]; const [c1,r1]=pts[k]; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); addEdge(A(c,r),A(nc,nr)); c=nc; r=nr; } } }
function house(c,r,col,dir){ const i=A(c,r), dc=nb(i).find(x=>x[0]===dir)[1]; const h={ i, type:'house', color:col, pins:0, reserved:0, overT:0, t:9, door:dir, doorCell:dc }; h.cars=[mkCar(h),mkCar(h)]; cars.push(...h.cars); doors.add(dc); occ.set(i,h); bld.set(i,h); if(roads.has(dc)) addEdge(i,dc); return h; }
function shop(c,r,col,doorAt){ const want=A(doorAt[0],doorAt[1]); let pick=null;
  for(let dc=-4;dc<=4&&!pick;dc++) for(let dr=-4;dr<=4&&!pick;dr++) for(let f=0;f<4&&!pick;f++) for(const lat of [(f+1)&3,(f+3)&3]){ const G=A(doorAt[0]+dc,doorAt[1]+dr); const fit=shopFit(G,f,lat,'mm'); if(fit&&fit.door===want){ pick=[G,f,lat,fit]; break; } }
  if(!pick) throw new Error('shop does not fit at door '+doorAt);
  const [G,f,lat,fit]=pick, sh=makeShop(G,f,lat,'mm',fit,col); sh.t=9; doors.add(sh.doorCell); for(const x of sh.cells) occ.set(x,sh); bld.set(sh.i,sh); if(roads.has(sh.doorCell)) addEdge(sh.i,sh.doorCell); return sh; }
function shopDoors(c,r){ const out=[]; for(let f=0;f<4;f++) for(const lat of [0,2]){ const fit=shopFit(A(c,r),f,lat,'mm'); if(fit) out.push([col_(fit.door)-area.c0,row_(fit.door)-area.r0,f,lat]); } return out; }
function finish(){ for(const b of bld.values()) if(roads.has(b.doorCell) && !hasEdge(b.i,b.doorCell)) addEdge(b.i,b.doorCell); colorsInPlay=4; spawnHouseT=1e9; spawnShopT=1e9; netV++; buildGroups(); }
`;
// Each scene: build roads first, then buildings next to them. Coordinates are relative to the open area's corner.
const SCENES={
 // a convoy on one road; at a crossing half the cars turn left, half right (two colours mixed on one feeder)
 split:`road([1,6],[14,6]); road([14,2],[14,10]); road([14,2],[17,2]); road([14,10],[17,10]); for(let k=0;k<5;k++){ house(2+k*2,5,k%2,2); house(2+k*2,7,(k+1)%2,0); }
   shop(0,0,0,[17,2]); shop(0,0,1,[17,10]);`,
 // four roads meet next to one shop: everyone drives to the same place; a second colour crosses through
 many1:`road([1,6],[24,6]); road([12,1],[12,11]); for(let k=0;k<4;k++){ house(2+k*2,5,0,2); house(2+k*2,7,0,0); house(16+k*2,5,0,2); house(16+k*2,7,0,0); }
   for(let k=0;k<2;k++){ house(11,2+k*2,0,1); house(13,2+k*2,1,3); house(11,8+k*2,1,1); house(13,8+k*2,0,3); }
   road([12,11],[15,11]); shop(0,0,0,[15,11]); road([24,6],[26,6]); shop(0,0,1,[26,6]);`,
 // a plain four-way crossing, four flows straight across and turning
 cross:`road([4,6],[24,6]); road([14,1],[14,12]); road([24,6],[26,6]); road([14,1],[17,1]); road([14,12],[17,12]);
   for(let k=0;k<3;k++){ house(5+k*2,5,0,2); house(5+k*2,7,1,0); house(17+k*2,5,2,2); house(17+k*2,7,3,0); }
   for(let k=0;k<2;k++){ house(13,2+k*2,3,1); house(15,2+k*2,0,3); house(13,8+k*2,1,1); house(15,8+k*2,2,3); }
   shop(0,0,0,[26,6]); shop(0,0,1,[17,1]); shop(0,0,2,[4,6]); shop(0,0,3,[17,12]);`,
 // two roads join into one that runs to the shop
 merge:`road([1,3],[8,3],[11,6]); road([1,9],[8,9],[11,6]); road([11,6],[21,6]); for(let k=0;k<3;k++){ house(2+k*2,2,0,2); house(2+k*2,4,0,0); house(2+k*2,8,0,2); house(2+k*2,10,0,0); } shop(0,0,0,[21,6]);`,
 // the four-way crossing with a roundabout in it
 ring:'CROSS; rings.add(A(14,6)); zoneRings();',
 // a long two-way road with diagonal zigzags, flows both ways
 zig:`road([1,6],[5,6],[8,3],[11,3],[14,6],[17,6],[20,9],[23,9]); for(let k=0;k<2;k++){ house(1+k*2,5,0,2); house(2+k*2,7,1,0); house(22-k*2,8,1,2); house(21-k*2,10,0,0); }
   road([23,9],[24,9]); shop(0,0,0,[24,9]); road([1,6],[0,6]); road([0,6],[0,8]); shop(0,0,1,[0,8]);`,
};
SCENES.ring=SCENES.ring.replace('CROSS;',SCENES.cross);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:760},deviceScaleFactor:1})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+HTML);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
 const out={};
 for(const [name,src] of Object.entries(SCENES)){ if(ONLY.length&&!ONLY.includes(name)) continue;
  const setup=await p.evaluate(([lib,src])=>__ev(`(()=>{ mapId='minsk'; newGame('minsk'); closeMenu(); T.overflow=1e9; for(let k=0;k<8;k++) growArea(); budget=999; ${lib}; clearAll(); try { ${src}; } catch(e){ return 'ERR '+e.message; } finish(); return 'ok '+cars.length+' cars'; })()`),[LIB,src]);
  if(setup.startsWith('ERR')){ console.log(name,setup); continue; }
  await p.evaluate(([k,st])=>{window.__OK=k; window.__OD=null; window.__CD=null; window.__STOP=st;},[process.env.OK||'',+(process.env.STOP||0)]); const r=JSON.parse(await p.evaluate(secs=>__ev(`(()=>{ const SW={}; let over=0, longStand=0, maxStuck=0, ghosts=0, frames=0; const stood=new Map(); const t0=trips;
    for(let i=0;i<${secs}*40;i++){ if(window.__STOP && cars.some(c=>c.phase==='go'&&c.stuck>window.__STOP)) break; paused=false; choosing=false; $('weekBox').hidden=true; $('tip').hidden=true; for(const s of bld.values()) if(s.type==='shop') s.pins=Math.max(s.pins,6); tick(1/40);
      if(i%8===0){ frames++; const g=cars.filter(c=>c.phase==='go'); for(let a=0;a<g.length;a++) for(let q=a+1;q<g.length;q++){ const A1=g[a],B1=g[q]; if(Math.abs(A1.x-B1.x)>CAR_L||Math.abs(A1.y-B1.y)>CAR_L) continue; if(layerOf(A1)!==layerOf(B1)) continue; if(boxHit(A1.x,A1.y,A1.da,B1.x,B1.y,B1.da,-1)){ over++; window.__OV=(window.__OV||{}); const k=[A1.curKey,B1.curKey,A1.why,B1.why,A1.segs[A1.si].cell].join(' '); window.__OV[k]=(window.__OV[k]||0)+1; if(!window.__OD && A1.curKey && A1.curKey===(window.__OK||'434>404')){ const d=c=>({id:c.id,key:c.curKey,why:c.why,ghost:c.ghost,lock:c.lock,boxIn:c.boxIn,exitKey:c.exitKey,path:c.path.slice(Math.max(0,c.ek-2),c.ek+3),links:[...eOf(c.path[c.ek])],gap:c.gap,v:c.v,R:carR(c),stuck:c.stuck}); window.__OD=JSON.stringify([d(A1),d(B1),[...eOf(434)],jGroup.get(434)]); } } }
        for(const c of cars){ if(c.phase==='home'){ stood.delete(c); continue; } if(c.phase==='go' && (c.why==='cut'||c.why==='order') && c.stuck>9 && !window.__CD){ const o=c.cutBy, d=x=>x&&({id:x.id,ph:x.phase,why:x.why,key:x.curKey,cell:x.segs&&x.segs[x.si]?x.segs[x.si].cell:-1,lock:x.lock,boxIn:x.boxIn,stuck:+(x.stuck||0).toFixed(1),v:+x.v.toFixed(1),cutBy:x.cutBy&&x.cutBy.id,ghost:x.ghost}); window.__CD=JSON.stringify({c:d(c),o:d(o),oc:o&&d(o.cutBy)}); } maxStuck=Math.max(maxStuck,c.stuck||0); if((c.stuck||0)>5 && !stood.get(c)){ stood.set(c,1); longStand++; const w=c.phase!=='go'?c.phase:(c.why||'follow'); SW[w]=(SW[w]||0)+1; } if((c.stuck||0)<1) stood.delete(c); if(c.ghost>1.45) ghosts++; } } }
    const W={}; for(const c of cars) if(c.phase==='go'&&(c.stuck||0)>5){ const k=(c.why||'-')+'@'+(c.segs[c.si].cell); W[k]=(W[k]||0)+1; } window.__W=W; return JSON.stringify({sw:SW, perMin:+((trips-t0)/(${secs}/60)).toFixed(1), maxStand:+maxStuck.toFixed(1), stands5:longStand, overlaps:+(over/frames).toFixed(2), ghosts}); })()`),SECS));
  out[name]=r; console.log(name.padEnd(6),JSON.stringify(r)); if(process.env.DUMP) console.log(await p.evaluate(()=>__ev(`JSON.stringify(cars.filter(c=>c.phase==='go'&&(c.stuck>3||[13,39,47,50,19].includes(c.id))).map(c=>[c.id,c.phase,c.ghost>0?'G':'',Math.round(c.v),c.segs[c.si].cell,c.segs[c.si].kind,c.why,c.curKey,Math.round(c.stuck),c.lock,c.cutBy&&c.cutBy.id, Math.round(c.gap), c.roomWhy]))`))); if(process.env.OV) console.log(await p.evaluate(()=>window.__OD)); if(process.env.OV) console.log('CD',await p.evaluate(()=>window.__CD)); if(process.env.OV) console.log(await p.evaluate(()=>{ const o=window.__OV||{}; window.__OV={}; return JSON.stringify(Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,8)); }));
  if(SHOT){ await p.evaluate(()=>__ev(`choosing=false; $('weekBox').hidden=true; $('tip').hidden=true; uz=+(window.__UZ||1.25); placeCamera(true,0); pan.x=cx(idx(area.c0+14,area.r0+6))-(view.x+view.w/2); pan.y=cy(idx(area.c0+14,area.r0+6))-(view.y+view.h/2); placeCamera(false,0); draw(); 0`)); await p.screenshot({path:__dirname+'/shots/bench_'+name+'.png'}); } }
 if(process.env.OUT) fs.writeFileSync(process.env.OUT,JSON.stringify(out));
 console.log(errs.slice(0,3)); await b.close();})();
