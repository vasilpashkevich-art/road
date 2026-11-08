// drag a highway end with the mouse onto another road cell
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const g=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); for(let k=0;k<6;k++) growArea(); budget=999; water=new Set(); waterImg=null; mount=new Set();
  const L=(a,b)=>link(a,b,{run:null,warned:true,added:[],bridges:[],tunnels:[]}); const line=(c0,r0,c1,r1)=>{ let c=c0,r=r0; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); L(idx(c,r),idx(nc,nr)); c=nc; r=nr; } };
  const r0=area.r0+2, c0=area.c0+2; line(c0,r0,c0+12,r0); line(c0,r0+5,c0+12,r0+5);
  const h={a:idx(c0+1,r0), b:idx(c0+9,r0+5)}; shapeHw(h); hws.push(h); hwOf.set(h.a,{h,partner:h.b}); hwOf.set(h.b,{h,partner:h.a}); netV++; window.__h=h; paused=true; placeCamera(true,0);
  return JSON.stringify({a:h.a,to:idx(c0+5,r0),offX,offY,scale,ac:[col_(h.a),row_(h.a)],tc:[c0+5,r0]}); })()`)));
const rc=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(); return [r.left,r.top]});
const P=([c,r])=>[rc[0]+g.offX+(c+0.5)*40*g.scale, rc[1]+g.offY+(r+0.5)*40*g.scale];
const a=P(g.ac), z=P(g.tc); await p.mouse.move(a[0],a[1]); await p.mouse.down(); for(let k=1;k<=10;k++) await p.mouse.move(a[0]+(z[0]-a[0])*k/10, a[1]+(z[1]-a[1])*k/10); await p.screenshot({path:__dirname+'/shots/hwmove_drag.png'}); await p.mouse.up(); await p.waitForTimeout(200);
const res=await p.evaluate(()=>__ev(`JSON.stringify({a:window.__h.a, ok: hwOf.get(window.__h.a)&&hwOf.get(window.__h.a).partner===window.__h.b, roads:roads.size})`));
console.log('want a=',g.to,res,errs); await p.screenshot({path:__dirname+'/shots/hwmove.png'}); await b.close();})();
