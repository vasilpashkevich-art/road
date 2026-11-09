// phone: a finger dragged over empty ground moves the map and lays no road; dragged from a house it lays one
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true})).newPage();
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
await p.evaluate(()=>__ev(`(()=>{ newGame('minsk'); closeMenu(); cv.setPointerCapture=()=>{}; uz=2.2; placeCamera(true,0); return 0; })()`));
const fire=(type,x,y)=>p.evaluate(([t,x,y])=>{ const c=document.getElementById('c'); c.dispatchEvent(new PointerEvent(t,{pointerId:7,pointerType:'touch',clientX:x,clientY:y,bubbles:true,button:0,isPrimary:true})); },[type,x,y]);
const st=()=>p.evaluate(()=>__ev(`JSON.stringify({edges:[...E.values()].reduce((a,s)=>a+s.size,0), pan:[Math.round(pan.x),Math.round(pan.y)]})`));
const empty=await p.evaluate(()=>__ev(`(()=>{ const R=cv.getBoundingClientRect(); for(let r=area.r0;r<area.r1;r++) for(let c=area.c0;c<area.c1;c++){ const i=idx(c,r); if(!occ.has(i)&&!roads.has(i)&&!doors.has(i)&&!water.has(i)){ const x=R.left+offX+(c+0.5)*CELL*scale, y=R.top+offY+(r+0.5)*CELL*scale; if(x>60&&x<330&&y>150&&y<600) return [x,y]; } } })()`));
console.log('before',await st());
await fire('pointerdown',empty[0],empty[1]); for(let k=1;k<=10;k++) await fire('pointermove',empty[0]+k*8,empty[1]+k*5); await fire('pointerup',empty[0]+80,empty[1]+50);
console.log('after empty drag',await st());
const h=await p.evaluate(()=>__ev(`(()=>{ const R=cv.getBoundingClientRect(); const b=[...bld.values()].find(b=>b.type==='house'); return [R.left+offX+cx(b.i)*scale, R.top+offY+cy(b.i)*scale, R.left+offX+cx(b.doorCell)*scale, R.top+offY+cy(b.doorCell)*scale]; })()`));
const dx=(h[2]-h[0]), dy=(h[3]-h[1]); await fire('pointerdown',h[0],h[1]); for(let k=1;k<=12;k++) await fire('pointermove',h[0]+dx*k/3,h[1]+dy*k/3); await fire('pointerup',h[0]+dx*4,h[1]+dy*4); console.log('quick drag from house (pans)',await st()); await fire('pointerdown',h[0],h[1]); await p.waitForTimeout(400); for(let k=1;k<=12;k++) await fire('pointermove',h[0]+dx*k/3,h[1]+dy*k/3); await fire('pointerup',h[0]+dx*4,h[1]+dy*4);
console.log('hold then drag from house (draws)',await st()); await b.close();})();
