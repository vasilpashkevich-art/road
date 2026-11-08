# builds tests/hw.html: index.html plus an eval hook for scene tests
import os; d=os.path.dirname(os.path.abspath(__file__))
s=open(d+'/../index.html').read()
k='window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});'
assert k in s
s=s.replace(k,k+'\nwindow.__ev=c=>eval(c);')
open(d+'/hw.html','w').write('<!doctype html><meta charset=utf-8><style>[hidden]{display:none!important}</style><body style="margin:0;height:100vh;display:flex;flex-direction:column">'+s)
