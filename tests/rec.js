// record a bench scene as a video: node rec.js scene seconds out.mp4 [warmup]
const {chromium}=require('playwright'); const fs=require('fs'); const {execSync}=require('child_process');
const B=fs.readFileSync(__dirname+'/bench.js','utf8');
const LIB=eval(B.match(/const LIB=(`[\s\S]*?`);/)[1]); const SCENES=eval('('+B.match(/const SCENES=(\{[\s\S]*?\n\});/)[1]+')'); SCENES.ring=SCENES.ring.replace('CROSS;',SCENES.cross);
const [scene,secs,out,warm]=[process.argv[2],+process.argv[3]||10,process.argv[4]||'/tmp/claude-0/rec.mp4',+process.argv[5]||40];
const HTML=process.env.HTML||__dirname+'/hw.html', dir='/tmp/claude-0/frames_'+scene; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:960,height:640},deviceScaleFactor:1})).newPage();
 await p.goto('file://'+HTML);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dorozhki-tut','done')}); await p.reload(); await p.waitForTimeout(300);
 console.log(await p.evaluate(([lib,src])=>__ev(`(()=>{ mapId='minsk'; newGame('minsk'); closeMenu(); T.overflow=1e9; for(let k=0;k<8;k++) growArea(); budget=999; ${lib}; clearAll(); ${src}; finish(); return cars.length; })()`),[LIB,SCENES[scene]]));
 const run=n=>p.evaluate(n=>__ev(`(()=>{ for(let i=0;i<${n};i++){ paused=false; choosing=false; $('weekBox').hidden=true; $('tip').hidden=true; for(const s of bld.values()) if(s.type==='shop') s.pins=Math.max(s.pins,6); tick(1/40);} choosing=false; $('weekBox').hidden=true; $('tip').hidden=true; return 0; })()`),n);
 await run(warm*40);
 const cam=process.env.CAM||'14,6'; await p.evaluate(([c,z])=>__ev(`uz=${z}; placeCamera(true,0); pan.x=cx(idx(area.c0+${c[0]},area.r0+${c[1]}))-(view.x+view.w/2); pan.y=cy(idx(area.c0+${c[0]},area.r0+${c[1]}))-(view.y+view.h/2); placeCamera(false,0); 0`),[cam.split(',').map(Number),+(process.env.UZ||1.6)]);
 for(let f=0;f<secs*25;f++){ await run(2); await p.evaluate(()=>__ev('draw(); 0')); await p.screenshot({path:`${dir}/f${String(f).padStart(5,'0')}.png`}); }
 execSync(`ffmpeg -y -loglevel error -framerate 25 -i ${dir}/f%05d.png -c:v libx264 -preset veryfast -pix_fmt yuv420p ${out}`); console.log('ok',out); await b.close();})();
