const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();for(const [w,h,n] of [[844,390,'land'],[390,844,'port']]){const p=await (await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2})).newPage();
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); for(let i=0;i<40*60;i++) tick(1/40); return 0; })()`)); await p.waitForTimeout(400);
console.log(n, await p.evaluate(()=>__ev(`JSON.stringify({cols,rows,scale:+scale.toFixed(2),area})`)));
await p.screenshot({path:'/tmp/claude-0/'+n+'.png'}); await p.evaluate(()=>__ev(`openMenu(); 0`)); await p.waitForTimeout(200); await p.screenshot({path:'/tmp/claude-0/'+n+'_menu.png'}); }
await b.close();})();
