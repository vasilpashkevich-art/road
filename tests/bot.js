// injected inside the game IIFE: has access to all internals
window.__sim = function(seed, maxT, dt, cfg){
  let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  Object.assign(T, cfg.T || {}); if (cfg.cycle){ let kk = 0; const ts = ['corner', 'long', 'l', 'square', 'm', 'kiosk']; pickShopSize = () => ts[kk++ % ts.length]; } menuOpen = false; if (cfg.map) mapId = cfg.map; reset(); resize();
  const st = { firstPin5: null, firstPin8: null, maxStopped: 0, roadShort: 0, bridgeShort: 0, ringsPlaced: 0, picks: {}, ghosts: 0, weeks: 0 };
  const reach = (h, s) => !!bfsNodes(h.i, s);
  function route(from, to){ // dijkstra over 8-neighbour moves the player could draw
    const N = cols * rows, dist = new Float64Array(N).fill(Infinity), par = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    dist[from] = 0; const q = [[0, from]];
    while (q.length){ let bi = 0; for (let k = 1; k < q.length; k++) if (q[k][0] < q[bi][0]) bi = k; const [d, u] = q.splice(bi, 1)[0];
      if (done[u]) continue; done[u] = 1; if (u === to) break;
      for (let dd = 0; dd < 8; dd++){ const c = col_(u) + D8[dd][0], r = row_(u) + D8[dd][1]; if (!inb(c, r)) continue; const v = idx(c, r);
        if (occ.has(v) && v !== to) continue;
        let w; if (hasEdge(u, v)) w = 0.15; else if (canEdge(u, v)) w = (water.has(v) ? 2.5 : mount.has(v) ? (tunnelsN > 0 ? 2.5 : 40) : 1) * (dd & 1 ? 1.08 : 1) + (roads.has(v) ? 0.6 : 0); else continue;
        const nd = d + w; if (nd < dist[v]){ dist[v] = nd; par[v] = u; q.push([nd, v]); } } }
    if (dist[to] === Infinity) return null;
    const p = []; for (let u = to; u !== -1; u = par[u]) p.push(u); return p.reverse();
  }
  function build(p){
    let land = 0, runs = 0, truns = 0;
    for (let k = 1; k < p.length; k++){ if (hasEdge(p[k-1], p[k])) continue; if (!freeEdge(p[k-1], p[k])) land++; if (water.has(p[k]) && !water.has(p[k-1])) runs++; if (mount.has(p[k]) && !mount.has(p[k-1])) truns++; }
    if (truns > tunnelsN){ st.tunnelShort = (st.tunnelShort || 0) + 1; return false; }
    if (land > budget){ st.roadShort++; return false; }
    if (runs > bridgesN){ st.bridgeShort++; return false; }
    const sx = { run: null, warned: true, tunnels: [] };
    for (let k = 1; k < p.length; k++) if (!link(p[k-1], p[k], sx)) return false;
    return true;
  }
  function connect(){
    const houses = [...bld.values()].filter(b => b.type === 'house'), shops = [...bld.values()].filter(b => b.type === 'shop');
    for (const h of houses){ const mine = shops.filter(s => s.color === h.color); if (!mine.length) continue;
      if (mine.some(s => reach(h, s))) continue;
      mine.sort((x, y) => Math.abs(col_(x.i)-col_(h.i)) + Math.abs(row_(x.i)-row_(h.i)) - Math.abs(col_(y.i)-col_(h.i)) - Math.abs(row_(y.i)-row_(h.i)));
      for (const s of mine){ const p = route(h.i, s.i); if (p && build(p)) break; } }
    for (const s of shops){ const mine = houses.filter(h => h.color === s.color);
      if (!mine.length || mine.some(h => reach(h, s))) continue;
      mine.sort((x, y) => Math.abs(col_(x.i)-col_(s.i)) + Math.abs(row_(x.i)-row_(s.i)) - Math.abs(col_(y.i)-col_(s.i)) - Math.abs(row_(y.i)-row_(s.i)));
      const p = route(mine[0].i, s.i); if (p) build(p); }
  }
  function placeRing(){
    if (ringN <= 0) return; let best = -1, bv = 2;
    for (const i of roads){ if (rings.has(i) || bridgeOf.has(i) || !isJunction(i) || canRing(i)) continue; let n = 0;
      for (const c of cars) if (c.phase === 'go' && c.v < VMAX * 0.2 && Math.hypot(c.x - cx(i), c.y - cy(i)) < CELL * 1.3) n++;
      if (n > bv){ bv = n; best = i; } }
    if (best >= 0){ rings.add(best); ringN--; netV++; zoneRings(); st.ringsPlaced++; }
  }
  function placeLight(){
    if (lightN <= 0) return; let best = -1, bv = 2;
    for (const i of roads){ if (rings.has(i) || lights.has(i) || bridgeOf.has(i) || !isJunction(i)) continue; let n = 0;
      for (const c of cars) if (c.phase === 'go' && c.v < VMAX * 0.2 && Math.hypot(c.x - cx(i), c.y - cy(i)) < CELL * 1.3) n++;
      if (n > bv){ bv = n; best = i; } }
    if (best >= 0){ lights.set(best, { g: 0, t: 0, clear: 0, want: [false, false] }); lightN--; st.lights = (st.lights || 0) + 1; }
  }
  function placeHw(){ // a highway over the longest drive from a house to its shop
    if (hwN <= 0) return; let best = null, bl = 8;
    for (const h of bld.values()){ if (h.type !== 'house') continue;
      for (const sh of bld.values()){ if (sh.type !== 'shop' || sh.color !== h.color) continue; const p = bfsNodes(h.i, sh); if (!p || p.length <= bl) continue;
        const ends = p.slice(2, -2).filter(i => roads.has(i) && !hwOf.has(i) && !bridgeOf.has(i) && !ringZone.has(i)); if (ends.length < 2) continue;
        const a0 = ends[0], b0 = ends[ends.length - 1]; if (Math.abs(col_(a0) - col_(b0)) + Math.abs(row_(a0) - row_(b0)) < 4) continue;
        bl = p.length; best = [a0, b0]; } }
    if (best){ const h = { a: best[0], b: best[1] }; shapeHw(h);
      if (Math.random() < 0.6){ const ax = cx(h.a), ay = cy(h.a), bx = cx(h.b), by = cy(h.b), L = Math.hypot(bx - ax, by - ay), k = (Math.random() * 2 - 1) * 0.5 * L; // swing it like a player dragging the handle
        h.m = [Math.round((ax + bx) / 2 - (by - ay) / L * k), Math.round((ay + by) / 2 + (bx - ax) / L * k)]; shapeHw(h); if (hwWhyNot(h)){ h.m = null; shapeHw(h); } else st.bent = (st.bent || 0) + 1; } hws.push(h); hwOf.set(h.a, { h, partner: h.b }); hwOf.set(h.b, { h, partner: h.a }); hwN--; netV++; st.hws = (st.hws || 0) + 1; }
  }
  function pick(){
    const btns = [...$('offers').children], names = btns.map(b => b.firstChild.textContent);
    st.pk = (st.pk || 0) + 1; const rot = ['Шоссе', 'Светофор ×2', 'Кольцо ×2', `+${T.offerRoads} дорог`]; const r0 = rot.slice(st.pk % 4).concat(rot.slice(0, st.pk % 4));
    if (st.tunnelShort > 0 && tunnelsN === 0){ const k = names.indexOf('Туннель ×2'); if (k >= 0){ st.picks['Туннель ×2'] = (st.picks['Туннель ×2'] || 0) + 1; btns[k].click(); return; } }
    const want = st.bridgeShort > 0 && bridgesN === 0 ? ['Мост ×2', ...r0] : budget < 20 ? [`+${T.offerRoads} дорог`, ...r0, 'Мост ×2'] : [...r0, 'Мост ×2'];
    for (const w of want){ const k = names.indexOf(w); if (k >= 0){ st.picks[w] = (st.picks[w] || 0) + 1; btns[k].click(); return; } }
    btns[0].click();
  }
  let botT = 0;
  while (time < maxT && !over && !st.stop){
    if (choosing){ pick(); st.weeks++; }
    botT -= dt; if (botT <= 0){ botT = cfg.react; connect(); placeRing(); placeLight(); placeHw(); }
    if (cfg.chaos){ st.chT = (st.chT || 0) + dt; if (st.chT > cfg.chaos){ st.chT = 0; const R = Math.random;
      const hs = [...bld.values()].filter(b => b.type === 'house'); const rs = [...roads];
      if (hws.length && R() < 0.35){ const h = hws[Math.floor(R() * hws.length)], m0 = h.m; const ax = cx(h.a), ay = cy(h.a), bx = cx(h.b), by = cy(h.b), L = Math.hypot(bx - ax, by - ay), k = (R() * 2 - 1) * 0.5 * L; // drag the handle under traffic
        h.m = R() < 0.2 ? null : [Math.round((ax + bx) / 2 - (by - ay) / L * k), Math.round((ay + by) / 2 + (bx - ax) / L * k)]; shapeHw(h); for (const g of hws) if (g !== h) shapeHw(g);
        if (hwWhyNot(h)){ h.m = m0; shapeHw(h); for (const g of hws) if (g !== h) shapeHw(g); } else st.rebent = (st.rebent || 0) + 1; netV++; }
      if (R() < 0.5 && hs.length){ const h = hs[Math.floor(R() * hs.length)]; const sides = nb(h.i).map(x => x[1]).filter(j => !occ.has(j) && !water.has(j));
        if (sides.length){ const sd = sides[Math.floor(R() * sides.length)]; link(h.i, sd, { run: null, warned: true, added: [], bridges: [] }); st.turns = (st.turns || 0) + 1; } }
      else if (rs.length){ const c = rs[Math.floor(R() * rs.length)]; eraseCell(c); st.erases = (st.erases || 0) + 1; } } }
    if (cfg.stopFn && Math.floor(time / dt) % 20 === 0){ const hit = eval(cfg.stopFn); if (hit){ st.stop = { x: hit.x, y: hit.y, id: hit.id }; break; } }
    try { tick(dt); } catch (e){ st.err = (st.err || []); if (st.err.length < 5) st.err.push(String(e && e.stack || e).slice(0, 600)); if (st.err.length >= 5) break; }
    if (cfg.saveAt && !st.saved && time > cfg.saveAt){ st.saved = true; try { const before = { e: [...E].reduce((n, [, v]) => n + v.size, 0), b: bld.size, t: trips };
        const d = JSON.parse(JSON.stringify(serialize())); deserialize(d); const after = { e: [...E].reduce((n, [, v]) => n + v.size, 0), b: bld.size, t: trips };
        if (JSON.stringify(before) !== JSON.stringify(after)) st.saveDiff = [before, after]; } catch (e){ st.err = st.err || []; st.err.push('save: ' + String(e && e.stack || e).slice(0, 400)); } }
    if (cfg.inv && Math.floor(time / dt) % 20 === 0){ st.inv = st.inv || {}; const V = (k, info) => { const o = st.inv[k] = st.inv[k] || { n: 0, ex: [] }; o.n++; if (o.ex.length < 3) o.ex.push(Object.assign({ t: Math.round(time) }, info)); };
      const PH = ['home', 'go', 'park', 'wait', 'unpark', 'leave'];
      for (const c of cars){
        if (!PH.includes(c.phase)) V('badPhase', { id: c.id, ph: c.phase });
        if (![c.x, c.y, c.ang, c.da, c.v].every(Number.isFinite)) V('nan', { id: c.id, ph: c.phase, x: c.x, y: c.y, v: c.v });
        if (c.phase === 'go'){ if (!c.segs || !c.segs[c.si]) V('noSeg', { id: c.id, si: c.si, n: c.segs && c.segs.length }); else if (!(c.s >= 0) || c.s > c.segs[c.si].len + 1) V('badS', { id: c.id, s: c.s, len: c.segs[c.si].len }); }
        if (c.phase !== 'go' && c.lock >= 0) V('lockOffRoad', { id: c.id, ph: c.phase, lock: c.lock });
        if (c.lock >= 0 && !(locks.get(c.lock) && locks.get(c.lock).has(c))) V('lockMissing', { id: c.id, lock: c.lock });
        if (c.slotShop && c.slotShop.slots[c.slot] !== c) V('slotMismatch', { id: c.id, ph: c.phase, slot: c.slot });
        if ((c.phase === 'park' || c.phase === 'wait' || c.phase === 'unpark') && !c.slotShop) V('parkNoSlot', { id: c.id, ph: c.phase });
        if (c.phase === 'go' && (c.stuck || 0) > 150) V('frozen150', { id: c.id, cell: c.segs[c.si].cell, kind: c.segs[c.si].kind, back: c.back });
        if (c.phase !== 'home' && (c.x < -CELL || c.y < -CELL || c.x > cols * CELL + CELL || c.y > rows * CELL + CELL)) V('offMap', { id: c.id, x: c.x, y: c.y });
        if (!bld.has(c.home.i)) V('homeless', { id: c.id }); }
      for (const b of bld.values()){
        if (!doors.has(b.doorCell)) V('doorNotInSet', { b: b.i, type: b.type });
        if (occ.get(b.i) !== b) V('occMissing', { b: b.i });
        for (const j of eOf(b.i)) if (j !== b.doorCell) V('bldEdgeNotDoor', { b: b.i, type: b.type, j, door: b.doorCell });
        if (b.type === 'shop'){
          const res = cars.filter(c => c.target === b && !c.back && (c.phase === 'go' || c.phase === 'park')).length;
          if (res !== b.reserved) V('reservedMismatch', { b: b.i, size: b.size, reserved: b.reserved, actual: res, pins: b.pins });
          if (b.reserved > b.pins) V('reservedOverPins', { b: b.i, reserved: b.reserved, pins: b.pins });
          if (b.pins < 0 || b.pins > capOf(b)) V('pinsRange', { b: b.i, pins: b.pins });
          b.slots.forEach((c, k) => { if (c && (c.slotShop !== b || c.slot !== k || !['park', 'wait', 'unpark', 'leave'].includes(c.phase))) V('slotStale', { b: b.i, k, ph: c.phase, cs: c.slot }); });
          for (const x of b.cells) if (occ.get(x) !== b) V('shopCellLost', { b: b.i, x });
          if (roads.has(b.doorCell) && !hasEdge(b.i, b.doorCell)) V('shopDoorNotLinked', { b: b.i }); }
        else { const h = b; if (h.cars.length !== 2) V('houseCars', { b: h.i, n: h.cars.length }); if (roads.has(h.doorCell) && [...eOf(h.doorCell)].some(j => !dying.has(ekey(h.doorCell, j))) && !hasEdge(h.i, h.doorCell)) V('houseDoorNotLinked', { b: h.i, door: h.door }); } }
      for (const d of doors) if (![...bld.values()].some(b => b.doorCell === d)) V('doorOrphan', { d });
      for (const [a, set] of E){ for (const j of set) if (!eOf(j).has(a)) V('edgeAsym', { a, j }); if (bld.has(a)) continue; if (occ.has(a)) V('edgeOnShopCell', { a }); if (water.has(a) && set.size > 2) V('bridgeFork', { a, n: set.size }); }
      for (const [x, b] of occ) if (!bld.has(b.i)) V('occGhost', { x });
      for (const i of rings) if (!roads.has(i)) V('ringOffRoad', { i });
      for (const i of lights.keys()) if (!roads.has(i)) V('lightOffRoad', { i });
      for (const h of hws) for (const e of [h.a, h.b]) if (!roads.has(e)) V('hwEndOffRoad', { e });
      if (budget < 0 || bridgesN < 0 || ringN < 0 || hwN < 0 || lightN < 0) V('negStock', { budget, bridgesN, ringN, hwN, lightN });
      if (cars.length !== [...bld.values()].filter(b => b.type === 'house').length * 2) V('carCount', { cars: cars.length });
    }
    if (Math.floor(time / dt) % 20 === 0){ st.lotStuck = st.lotStuck || {}; for (const c of cars) if ((c.phase === 'park' || c.phase === 'unpark' || c.phase === 'leave') && (c.stuck || 0) > 15){ const k = c.slotShop ? c.slotShop.size + ':' + c.phase : '?'; st.lotStuck[k] = (st.lotStuck[k] || 0) + 1; } }
    if (st.watch && st.watch.n < 60){ const w = st.watch, o = w.car; w.n++; w.log.push([o.phase, o.si, o.segs ? o.segs.length : 0, o.s && o.s.toFixed(1), o.v.toFixed(1), (o.stuck||0).toFixed(1), o.x.toFixed(0), o.y.toFixed(0), o.back, o.ghost, o.segs ? o.segs[o.si].kind : '', o.segs ? o.segs[o.si].len.toFixed(1) : '', cars.includes(o), time.toFixed(2), o.id, cars.filter(z=>z.id===o.id).length, o.__A, o.__B, o.__vt, o.__blocked].join(' ')); }
    if (cfg.phantom && Math.floor(time / dt) % 20 === 0){ st.ph = st.ph || [];
      for (const c of cars){ if (c.phase !== 'go' || c.stuck < 20) continue; if (st.ph.length > 30 || st.ph.some(e => e.id === c.id)) continue;
        const sg = c.segs[c.si], nx = c.segs[c.si + 1], gp = gapAhead(c, sg);
        let why = 'phantom', info = {};
        if (gp < MIN_GAP + 3){ let o = null, bd = 1e9; for (const q of cars) if (q !== c && q.phase === 'go'){ const d = Math.hypot(q.x - c.x, q.y - c.y); if (d < bd){ bd = d; o = q; } } why = 'gap'; const all = cars; let bl = null; for (const q of all){ if (q === c) continue; cars = [c, q]; if (gapAhead(c, sg) < MIN_GAP + 3){ bl = q; break; } } cars = all;
          if (bl && bl.stuck > 15) continue; if (bl && !st.watch){ st.watch = { car: bl, n: 0, log: [] }; }
          info = { bl: bl && bl.id, blPh: bl && bl.phase, blV: bl && bl.v.toFixed(1), blStuck: bl && (bl.stuck||0).toFixed(0), blD: bl && Math.hypot(bl.x - c.x, bl.y - c.y).toFixed(1), blCell: bl && bl.phase === 'go' ? bl.segs[bl.si].cell : -1, blWaitG: bl && bl.waitG, myAng: (c.ang*57.3).toFixed(0), blAng: bl && (bl.ang*57.3).toFixed(0), blLock: bl && bl.lock, myLock: c.lock, blGap: bl && bl.phase === 'go' ? bl.gap : null }; }
        else if (nx && nx.cell >= 0 && nx.cell !== sg.cell && lotFull(c, c.si + 1)){ why = 'lot'; const T = c.target; info = { lotCars: cars.filter(o => o.slotShop === T).map(o => o.phase + (o.phase === 'wait' ? (bfsNodes(T.i, o.home) ? ':path' : ':NOPATH') : '')) }; }
        else if (nx && nx.cell >= 0 && nx.cell !== sg.cell && lockFull(nx.cell, c)){ const g = jGroup.get(nx.cell); why = lightStops(nx.cell, c) ? 'light' : 'lock';
          const S = locks.get(g); info = { g, cap: jCap.get(g), holders: S ? [...S].filter(o => o.lock === g).map(o => ({ id: o.id, ph: o.phase, cell: o.phase === 'go' ? o.segs[o.si].cell : -1, inG: o.phase === 'go' && jGroup.get(o.segs[o.si].cell) === g, stuck: (o.stuck || 0).toFixed(0) })) : [], lt: lights.get(nx.cell) ? JSON.stringify(lights.get(nx.cell)) : null }; }
        else if (c.stuck < 40) continue;
        if (why === 'phantom'){ const all = cars, nextQ = z => { let k = z.si, r = z.s + 1; while (r > z.segs[k].len && k + 1 < z.segs.length){ r -= z.segs[k].len; k++; } return samp(z.segs[k], Math.min(1, r / z.segs[k].len)); };
          let off = null; const q = nextQ(c); for (const o of all){ if (o === c) continue; cars = [c, o]; if (wouldHit(c, q[0], q[1], q[2])){ off = o; break; } } 
          let mutual = false; if (off && off.phase === 'go'){ const q2 = nextQ(off); cars = [off, c]; mutual = !!wouldHit(off, q2[0], q2[1], q2[2]); }
          cars = all; info = { off: off && off.id, offPh: off && off.phase, offStuck: off && (off.stuck||0).toFixed(0), mutual, dang: off ? (((off.ang - c.ang) * 57.3 % 360 + 540) % 360 - 180).toFixed(0) : null }; }
        if (cfg.stopAt && why === 'phantom'){ st.stop = { x: c.x, y: c.y, id: c.id }; }
        st.ph.push({ t: Math.round(time), id: c.id, why, kind: sg.kind, cell: sg.cell, next: nx && nx.cell, gap: gp.toFixed(0), stuck: c.stuck.toFixed(0), lockMine: c.lock, wh: (() => { let k = c.si, r = c.s + 1; while (r > c.segs[k].len && k + 1 < c.segs.length){ r -= c.segs[k].len; k++; } const q = samp(c.segs[k], Math.min(1, r / c.segs[k].len)); return !!wouldHit(c, q[0], q[1], q[2]); })(), ...info }); } }
    if (cfg.diag && Math.floor(time / dt) % 20 === 0){ st.why = st.why || {gap:0, cnt:0, exit:0, other:0, gapToStuck:0};
      for (const c of cars){ if (c.phase !== 'go' || c.stuck < 3) continue; const sg = c.segs[c.si], nx = c.segs[c.si+1];
        const gp = gapAhead(c, sg);
        if (gp < MIN_GAP + 3){ st.why.gap++; let o = null; // is the car ahead stuck too?
          for (const q of cars) if (q !== c && q.phase === 'go' && Math.hypot(q.x - c.x, q.y - c.y) < MIN_GAP + 4 && q.stuck > 3) o = q; if (o) st.why.gapToStuck++; }
        else if (nx && nx.cell >= 0 && jGroup.has(nx.cell) && c.lock !== jGroup.get(nx.cell)){ const g = jGroup.get(nx.cell), S = locks.get(g); let n = 0; if (S) for (const o of S) if (o !== c && o.phase === 'go' && o.lock === g) n++;
          if (n >= jCap.get(g)){ st.why.cnt++; for (const o of S) if (o !== c && o.lock === g){ const k = o.stuck < 1 ? 'hMoving' : (gapAhead(o, o.segs[o.si]) < MIN_GAP + 3 ? 'hGap' : 'hLock'); st.why[k] = (st.why[k] || 0) + 1;
            if (k === 'hGap'){ let q = null, bd = 1e9; for (const z of cars) if (z !== o && z.phase === 'go'){ const d = Math.hypot(z.x - o.x, z.y - o.y); if (d < bd){ bd = d; q = z; } }
              const kk = q && q.lock === g ? 'hGapInside' : 'hGapOutside'; st.why[kk] = (st.why[kk] || 0) + 1; } } } else if (exitBlocked(c, g)) st.why.exit++; else st.why.other++; }
        else st.why.other++; } }
    if (cfg.overlap && Math.floor(time / dt) % 4 === 0){ st.overlap = st.overlap || {n:0, kinds:{}};
      const vis = cars.filter(c => c.phase !== 'home' && !(c.phase === 'go' && false));
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++){ const a = vis[i], q = vis[j];
        const la = a.phase === 'go' ? (a.segs[a.si].kind === 'hw' ? 'hw' : 'g') : 'lot', lq = q.phase === 'go' ? (q.segs[q.si].kind === 'hw' ? 'hw' : 'g') : 'lot';
        if ((la === 'hw') !== (lq === 'hw')) continue; if (la === 'hw' && lq === 'hw' && carHw(a) !== carHw(q) && upHigh(a) && upHigh(q)) continue;
        // oriented-box overlap test, car body CAR_L x CAR_W shrunk a hair
        const ov = (A, B) => { const ax = [Math.cos(A.da), Math.sin(A.da)], ay = [-ax[1], ax[0]], bx = [Math.cos(B.da), Math.sin(B.da)], by = [-bx[1], bx[0]], d = [B.x - A.x, B.y - A.y];
          for (const n of [ax, ay, bx, by]){ const ra = (CAR_L/2*0.95) * Math.abs(ax[0]*n[0]+ax[1]*n[1]) + (CAR_W/2*0.95) * Math.abs(ay[0]*n[0]+ay[1]*n[1]);
            const rb = (CAR_L/2*0.95) * Math.abs(bx[0]*n[0]+bx[1]*n[1]) + (CAR_W/2*0.95) * Math.abs(by[0]*n[0]+by[1]*n[1]);
            if (Math.abs(d[0]*n[0]+d[1]*n[1]) > ra + rb) return false; } return true; };
        if (Math.abs(a.x - q.x) < CAR_L && Math.abs(a.y - q.y) < CAR_L && ov(a, q)){ st.overlap.n++;
          const k = (a.phase === 'go' ? (jGroup.has(a.segs[a.si].cell) ? 'cross' : la) : a.phase) + '/' + (q.phase === 'go' ? (jGroup.has(q.segs[q.si].cell) ? 'cross' : lq) : q.phase);
          st.overlap.kinds[k] = (st.overlap.kinds[k] || 0) + 1;
          if ((st.overlap.ex = st.overlap.ex || []).length < 400) st.overlap.ex.push({ t: Math.round(time), d: Math.hypot(a.x-q.x,a.y-q.y).toFixed(1), dang: (((a.da - q.da) * 180 / Math.PI) % 360).toFixed(0), angA: (a.ang*180/Math.PI).toFixed(0), daA: (a.da*180/Math.PI).toFixed(0), va: a.v.toFixed(0), vq: q.v.toFixed(0), kA: a.segs[a.si].kind, kQ: q.segs[q.si].kind, cA: a.segs[a.si].cell, cQ: q.segs[q.si].cell, siA: a.si, siQ: q.si, backA: a.back, backQ: q.back, homeSame: a.home === q.home, k, ringA: rings.has(a.segs[a.si].cell), ringQ: rings.has(q.segs[q.si].cell), kindsA: a.segs.map(g=>g.kind[0]).join(''), kindsQ: q.segs.map(g=>g.kind[0]).join(''), gA: gapAhead(a, a.segs[a.si]).toFixed(0), gQ: gapAhead(q, q.segs[q.si]).toFixed(0), sA: a.s.toFixed(1), lenA: a.segs[a.si].len.toFixed(1), sQ: q.s.toFixed(1), lenQ: q.segs[q.si].len.toFixed(1), stA: a.stuck.toFixed(0), stQ: q.stuck.toFixed(0), pA: a.passCar ? a.passCar.id : -1, pQ: q.passCar ? q.passCar.id : -1, idA: a.id, idQ: q.id, hA: a.holdBy, hQ: q.holdBy, lkA: a.lock, lkQ: q.lock, lat: Math.abs(-(q.x-a.x)*Math.sin(a.ang)+(q.y-a.y)*Math.cos(a.ang)).toFixed(1), hwA: !!carHw(a), hwQ: !!carHw(q) }); } } }
    let stopped = 0; for (const c of cars) if (c.phase === 'go' && c.v < 1){ stopped++; if (c.ghost > 1.45) st.ghosts++; }
    st.maxStopped = Math.max(st.maxStopped, stopped);
    for (const b of bld.values()) if (b.type === 'shop'){ if (b.pins >= 5 && st.firstPin5 === null) st.firstPin5 = time; if (b.pins >= 8 && st.firstPin8 === null) st.firstPin8 = time; }
  }
  const houses = [...bld.values()].filter(b => b.type === 'house'), shops = [...bld.values()].filter(b => b.type === 'shop');
  let cause = null;
  if (over){ const s = shops.find(b => b.overT >= 18);
    const mine = houses.filter(h => h.color === s.color);
    cause = { color: s.color, housesOfColor: mine.length, reachable: mine.filter(h => reach(h, s)).length, shopsOfColor: shops.filter(x => x.color === s.color).length,
      carsGoing: cars.filter(c => c.color === s.color && c.phase === 'go' && !c.back).length, carsStoppedAll: cars.filter(c => c.phase === 'go' && c.v < 1).length, age: Math.round(s.t), slots: s.slots.map(c => c ? c.phase + Math.round(c.v) : '-').join(','), active: s.active, lotCars: cars.filter(c => c.slotShop === s).map(c => c.phase).join(','), atDoor: cars.filter(c => c.phase === 'go' && c.target === s && !c.back && c.v < 1).length, frozen: cars.filter(c => c.phase === 'go' && c.stuck > 30).length, frozenLot: cars.filter(c => c.slotShop && c.stuck > 30).length }; }
  return { seed, t: Math.round(time), over, trips, houses: houses.length, shops: shops.length, colors: colorsInPlay, roads: roads.size, budget, bridgesN, ringN,
    stop: st.stop, tunnels: [...tunnelOf.values()].filter((v, i, a) => a.indexOf(v) === i).length, tunnelShort: st.tunnelShort || 0, hwsPlaced: st.hws || 0, bent: st.bent || 0, rebent: st.rebent || 0, ringsN: st.ringsPlaced, lightsN: st.lights || 0, err: st.err, inv: st.inv, saveDiff: st.saveDiff, lotStuck: st.lotStuck, shopTypes: [...bld.values()].filter(b => b.type === 'shop').map(b => b.size).join(','), shopTrips: (() => { const o = {}; for (const b of bld.values()) if (b.type === 'shop'){ o[b.size] = (o[b.size] || 0) + (b.done || 0); } return o; })(), watch: st.watch && st.watch.log, ph: st.ph, turns: st.turns, erases: st.erases, pin5: st.firstPin5 && Math.round(st.firstPin5), pin8: st.firstPin8 && Math.round(st.firstPin8), maxStopped: st.maxStopped, roadShort: st.roadShort, bridgeShort: st.bridgeShort,
    why: st.why, overlap: st.overlap, rings: st.ringsPlaced, ghosts: st.ghosts, picks: st.picks, cause };
};
