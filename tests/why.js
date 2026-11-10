// one bot game per seed: where cars stand, by reason (sampled), and how fast the moving ones go
const {chromium}=require('playwright'); const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8'), bot=fs.readFileSync(__dirname+'/bot.js','utf8');
const html='<!doctype html><meta charset=utf-8><style>[hidden]{display:none!important}</style><body style="margin:0">'+src.replace("window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});\n})();","reset(); resize();\n"+bot+"\nwindow.__ev=c=>eval(c);\n})();");
fs.writeFileSync(__dirname+'/why.html',html);
(async()=>{const b=await chromium.launch();const p=await b.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); await p.goto('file://'+__dirname+'/why.html');
 for(const seed of (process.env.SEEDS||'1000,1001,1002').split(',').map(Number)){
  const COND=`(()=>{ const W=window.__W||(window.__W={}); for(const c of cars){ if(c.phase==='home') continue; const far=c.phase==='go'&&c.v<VMAX*0.1&&!(c.gap<CELL*1.2)&&(c.segs[c.si].len-c.s)>STOP+8; const k=c.phase!=='go'?c.phase:(c.v<VMAX*0.1?(far?'FAR:':'stop:')+(c.why||'follow'):(c.v<VMAX*0.6?'slow':'fast')); W[k]=(W[k]||0)+1; } return false; })()`;
  await p.evaluate(()=>{window.__W={}});
  const r=await p.evaluate(([s,cond])=>__sim(s,1500,1/20,{react:2,T:{},map:'random',stopFn:cond}),[seed,COND]);
  const W=await p.evaluate(()=>window.__W); const tot=Object.values(W).reduce((a,b)=>a+b,0);
  console.log(seed,'t',Math.round(r.t),'trips',r.trips, Object.entries(W).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+(100*v/tot).toFixed(1)+'%').join(', ')); }
 await b.close();})();
