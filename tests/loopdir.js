// every loop lot, in every orientation, goes round counter-clockwise on screen
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html'); await p.waitForTimeout(300);
console.log(await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); const out=[];
  for(let f=0;f<4;f++) for(const lat of [(f+1)&3,(f+3)&3]){ const b={i:idx(12,8),door:f,lat,size:'mm',depth:2}; const P=loopPts(b); let a=0; for(let k=0;k<P.length;k++){ const q=P[k], r=P[(k+1)%P.length]; a+=q[0]*r[1]-r[0]*q[1]; }
    const bay=shopPt(b,1.7,0.62), d=loopAt(b,0.62), q=loopUpTo(b,d).pop(); out.push(f+'/'+lat+':'+(a<0?'ccw':'CW')+' bayNearBuilding='+(Math.hypot(q[0]-bay[0],q[1]-bay[1])<6)); }
  return out.join('  '); })()`)));
await b.close();})();
