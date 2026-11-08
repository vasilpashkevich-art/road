const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const r=await p.evaluate(()=>__ev(`(()=>{ mapId='lake'; newGame('random'); closeMenu(); for(let k=0;k<6;k++) growArea();
  water=new Set(); waterImg=null; for(const b of [...bld.values()]) { if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[];
  const out=[]; const types=['kiosk','square','corner','m','long','l']; let col=0;
  const spots=[[2,5],[7,5],[12,5],[17,5],[22,5],[27,4],[2,11],[7,11],[12,11],[17,11],[22,11],[27,10]];
  types.forEach((t,k)=>{ for (const mir of [0,1]){ const [c,r]=spots[k+mir*6]; const f=0, lat= mir? 3:1; const G=idx(c,r+ (t==='l'?1:0)); const fit=shopCells(G,f,lat,t); if(fit.cells.some(x=>x<0)){out.push(t+' oob');continue;}
     const sb=makeShop(G,f,lat,t,fit,k%4); sb.t=9; sb.pins=k%3+2; doors.add(sb.doorCell); for(const x of sb.cells) occ.set(x,sb); bld.set(sb.i,sb);
     // park a car in every stall
     sb.size=t; stallsOf(sb).forEach((st,s)=>{ if(s%3===2) return; const h={i:sb.doorCell,color:sb.color,type:'house'}; const car=mkCar(h); const pts=parkPts(sb,st); const g=mk('lot',null,null,null,0,-1,crPts([[cx(sb.doorCell),cy(sb.doorCell)],...pts])); const q=samp(g,1), q0=samp(g,0.97);
       car.x=q[0]; car.y=q[1]; car.ang=car.da=Math.atan2(q[1]-q0[1],q[0]-q0[0]); car.phase='wait'; car.waitT=999; car.target=sb; car.slot=s; car.slotShop=sb; sb.slots[s]=car; cars.push(car); });
     out.push(t+(mir?' mirror':'')+' ok'); } });
  // a road to each door
  for (const b of bld.values()) if(b.type==='shop'){ const d=b.doorCell, d2=d+30; if(inPlay(d2)) addEdge(d,d2); autoDoor(d); }
  uz=1.25; placeCamera(true,0); paused=true; return out.join(', '); })()`));
await p.waitForTimeout(500); await p.screenshot({path:__dirname+'/shots/shops_all.png'});
console.log(r, errs); await b.close();})();
