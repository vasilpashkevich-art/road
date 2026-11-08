// Drag a road out of a house through each of its free sides with the mouse: the house must face that way.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1000,height:760}})).newPage();
p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/'+(process.argv[2]||'hw.html'));await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const ev=c=>p.evaluate(c=>__ev(c),c);
await ev(`(()=>{ newGame('random'); closeMenu(); budget=99; return 0; })()`); await p.waitForTimeout(300);
const res=[];
for (const [dc,dr,name] of [[0,-1,'N'],[1,0,'E'],[0,1,'S'],[-1,0,'W'],[1,-1,'NE'],[-1,1,'SW']]){
  const g=JSON.parse(await ev(`(()=>{ const h=[...bld.values()].find(b=>b.type==='house'); paused=true; return JSON.stringify({i:h.i,c:col_(h.i),r:row_(h.i),door:h.door,dc:h.doorCell,offX,offY,scale,linked:hasEdge(h.i,h.doorCell)}); })()`));
  const r=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(); return [r.left,r.top]});
  const P=(c,rw)=>[r[0]+g.offX+(c+0.5)*40*g.scale, r[1]+g.offY+(rw+0.5)*40*g.scale];
  const a=P(g.c,g.r), z=P(g.c+dc*2,g.r+dr*2);
  await p.mouse.move(a[0],a[1]); await p.mouse.down(); for(let k=1;k<=12;k++) await p.mouse.move(a[0]+(z[0]-a[0])*k/12, a[1]+(z[1]-a[1])*k/12); await p.mouse.up(); await p.waitForTimeout(120);
  const g2=JSON.parse(await ev(`(()=>{ const h=bld.get(${g.i}); return JSON.stringify({door:h.door,dcol:col_(h.doorCell)-col_(h.i),drow:row_(h.doorCell)-row_(h.i),linked:hasEdge(h.i,h.doorCell)}); })()`));
  res.push(name+': door '+JSON.stringify([g2.dcol,g2.drow])+(g2.linked?' linked':' NOT linked'));
  if(!process.env.KEEP) await ev(`(()=>{ const h=bld.get(${g.i}); for(const j of [...eOf(h.i)]) delEdge(h.i,j); for (const c of [...roads]) if(!bld.has(c)) clearNode(c); return 0; })()`); }
console.log(res.join('\n')); await p.screenshot({path:__dirname+'/shots/turn.png'}); await b.close();})();
