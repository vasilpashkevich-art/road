// loads a town copied out of the game ("Скопировать город для разбора") and drives it: node town.js town.txt [seconds]
const {chromium}=require('playwright'); const fs=require('fs');
const raw=fs.readFileSync(process.argv[2],'utf8').trim().replace(/^DOROZHKI1:/,''), SECS=+process.argv[3]||300;
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:760}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
console.log(await p.evaluate(t=>__ev(`(()=>{ const d=${t}; mapId=d.map; newGame(d.map); deserialize(d); closeMenu(); T.overflow=1e9; spawnHouseT=1e9; spawnShopT=1e9; return JSON.stringify({map:mapId,week,trips,houses:[...bld.values()].filter(b=>b.type==='house').length,shops:[...bld.values()].filter(b=>b.type==='shop').length,roads:roads.size}); })()`),raw));
let worst=0, shot=0;
for(let k=0;k<SECS/10;k++){ const r=JSON.parse(await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<400;i++){ paused=false; if(choosing){ choosing=false; $('weekBox').hidden=true; } tick(1/40);} $('tip').hidden=true;
   const st=cars.filter(c=>c.phase!=='home'&&(c.stuck||0)>10); return JSON.stringify({t:Math.round(time),trips,moving:cars.filter(c=>c.phase==='go').length,st:st.slice(0,8).map(c=>[c.phase,c.why||'follow',Math.round(c.stuck)]),at:st[0]?[st[0].x,st[0].y]:null}); })()`)));
  worst=Math.max(worst,...r.st.map(x=>x[2]),0); if(r.st.length||k%6===5) console.log(JSON.stringify(r));
  if(r.at&&shot<3){ shot++; await p.evaluate(at=>__ev(`uz=2.4; placeCamera(true,0); pan.x=${at[0]}-(view.x+view.w/2); pan.y=${at[1]}-(view.y+view.h/2); placeCamera(false,0); draw(); 0`),r.at); await p.screenshot({path:`/tmp/claude-0/town_stuck${shot}.png`}); await p.evaluate(()=>__ev('uz=1; pan.x=0; pan.y=0; 0')); } }
await p.evaluate(()=>__ev(`uz=1; placeCamera(true,0); draw(); 0`)); await p.screenshot({path:'/tmp/claude-0/town.png'}); console.log('longest stand',worst,errs.slice(0,3)); await b.close();})();
