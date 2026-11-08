// spawn order and houses per shop over a game with nothing connected (overflow off)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
for (const m of ['tokyo','minsk']) console.log(m, await p.evaluate(m=>__ev(`(()=>{ newGame('${m}'); closeMenu(); T.overflow=1e9; const seq=[], seen=new Set(), snap=[];
  for(let i=0;i<40*1500;i++){ if(choosing){choosing=false;$('weekBox').hidden=true;} tick(1/40);
    for(const b of bld.values()) if(b.type==='shop'&&!isTail(b)&&!seen.has(b)){ seen.add(b); seq.push(b.color+'@'+Math.round(time)); }
    if(i%(40*150)===0){ const h=[...bld.values()].filter(b=>b.type==='house').length, s=[...bld.values()].filter(b=>b.type==='shop'&&!isTail(b)).length; snap.push(Math.round(time)+'s:'+h+'/'+s); } }
  return 'shops '+seq.join(' ')+' | houses/shops '+snap.join(' '); })()`),m));
await b.close();})();
