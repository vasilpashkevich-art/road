const {chromium}=require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+path.join(__dirname,'ui.html')); await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(400);
await p.locator('#maps button').nth(0).click(); await p.waitForTimeout(300);
await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<40*120;i++){ if(choosing){choosing=false;$('weekBox').hidden=true;} tick(1/40);} const s=[...bld.values()].find(b=>b.type==='shop'); s.pins=capOf(s); s.overT=T.overflow-0.05; tick(0.1); return 0; })()`)); await p.waitForTimeout(400);
await p.click('#overMenuBtn'); await p.waitForTimeout(500); await p.screenshot({path:__dirname+'/shots/menu_after.png'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#maps .mshot')].length)); await b.close();})();
