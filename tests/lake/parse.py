# reads the user's thumbnail of a Lake town into a grid spec: road cells/edges, houses (colour, door), shop blocks
from PIL import Image; import json, math
im=Image.open('/mnt/user-data/attachments/0c49fe0b-77a5-52ad-8a32-4b0cac8a200e/4523e419-image.png').convert('RGB')
S=17.8;X0=12;Y0=6.6;C,R=30,17
P={'R':(226,220,242),'.':(190,160,75),'w':(68,115,168),'g':(79,151,100),'b':(75,115,200),'p':(125,80,216),'r':(215,85,70),'.2':(215,180,90),'.3':(170,140,70),'m':(240,230,200)}
def near(px):
  best=None;bd=1e9
  for k,v in P.items():
    d=sum((a-b)**2 for a,b in zip(px,v))
    if d<bd: bd=d;best=k
  return best[0] if best[0]!='.' else '.'
def at(x,y):
  if x<0 or y<0 or x>=im.size[0] or y>=im.size[1]: return '.'
  return near(im.getpixel((int(x),int(y))))
def cell(c,r):
  votes={}
  for fx in (0.3,0.5,0.7):
    for fy in (0.3,0.5,0.7):
      k=at(X0+(c+fx)*S,Y0+(r+fy)*S); votes[k]=votes.get(k,0)+1
  return max(votes,key=votes.get)
G=[[cell(c,r) for c in range(C)] for r in range(R)]
lake=json.load(open('/tmp/claude-0/lakegrid.json')); W=set(map(tuple,lake['W'])); M=set(map(tuple,lake['M']))
for r in range(R):
  for c in range(C):
    if G[r][c]=='w' and (c,r) not in W: G[r][c]='b'
    if G[r][c]=='m': G[r][c]='R'
for (c,r) in W: G[r][c]='w'
for (c,r) in M: G[r][c]='^'
print('\n'.join(''.join(row) for row in G))
def mid(c1,r1,c2,r2,f=0.5): return at(X0+(c1+.5+(c2-c1)*f)*S, Y0+(r1+.5+(r2-r1)*f)*S)
edges=[]
for r in range(R):
  for c in range(C):
    if G[r][c]!='R': continue
    for dc,dr in ((1,0),(0,1),(1,1),(-1,1)):
      c2,r2=c+dc,r+dr
      if not(0<=c2<C and 0<=r2<R) or G[r2][c2]!='R': continue
      if dc and dr:
        if all(mid(c,r,c2,r2,f)=='R' for f in (0.35,0.5,0.65)) and not (G[r][c2]=='R' and G[r2][c]=='R'): edges.append([c,r,c2,r2])
      else:
        if mid(c,r,c2,r2)=='R': edges.append([c,r,c2,r2])
json.dump({'G':[''.join(x) for x in G],'edges':edges},open('spec.json','w'))
print(len(edges),'edges')
# buildings: same-colour blobs; 1 cell = house, bigger = shop building
seen=set(); blobs=[]
for r in range(R):
  for c in range(C):
    k=G[r][c]
    if k in 'gbpr' and (c,r) not in seen:
      q=[(c,r)]; seen.add((c,r)); i=0
      while i<len(q):
        x,y=q[i]; i+=1
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
          n=(x+dx,y+dy)
          if 0<=n[0]<C and 0<=n[1]<R and n not in seen and G[n[1]][n[0]]==k: seen.add(n); q.append(n)
      blobs.append((k,q))
houses=[];shops=[]
col={'r':0,'b':1,'g':2,'p':3}
for k,q in blobs:
  if len(q)>=3: shops.append({'c':col[k],'cells':q})
  else:
    for (c,r) in q:
      best=None
      for d,(dx,dy) in enumerate(((0,-1),(1,0),(0,1),(-1,0))):
        n=(c+dx,r+dy)
        if 0<=n[0]<C and 0<=n[1]<R and G[n[1]][n[0]]=='R':
          score=(mid(c,r,n[0],n[1],0.62)=='R')*2+1
          if not best or score>best[0]: best=(score,d)
      houses.append({'c':col[k],'at':[c,r],'door':best[1] if best else -1})
spec=json.load(open('spec.json')); spec['houses']=houses; spec['shops']=shops; json.dump(spec,open('spec.json','w'))
print(len(houses),'houses',len(shops),'shops',[ (s['c'],len(s['cells'])) for s in shops])
