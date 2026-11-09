const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:800},deviceScaleFactor:1})).newPage();
await p.goto('file://'+__dirname+'/hw.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
const r=await p.evaluate(()=>__ev(`(()=>{ mapId='lake'; newGame('lake'); closeMenu(); for(let k=0;k<12;k++) growArea(); draw(); const W=[...water].map(i=>[col_(i),row_(i)]); return JSON.stringify({area, cols, rows, W, M:[...mount].map(i=>[col_(i),row_(i)]), shot:shotOfNetwork()}); })()`));
const o=JSON.parse(r); require('fs').writeFileSync('/tmp/claude-0/lakegrid.json',JSON.stringify({area:o.area,cols:o.cols,rows:o.rows,W:o.W,M:o.M}));
require('fs').writeFileSync('/tmp/claude-0/lakeshot.jpg',Buffer.from(o.shot.split(',')[1],'base64')); console.log(o.area,o.cols,o.rows,o.W.length); await b.close();})();
