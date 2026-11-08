const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
// build a test copy of the game with a hook into its internals
{ const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'), END="window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});\n})();";
  fs.writeFileSync(path.join(__dirname,'ui.html'),'<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style><body style="margin:0;height:100vh;display:flex;flex-direction:column">'+src.replace(END,END.slice(0,-6)+"\nwindow.__ev=c=>eval(c);\n})();")); }
const R=[]; const ok=(name,cond,info)=>{ R.push((cond?'OK  ':'FAIL')+' '+name+(info!==undefined?' — '+JSON.stringify(info):'')); };
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:800}}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error' && !/fonts|ERR_|net::/.test(m.text())) errs.push('console: '+m.text()); });
 const url='file://'+path.join(__dirname,'ui.html'); await p.goto(url); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
 const ev=c=>p.evaluate(c=>__ev(c),c);
 ok('menu open on first visit', await p.isVisible('#menu'));
 ok('no Continue on first visit', !(await p.isVisible('#contBtn')));
 ok('6 map cards', (await p.locator('#maps button').count())===6, await p.locator('#maps button').count());
 ok('2 maps locked at first', (await p.locator('#maps button.locked').count())===2 && (await p.locator('#maps button:disabled').count())===2);
 // a record of 350 opens the rest
 await p.evaluate(()=>localStorage.setItem('dorozhki-best-minsk','350')); await ev('(buildMenuMaps(),0)');
 ok('all maps open at 350', (await p.locator('#maps button.locked').count())===0);
 // pick each map
 for (let k=0;k<6;k++){ await p.locator('#maps button').nth(k).click(); await p.waitForTimeout(250);
   const st=JSON.parse(await ev(`JSON.stringify({menu:menuOpen,map:mapId,shops:[...bld.values()].filter(b=>b.type==='shop').length,houses:[...bld.values()].filter(b=>b.type==='house').length,tut:!!tut,water:water.size})`));
   ok('start map '+st.map, !st.menu && st.shops===1 && st.houses>=2, st);
   if(k<5){ await p.click('#menuBtn'); await p.waitForTimeout(150); } }
 // tutorial shown on fresh start
 ok('tutorial tip visible', await p.isVisible('#tip'));
 await p.click('#tipSkip'); ok('tutorial skipped', !(await p.isVisible('#tip')));
 // draw road from house to shop door with real mouse
 const box=await p.locator('#c').boundingBox();
 const g=JSON.parse(await ev(`(()=>{const s=[...bld.values()].find(b=>b.type==='shop'); const h=[...bld.values()].filter(b=>b.type==='house'&&b.color===s.color)[0]; return JSON.stringify({h:h.i,s:s.doorCell,cols,offX,offY,scale})})()`));
 const P=i=>[box.x+g.offX+((i%g.cols)+0.5)*40*g.scale, box.y+g.offY+(Math.floor(i/g.cols)+0.5)*40*g.scale];
 const b0=+await ev('budget');
 const hc=g.h%g.cols, hr=Math.floor(g.h/g.cols), sc=g.s%g.cols, sr=Math.floor(g.s/g.cols);
 const route=JSON.parse(await ev(`(()=>{ const h=bld.get(${g.h}), t=${g.s}; const prev=new Map([[h.doorCell,-1]]), q=[h.doorCell]; // a way over open ground, the way a player would drag
   for(let k=0;k<q.length;k++){ const u=q[k]; if(u===t) break; for(const [,v] of nb(u)) if(!prev.has(v) && !occ.has(v) && !water.has(v) && !mount.has(v) && inPlay(v) && (v===t || !doors.has(v))){ prev.set(v,u); q.push(v); } }
   const out=[]; for(let u=t; u!==-1 && u!==undefined; u=prev.get(u)) out.unshift(u); return JSON.stringify(out); })()`));
 await p.mouse.move(...P(g.h)); await p.mouse.down(); for(const c of route) await p.mouse.move(...P(c),{steps:6}); await p.mouse.up(); await p.waitForTimeout(200);
 const conn=await ev(`(()=>{const s=[...bld.values()].find(b=>b.type==='shop'); return !!bfsNodes(${g.h}, s)})()`);
 ok('mouse-drawn road connects house to shop', conn, {budgetUsed:b0-(+await ev('budget'))});
 // tool modes without stock
 await p.click('#tRing'); await p.waitForTimeout(100); ok('ring without stock gives toast', await p.isVisible('#toast') || (await ev('mode'))==='draw', await ev('mode'));
 await p.click('#tDraw');
 // erase: right-button drag along the road
 const e0=+await ev('[...E].reduce((n,[,v])=>n+v.size,0)');
 await p.mouse.move(...P(route[Math.floor(route.length/2)])); await p.mouse.down({button:'right'}); {const q=P(route[Math.floor(route.length/2)]); await p.mouse.move(q[0]+3,q[1]+2,{steps:2});} await p.mouse.up({button:'right'}); await p.waitForTimeout(100);
 const e1=+await ev('[...E].reduce((n,[,v])=>n+v.size,0)');
 ok('right-click erases road', e1<e0, {e0,e1});
 // pause
 await p.click('#pauseBtn'); const t1=+await ev('time'); await p.waitForTimeout(500); const t2=+await ev('time'); ok('pause stops clock', t1===t2); await p.click('#pauseBtn');
 await p.keyboard.press('Space'); ok('space pauses', await ev('paused')===true); await p.keyboard.press('Space');
 // week offer
 await ev('weekT=0.05; 0'); await p.waitForTimeout(400); ok('week offer shown', await p.isVisible('#weekBox'));
 const before=JSON.parse(await ev('JSON.stringify({ringN,hwN,bridgesN,lightN,tunnelsN,budget})'));
 await p.locator('#offers button').first().click(); await p.waitForTimeout(150);
 const after=JSON.parse(await ev('JSON.stringify({ringN,hwN,bridgesN,lightN,tunnelsN,budget})'));
 ok('offer pick adds stock', JSON.stringify(before)!==JSON.stringify(after) && !(await p.isVisible('#weekBox')), {before,after});
 // zoom buttons and wheel
 await p.click('#zIn'); ok('zoom in button', (+await ev('uz'))>1.3); await p.click('#zOut'); await p.waitForTimeout(80); ok('zOut disabled at 1', await p.isDisabled('#zOut')); ok('zoom out to 1', Math.abs(+await ev('uz')-1)<0.01);
 await p.mouse.move(box.x+600,box.y+300); await p.mouse.wheel(0,-300); await p.waitForTimeout(100); ok('wheel zoom', (+await ev('uz'))>1.05);
 // save + reload keeps the game
 await p.waitForTimeout(3500); const snapT=+await ev('time'); const edges=+await ev('[...E].reduce((n,[,v])=>n+v.size,0)');
 await p.reload(); await p.waitForTimeout(500);
 ok('menu after reload has Continue', await p.isVisible('#contBtn'));
 await p.click('#contBtn'); await p.waitForTimeout(200);
 const t3=+await ev('time'), e3=+await ev('[...E].reduce((n,[,v])=>n+v.size,0)');
 ok('reload restores time and roads', t3>=snapT-4 && e3===edges, {snapT,t3,edges,e3});
 // game over
 await ev(`(()=>{const s=[...bld.values()].find(b=>b.type==='shop'); s.pins=T.pinMax; s.overT=T.overflow-0.1; return 0})()`); await p.waitForTimeout(600);
 ok('game over card', await p.isVisible('#over'));
 { const o=JSON.parse(await ev(`JSON.stringify({src:$('overShot').src.length, stats:$('overStats').children.length, cause:$('overCause').textContent, n:$('overTrips').textContent, best:$('overBest').textContent})`));
   ok('game over: picture, stats, cause', o.src>2000 && o.stats===4 && /магазин/.test(o.cause) && o.n!=='' && o.best!=='', o); await p.screenshot({path:path.join(__dirname,'shots','over.png')}); }
 await p.click('#againBtn'); await p.waitForTimeout(300); ok('again restarts', !(await p.isVisible('#over')) && (+await ev('time'))<2);
 // sound toggle
 const s0=await ev('soundOn'); await p.click('#soundBtn'); ok('sound toggle', (await ev('soundOn'))!==s0); await p.click('#soundBtn');
 // menu escape
 await p.keyboard.press('Escape'); ok('Esc opens menu', await ev('menuOpen')); await p.keyboard.press('Escape'); ok('Esc closes menu', !(await ev('menuOpen')));
 await p.screenshot({path:__dirname+'/shots/ui_desktop.png'});
 // mobile
 const m=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}); const q=await m.newPage(); q.on('pageerror',e=>errs.push('mobile: '+e.message));
 await q.goto(url); await q.evaluate(()=>localStorage.clear()); await q.reload(); await q.waitForTimeout(400);
 ok('mobile: no horizontal scroll', await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), await q.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]));
 await q.screenshot({path:__dirname+'/shots/ui_mobile_menu.png'});
 await q.locator('#maps button').first().tap(); await q.waitForTimeout(400);
 const dock=await q.locator('.dock').boundingBox(); ok('mobile: dock fits screen', dock.x>=0 && dock.x+dock.width<=390, dock);
 const bar=await q.evaluate(()=>{const r=document.querySelector('.bar').getBoundingClientRect(); return [r.width, document.querySelector('.bar').scrollWidth]}); ok('mobile: top bar fits', bar[1]<=bar[0]+1, bar);
 await q.screenshot({path:__dirname+'/shots/ui_mobile_game.png'});
 // dark
 const d=await b.newContext({viewport:{width:1280,height:800},colorScheme:'dark'}); const dp=await d.newPage(); dp.on('pageerror',e=>errs.push('dark: '+e.message));
 await dp.goto(url); await dp.waitForTimeout(400); await dp.screenshot({path:__dirname+'/shots/ui_dark_menu.png'});
 ok('no page errors', errs.length===0, errs.slice(0,5));
 console.log(R.join('\n')); await b.close(); })();
