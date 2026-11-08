// bend a straight road with the mouse in the "Изгиб" mode; cars keep driving on it
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const g=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); for(let k=0;k<4;k++) growArea(); budget=999; water=new Set(); waterImg=null; mount=new Set(); trees=new Map();
  const sh=[...bld.values()].find(b=>b.type==='shop'), h=[...bld.values()].find(b=>b.type==='house');
  const L=(a,b)=>link(a,b,{run:null,warned:true,added:[],bridges:[],tunnels:[]}); const line=(c0,r0,c1,r1)=>{ let c=c0,r=r0; while(c!==c1||r!==r1){ const nc=c+Math.sign(c1-c), nr=r+Math.sign(r1-r); L(idx(c,r),idx(nc,nr)); c=nc; r=nr; } };
  const r0=area.r0+1, c0=area.c0+1, c1=area.c1-2; line(c0,r0,c1,r0);
  setMode('bend'); placeCamera(true,0); const mid=idx(Math.round((c0+c1)/2), r0);
  return JSON.stringify({mid, offX, offY, scale, c:col_(mid), r:row_(mid)}); })()`)));
const rc=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(); return [r.left,r.top]});
const P=(c,r)=>[rc[0]+g.offX+(c+0.5)*40*g.scale, rc[1]+g.offY+(r+0.5)*40*g.scale];
const a=P(g.c,g.r); await p.mouse.move(a[0],a[1]); await p.mouse.down(); await p.mouse.move(a[0], a[1]+40*g.scale*0.6, {steps:10}); await p.mouse.up(); await p.waitForTimeout(200);
const res=await p.evaluate(m=>__ev(`JSON.stringify({n: roadOff.size, mid: roadOff.get(${m})})`), g.mid);
await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<40*60;i++){ if(choosing){choosing=false;$('weekBox').hidden=true;} tick(1/40);} return 0; })()`));
console.log(res, errs); await p.screenshot({path:__dirname+'/shots/bendroad.png'}); await b.close();})();
