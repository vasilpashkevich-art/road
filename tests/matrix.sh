#!/bin/bash
cd "$(dirname "$0")"
F=${1:-../index.html}; OUT=${2:-mx}
for m in minsk random bobruisk lake hills; do
  MAP=$m INV=1 SAVE=150 PH=1 OV=1 PAR=2 SEED0=3000 node run.js $F 6 900 $OUT/norm_$m.json 2>&1 | grep -v agent | tail -1 | sed "s/^/norm $m: /"
done
for m in minsk random bobruisk lake hills; do
  MAP=$m INV=1 CH=5 PH=1 OV=1 PAR=2 SEED0=4000 node run.js $F 4 900 $OUT/chaos_$m.json 2>&1 | grep -v agent | tail -1 | sed "s/^/chaos $m: /"
  MAP=$m INV=1 CYC=1 PH=1 OV=1 PAR=2 SEED0=5000 node run.js $F 4 900 $OUT/cyc_$m.json 2>&1 | grep -v agent | tail -1 | sed "s/^/cycle $m: /"
done
for m in minsk random bobruisk lake hills; do
  MAP=$m INV=1 SAVE=600 PH=1 OV=1 PAR=2 SEED0=6000 TUNE='{"overflow":1e9}' node run.js $F 2 1500 $OUT/long_$m.json 2>&1 | grep -v agent | tail -1 | sed "s/^/long $m: /"
done
echo DONE
