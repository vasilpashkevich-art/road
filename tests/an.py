import json,glob,collections,sys
d=sys.argv[1] if len(sys.argv)>1 else '.'
INV=collections.Counter(); EX={}; ERR=[]; OV=collections.Counter(); PH=collections.Counter(); SD=[]; LS=collections.Counter(); N=0
for f in sorted(glob.glob(d+'/*.json')):
  for x in json.load(open(f)):
    N+=1; tag=f.split('/')[-1][:-5]+'#'+str(x['seed'])
    for e in (x.get('err') or []): ERR.append((tag,e[:300]))
    for k,v in (x.get('inv') or {}).items(): INV[k]+=v['n']; EX.setdefault(k,(tag,v['ex'][:2]))
    ov=x.get('overlap') or {}; OV[f.split('/')[-1].split('_')[0]]+=ov.get('n',0)
    for e in (x.get('ph') or []): PH[(e['why'],e.get('mutual'))]+=1
    if x.get('saveDiff'): SD.append((tag,x['saveDiff']))
    for k,v in (x.get('lotStuck') or {}).items(): LS[k]+=v
print('games',N); print('errors',len(ERR)); [print(' ',t,e) for t,e in ERR[:6]]
print('invariants',dict(INV)); [print(' ',k,json.dumps(v)[:400]) for k,v in EX.items()]
print('overlap samples by mode',dict(OV)); print('stuck heads',dict(PH)); print('saveDiff',SD[:3]); print('lotStuck',dict(LS))
