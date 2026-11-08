const {chromium}=require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();
 for (const [name,vp,mob] of [['desk',{width:1280,height:800},false],['phone',{width:390,height:844},true]]){
 const p=await (await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob})).newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('file://'+path.join(__dirname,'ui.html')); await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done');localStorage.setItem('dorozhki-best-minsk','143')}); await p.reload(); await p.waitForTimeout(500);
 await p.screenshot({path:`shots/menu_${name}.png`,fullPage:false});
 await p.locator('#maps button').nth(1).click(); await p.waitForTimeout(300);
 // play a bit with a few roads so the picture has something on it
 await p.evaluate(()=>__ev(`(()=>{ for(let i=0;i<40*40;i++){ if(choosing){choosing=false;$('weekBox').hidden=true;} tick(1/40);} trips=212; const s=[...bld.values()].find(b=>b.type==='shop'); s.pins=capOf(s); s.overT=T.overflow-0.05; tick(0.1); return 0;})()`)); await p.waitForTimeout(400);
 await p.screenshot({path:`shots/over_${name}.png`}); }
 await b.close();})();
