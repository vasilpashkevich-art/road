// Let the bot-free game spawn for 6 minutes with every house wired to nothing, and photograph where things appeared.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage();
p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const r=await p.evaluate(m=>__ev(`(()=>{ newGame('${m}'); closeMenu(); T.overflow=1e9; for(let i=0;i<40*420;i++){ if(choosing){choosing=false;$('weekBox').hidden=true;} tick(1/40);} 
  const hs=[...bld.values()].filter(b=>b.type==='house'); let adj=0; for(const h of hs) if(nb(h.i).some(([,j])=>{const o=occ.get(j); return o&&o.type==='house'&&o.color===h.color;})) adj++;
  const sz={}; for(const h of hs){ const n=clusterOf(h).size; sz[n]=(sz[n]||0)+1; }
  return JSON.stringify({houses:hs.length, shops:[...bld.values()].length-hs.length, inPairs:adj, clusterSizes:sz}); })()`),process.argv[2]||'minsk');
console.log(r); await p.waitForTimeout(300); await p.screenshot({path:__dirname+'/shots/spawn.png'}); await b.close();})();
