// the user's Lake town, rebuilt from the menu card picture; runs it with demand from late game and looks for cars that stand
const {chromium}=require('playwright'); const fs=require('fs');
const spec=fs.readFileSync(__dirname+'/spec.json','utf8'), HTML=process.argv[2]||__dirname+'/../hw.html', SECS=+process.argv[3]||600;
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1200,height:760},deviceScaleFactor:1})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+HTML);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
console.log(await p.evaluate(sp=>__ev(`(()=>{ const S=${sp}; mapId='lake'; newGame('lake'); closeMenu(); for(let k=0;k<12;k++) growArea(); budget=999; T.overflow=1e9;
  for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[];
  const I=(c,r)=>idx(c,r), G=S.G, isR=(c,r)=>G[r]&&G[r][c]==='R';
  // shops first: which way round each one stands is read from where its lot (road coloured) lies
  const taken=new Set(); let placed=0;
  for(const s of S.shops){ const blk=new Set([I(s.at[0],s.at[1]),I(s.at[0]+1,s.at[1]),I(s.at[0],s.at[1]+1),I(s.at[0]+1,s.at[1]+1)]); let best=null;
    for(let c=s.at[0]-3;c<=s.at[0]+4;c++) for(let r=s.at[1]-3;r<=s.at[1]+4;r++){ if(!inb(c,r)) continue; for(let f=0;f<4;f++) for(const lat of [(f+1)&3,(f+3)&3]){ const fit=shopCells(I(c,r),f,lat,'mm'); if(fit.cells.some(x=>x<0)||fit.door<0) continue;
      const bl=fit.cells.filter(x=>!fit.lot.includes(x)); if(bl.length!==4||!bl.every(x=>blk.has(x))) continue;
      const sc=fit.lot.filter(x=>isR(col_(x),row_(x))).length*2+(isR(col_(fit.door),row_(fit.door))?3:0); if(!best||sc>best[0]) best=[sc,I(c,r),f,lat,fit]; } }
    if(!best) continue; const [sc,Gc,f,lat,fit]=best; const sh=makeShop(Gc,f,lat,'mm',fit,s.c); sh.t=999; sh.lvl=1; doors.add(sh.doorCell); for(const x of sh.cells){ occ.set(x,sh); taken.add(x); } bld.set(sh.i,sh); placed++; }
  for(const [c1,r1,c2,r2] of S.edges){ const a=I(c1,r1), b=I(c2,r2); if(taken.has(a)||taken.has(b)) continue; water.delete(a); water.delete(b); addEdge(a,b); }
  let hs=0; for(const h of S.houses){ const i=I(h.at[0],h.at[1]); if(taken.has(i)||roads.has(i)) continue; let d=h.door; if(d<0){ const n=nb(i).find(x=>roads.has(x[1])); if(!n) continue; d=n[0]; }
    const dc=nb(i).find(x=>x[0]===d); if(!dc) continue; const H={ i, type:'house', color:h.c, pins:0, reserved:0, overT:0, t:999, door:d, doorCell:dc[1] }; H.cars=[mkCar(H),mkCar(H)]; cars.push(...H.cars); doors.add(dc[1]); occ.set(i,H); bld.set(i,H); taken.add(i); hs++; }
  for(const b of bld.values()) if(roads.has(b.doorCell) && !hasEdge(b.i,b.doorCell)) addEdge(b.i,b.doorCell);
  colorsInPlay=4; spawnHouseT=1e9; spawnShopT=1e9; time=900; waterImg=null; netV++; buildGroups(); zoneRings();
  // the roundabout in the picture
  if(roads.has(I(8,10))){ rings.add(I(8,10)); zoneRings(); netV++; }
  uz=1; placeCamera(true,0); draw();
  return 'shops '+placed+' houses '+hs+' roads '+roads.size+' unreachable houses '+[...bld.values()].filter(h=>h.type==='house'&&!hasEdge(h.i,h.doorCell)).length; })()`),spec));
await p.evaluate(()=>__ev(`$('weekBox').hidden=true; $('tip').hidden=true; draw(); 0`)); await p.screenshot({path:'/tmp/claude-0/lake_rebuilt.png'});
const out=[]; let shot=0;
for(let k=0;k<SECS/10;k++){ const r=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<400;i++){ paused=false; choosing=false; tick(1/40); if(i%8===0){ const g=cars.filter(c=>c.phase!=='home'); window.__fr=(window.__fr||0)+1; for(let a=0;a<g.length;a++) for(let q=a+1;q<g.length;q++){ const A1=g[a],B1=g[q]; if(A1.phase==='go'&&B1.phase==='go') continue; if(Math.abs(A1.x-B1.x)>CAR_L||Math.abs(A1.y-B1.y)>CAR_L) continue; if(boxHit(A1.x,A1.y,A1.da,B1.x,B1.y,B1.da,-1)) window.__lo=(window.__lo||0)+1; } } } $('weekBox').hidden=true; $('tip').hidden=true;
    const st=cars.filter(c=>c.phase!=='home'&&(c.stuck||0)>15); return JSON.stringify({t:Math.round(time),trips,pins:[...bld.values()].filter(b=>b.type==='shop').reduce((a,b)=>a+b.pins,0),moving:cars.filter(c=>c.phase==='go').length,stuck15:st.length,max:Math.round(Math.max(0,...cars.map(c=>c.phase!=='home'?c.stuck||0:0))),st:st.slice(0,6).map(c=>[c.id,c.phase,c.why,c.curKey,Math.round(c.stuck),Math.round(c.gap),c.leadBy&&[c.leadBy.id,c.leadBy.phase,c.leadBy.curKey,c.leadBy.why,Math.round(c.leadBy.v),c.leadBy.back,Math.round(c.leadBy.stuck||0)]]), at:st[0]?[st[0].x,st[0].y]:null}); })()`)));
  out.push(r); if(k%6===5||r.stuck15) console.log(JSON.stringify(r));
  if(r.at && shot<2){ shot++; await p.evaluate(at=>__ev(`uz=2.6; placeCamera(true,0); pan.x=${at[0]}-(view.x+view.w/2); pan.y=${at[1]}-(view.y+view.h/2); placeCamera(false,0); draw(); 0`),r.at); await p.screenshot({path:`/tmp/claude-0/lake_stuck${shot}.png`}); await p.evaluate(()=>__ev(`uz=1; pan.x=0; pan.y=0; placeCamera(true,0); 0`)); } }
console.log('lotOver per frame',await p.evaluate(()=>((window.__lo||0)/(window.__fr||1)).toFixed(3)),'max stand',Math.max(...out.map(o=>o.max)),'trips',out[out.length-1].trips,errs.slice(0,3)); await b.close();})();
