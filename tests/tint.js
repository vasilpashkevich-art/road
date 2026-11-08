const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'), bot=fs.readFileSync(__dirname+'/bot.js','utf8');
fs.writeFileSync(__dirname+'/tint.html','<!doctype html><meta charset=utf-8><style>[hidden]{display:none!important}</style><body style="margin:0;height:100vh;display:flex;flex-direction:column">'+src.replace("window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});\n})();","reset(); resize();\n"+bot+"\nwindow.__ev=c=>eval(c);\n})();"));
(async()=>{const b=await chromium.launch(); fs.mkdirSync(__dirname+'/shots',{recursive:true});
 for (const scheme of ['light','dark']){ const p=await (await b.newContext({viewport:{width:900,height:560},deviceScaleFactor:1.5,colorScheme:scheme})).newPage();
  p.on('pageerror',e=>console.log('PE',e.message)); await p.goto('file://'+__dirname+'/tint.html');
  for (const m of ['minsk','bobruisk','lake','hills','random']){
    await p.evaluate(m=>__sim(4100,170,1/20,{react:2,T:{overflow:1e9},map:m}),m);
    await p.evaluate(()=>__ev(`menuOpen=false; over=false; choosing=false; $('menu').hidden=true; $('over').hidden=true; $('weekBox').hidden=true; uz=1; placeCamera(true,0); draw(); 0`));
    await p.screenshot({path:__dirname+`/shots/tint_${scheme}_${m}.png`}); }
  // the menu with the five map cards
  await p.evaluate(()=>__ev(`openMenu(); 0`)); await p.waitForTimeout(200); await p.screenshot({path:__dirname+`/shots/tint_${scheme}_menu.png`});
  await p.close(); }
 await b.close();})();
