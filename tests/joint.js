// four mm shops, one per facing, each with a road to its door: the shop/road joint up close
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1000,height:760},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
for (const m of (process.argv[2]||'minsk,tokyo').split(',')){
const r=await p.evaluate(m=>__ev(`(()=>{ mapId='${m}'; newGame('${m}'); closeMenu(); T.overflow=1e9; for(let k=0;k<8;k++) growArea(); budget=999;
  water=new Set(); mount=new Set(); trees=new Map(); waterImg=null; for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[]; for(const [a,set] of [...E]) for(const x of [...set]) delEdge(a,x);
  const L=(a,b)=>link(a,b,{run:null,warned:true,added:[],bridges:[],tunnels:[]});
  const out=[]; const spots=[[6,5],[14,5],[6,12],[14,12]];
  for (let rot=0; rot<4; rot++){ const [c,r]=spots[rot]; let sh=null; for (const lat of [0,2]){ const fit=shopFit(idx(c,r),rot,lat,'mm'); if(fit && !sh) sh=makeShop(idx(c,r),rot,lat,'mm',fit,rot%2?0:1); }
    if(!sh){ out.push('nofit'+rot); continue; } sh.t=9; doors.add(sh.doorCell); for(const x of sh.cells) occ.set(x,sh); bld.set(sh.i,sh);
    const d=sh.doorCell; let prev=d; for(const [dd,x] of nb(d)){ if(!occ.has(x) && !doors.has(x) && dd%2===0){ L(d,x); let y=x; for(let k=0;k<2;k++){ const n=nb(y).find(q=>q[0]===dd); if(!n||occ.has(n[1])) break; L(y,n[1]); y=n[1]; } break; } }
    autoDoor(d); out.push(rot+':'+eOf(d).size); }
  spawnHouseT=1e9; spawnShopT=1e9; uz=2.2; placeCamera(true,0); pan.x=cx(idx(10,9))-(view.x+view.w/2); pan.y=cy(idx(10,9))-(view.y+view.h/2); placeCamera(false,0); draw(); return out.join(' '); })()`),m);
console.log(m,r); await p.screenshot({path:__dirname+'/shots/joint_'+m+'.png'}); }
console.log(errs); await b.close();})();
