// run the bot until a condition holds, then zoom on the spot and screenshot + dump
const {chromium}=require('playwright'); const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8'), bot=fs.readFileSync(__dirname+'/bot.js','utf8');
const html='<!doctype html><meta charset=utf-8><style>[hidden]{display:none!important}</style><body style="margin:0">'+src.replace("window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});\n})();","reset(); resize();\n"+bot+"\nwindow.__ev=c=>eval(c);\n})();");
fs.writeFileSync(__dirname+'/catch.html',html);
const COND=process.argv[3], DUMP=process.argv[4], MAP=process.env.MAP||'minsk', NAME=process.env.NAME||'catch';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:650},deviceScaleFactor:2});
 p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('file://'+__dirname+'/catch.html');
 for (let seed=+(process.env.SEED0||3000); seed<+(process.env.SEED0||3000)+10; seed++){
  await p.evaluate(([ch,sv,uzv])=>{window.CH=ch;window.SV=sv;window.UZ=+(uzv||3)},[+(process.env.CH||0),+(process.env.SAVE||0),process.env.UZ]); const r=await p.evaluate(([s,m,cond])=>__sim(s,1500,1/20,{react:2,T:{overflow:1e9},map:m,cycle:!!window.CYC,stopFn:cond,chaos:+(window.CH||0),saveAt:+(window.SV||0)}),[seed,MAP,COND]);
  if(!r.stop) continue;
  const info=await p.evaluate(([x,y,dump])=>__ev(`menuOpen=false; over=false; $('menu').hidden=true; $('over').hidden=true; $('weekBox').hidden=true; uz=(window.UZ||3); placeCamera(true,0); pan.x=${x}-(view.x+view.w/2); pan.y=${y}-(view.y+view.h/2); placeCamera(false,0); draw(); (${dump})`),[r.stop.x,r.stop.y,DUMP]);
  await p.screenshot({path:__dirname+`/${NAME}.png`}); console.log(seed, r.t, info); break; }
 await b.close();})();
