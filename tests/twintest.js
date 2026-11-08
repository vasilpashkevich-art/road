const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:800},deviceScaleFactor:1})).newPage();
p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
console.log(await p.evaluate(m=>__ev(`(()=>{ newGame('${m}'); closeMenu(); for(let k=0;k<6;k++) growArea(); let ok=0, tries=0;
  for(let k=0;k<40 && ok<3;k++){ const i=freeSpot(); if(i<0) continue; tries++; if(placeShop(i,k%4,'twin')) ok++; }
  const tw=[...bld.values()].filter(b=>b.size==='twin'); if(tw[0]){ uz=2; placeCamera(true,0); pan.x=cx(tw[0].i)-(view.x+view.w/2); pan.y=cy(tw[0].i)-(view.y+view.h/2); placeCamera(false,0); }
  for(const b of bld.values()) b.t=9; for(const t of tw){ t.lvl = 0; t.pins=3; t.twin.pins=2; } if(tw[1]){ tw[1].lvl=1; tw[1].growT=9; tw[1].t=999; } paused=true;
  return JSON.stringify({ok,tries,twins:tw.map(t=>[t.i,!!t.twin,t.twin&&t.twin.i])}); })()`),process.argv[2]||'tokyo'));
await p.waitForTimeout(500); await p.screenshot({path:__dirname+'/shots/twin.png'}); await b.close();})();
