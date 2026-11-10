// a traffic light is dragged to another crossing; erasing a ring or a light takes the tool back and leaves the road
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1000,height:700}})).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
console.log(await p.evaluate(()=>__ev(`(()=>{ mapId='minsk'; newGame('minsk'); closeMenu(); for(let k=0;k<8;k++) growArea(); water=new Set(); mount=new Set(); waterImg=null; for(const b of [...bld.values()]){ if(b.type==='shop') unplaceShop(b); else { occ.delete(b.i); doors.delete(b.doorCell); bld.delete(b.i);} } cars=[]; paused=true;
  const A=(c,r)=>idx(area.c0+c,area.r0+r), road=(c0,r0,c1,r1)=>{ let c=c0,r=r0; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); addEdge(A(c,r),A(nc,nr)); c=nc; r=nr; } };
  road(4,6,20,6); road(8,2,8,10); road(15,2,15,10); lightN=1; ringN=1; tapLight(A(8,6)); uz=1; placeCamera(true,0); pan.x=cx(A(12,6))-(view.x+view.w/2); pan.y=cy(A(12,6))-(view.y+view.h/2); placeCamera(false,0); draw();
  window.__A=A; return JSON.stringify({lights:[...lights.keys()].map(i=>[col_(i)-area.c0,row_(i)-area.r0]), lightN}); })()`)));
const scr=(c,r)=>p.evaluate(([c,r])=>__ev(`(()=>{ const R=cv.getBoundingClientRect(); return [R.left+offX+(area.c0+${c}+0.5)*CELL*scale, R.top+offY+(area.r0+${r}+0.5)*CELL*scale]; })()`),[c,r]);
const a=await scr(8,6), z=await scr(15,6); await p.mouse.move(a[0],a[1]); await p.mouse.down(); for(let k=1;k<=10;k++) await p.mouse.move(a[0]+(z[0]-a[0])*k/10,a[1]); await p.mouse.up();
console.log('after drag', await p.evaluate(()=>__ev(`JSON.stringify({lights:[...lights.keys()].map(i=>[col_(i)-area.c0,row_(i)-area.r0]), lightN})`)));
console.log('erase', await p.evaluate(()=>__ev(`(()=>{ const A=window.__A; tapRing(A(8,6)); const r0=[rings.size,ringN]; eraseCell(A(8,6)); eraseCell(A(15,6)); return JSON.stringify({ringBefore:r0, rings:rings.size, ringN, lights:lights.size, lightN, roadStill:[roads.has(A(8,6)),roads.has(A(15,6))]}); })()`)));
await b.close();})();
