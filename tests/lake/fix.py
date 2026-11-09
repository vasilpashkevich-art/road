import json
exec(open('parse.py').read().split('# buildings')[0].replace("print('\\n'.join","_=('\\n'.join").replace("print(len(edges)","_=(len(edges)"))
SH=[('g',6,2),('g',17,0),('b',5,10),('b',9,11),('p',2,10),('p',5,14),('r',21,5),('r',25,7),('r',18,11)]
col={'r':0,'b':1,'p':2,'g':3}
shopcells=set()
for k,c,r in SH:
  for dc in (0,1):
    for dr in (0,1): shopcells.add((c+dc,r+dr))
houses=[]
for r in range(R):
  for c in range(C):
    k=G[r][c]
    if k in 'gbpr' and (c,r) not in shopcells:
      best=None
      for d,(dx,dy) in enumerate(((0,-1),(1,0),(0,1),(-1,0))):
        n=(c+dx,r+dy)
        if 0<=n[0]<C and 0<=n[1]<R and G[n[1]][n[0]]=='R':
          score=(mid(c,r,n[0],n[1],0.62)=='R')*2+1
          if not best or score>best[0]: best=(score,d)
      houses.append({'c':col[k],'at':[c,r],'door':best[1] if best else -1})
spec={'G':[''.join(x) for x in G],'edges':edges,'houses':houses,'shops':[{'c':col[k],'at':[c,r]} for k,c,r in SH]}
json.dump(spec,open('spec.json','w')); print(len(houses),'houses', sum(1 for h in houses if h['door']<0),'without door')
