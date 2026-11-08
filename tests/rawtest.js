// the bare index.html, as GitHub Pages serves it: pick a map and check the game starts
const {chromium}=require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(800);
const vis = async s => p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return getComputedStyle(e).display!=='none' && r.width>0;}, s);
console.log('menu', await vis('#menu'), 'weekBox', await vis('#weekBox'), 'over', await vis('#over'), 'tip', await vis('#tip'));
try { await p.locator('#maps button').first().click({timeout:3000}); } catch(e){ console.log('click failed:', e.message.split('\n')[0]); }
await p.waitForTimeout(500); console.log('menu after click', await vis('#menu'), errs); await p.screenshot({path:__dirname+'/shots/raw.png'}); await b.close();})();
