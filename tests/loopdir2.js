const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html'); await p.waitForTimeout(300);
console.log(await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); const out=[];
  for(let f=0;f<4;f++) for(const lat of [(f+1)&3,(f+3)&3]){ const b={i:idx(12,8),door:f,lat,size:'mm',depth:2}; const pts=[shopPt(b,LOOP_IN,0.55),shopPt(b,LOOP_IN,LOOP_END),shopPt(b,LOOP_OUT,LOOP_END),shopPt(b,LOOP_OUT,0.55)]; let a=0; for(let k=0;k<4;k++){ const q=pts[k], r=pts[(k+1)%4]; a+=q[0]*r[1]-r[0]*q[1]; }
    out.push(f+'/'+lat+': cw='+loopCW(f,lat)+' areaCW='+(a>0)); }
  return out.join('  '); })()`)));
await b.close();})();
