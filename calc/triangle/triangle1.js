(() => {
  // ---------- DOM helpers ----------
  const $ = (id) => document.getElementById(id);

  const inputs = ['a','b','c','A','B','C'].map($);
  const statusEl = $('status');

  // ---------- math helpers ----------
  const degToRad = (d) => d * Math.PI / 180;
  const radToDeg = (r) => r * 180 / Math.PI;

  const isPos = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

  function numOrNull(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function lawOfCosSide(a, b, Cdeg) {
    const C = degToRad(Cdeg);
    return Math.sqrt(Math.max(0, a*a + b*b - 2*a*b*Math.cos(C)));
  }

  function lawOfCosAngle(opposite, adj1, adj2) {
    const cosA = (adj1*adj1 + adj2*adj2 - opposite*opposite) / (2*adj1*adj2);
    return radToDeg(Math.acos(clamp(cosA, -1, 1)));
  }

  function lawOfSinesAngle(a, Adeg, b) {
    const A = degToRad(Adeg);
    const s = b * Math.sin(A) / a;
    if (s < -1 - 1e-12 || s > 1 + 1e-12) return null;
    return radToDeg(Math.asin(clamp(s, -1, 1)));
  }

  function lawOfSinesSide(a, Adeg, Bdeg) {
    const A = degToRad(Adeg), B = degToRad(Bdeg);
    return a * Math.sin(B) / Math.sin(A);
  }

  function fmt(n) { return (Math.round(n * 10000) / 10000).toString(); }
  function fmtDeg(n) { return `${fmt(n)}°`; }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.classList.remove('ok', 'err');
    if (kind) statusEl.classList.add(kind);
  }

  // ---------- solver ----------
  function solveTriangle({ a, b, c, A, B, C }) {
    const eps = 1e-9;
    let note = "";

    [A,B,C].forEach((ang) => {
      if (ang != null && !(ang > 0 && ang < 180)) throw new Error("Angles must be between 0 and 180 degrees.");
    });

    const knownCount = [a,b,c,A,B,C].filter(v => v != null).length;
    if (knownCount < 3) throw new Error("Enter at least 3 values.");
    if (a == null && b == null && c == null) throw new Error("At least one side is required (otherwise scale is unknown).");

    function fillThirdAngle() {
      const knownAngles = [A,B,C].filter(v => v != null).length;
      if (knownAngles === 2) {
        const sum = (A||0) + (B||0) + (C||0);
        const missing = 180 - sum;
        if (missing <= 0) throw new Error("Angle sum must be < 180° for two known angles.");
        if (A == null) A = missing;
        else if (B == null) B = missing;
        else C = missing;
      }
    }

    for (let iter = 0; iter < 30; iter++) {
      const before = JSON.stringify({ a,b,c,A,B,C });

      fillThirdAngle();

      // SSS -> angles
      if (isPos(a) && isPos(b) && isPos(c) && (A==null || B==null || C==null)) {
        if (a + b <= c + eps || a + c <= b + eps || b + c <= a + eps) {
          throw new Error("Side lengths violate the triangle inequality.");
        }
        A = lawOfCosAngle(a, b, c);
        B = lawOfCosAngle(b, a, c);
        C = 180 - A - B;
      }

      // SAS -> missing side
      if (isPos(a) && isPos(b) && C != null && c == null) c = lawOfCosSide(a, b, C);
      if (isPos(b) && isPos(c) && A != null && a == null) a = lawOfCosSide(b, c, A);
      if (isPos(a) && isPos(c) && B != null && b == null) b = lawOfCosSide(a, c, B);

      // if all 3 sides -> missing angles
      if (isPos(a) && isPos(b) && isPos(c)) {
        if (A == null) A = lawOfCosAngle(a, b, c);
        if (B == null) B = lawOfCosAngle(b, a, c);
        if (C == null) C = 180 - A - B;
      }

      // ASA/AAS -> missing sides
      if (isPos(a) && A != null && B != null && b == null) b = lawOfSinesSide(a, A, B);
      if (isPos(a) && A != null && C != null && c == null) c = lawOfSinesSide(a, A, C);
      if (isPos(b) && B != null && A != null && a == null) a = lawOfSinesSide(b, B, A);
      if (isPos(b) && B != null && C != null && c == null) c = lawOfSinesSide(b, B, C);
      if (isPos(c) && C != null && A != null && a == null) a = lawOfSinesSide(c, C, A);
      if (isPos(c) && C != null && B != null && b == null) b = lawOfSinesSide(c, C, B);

      // SSA (ambiguous)
      function trySSA() {
        const attempts = [
          { s1:a, A1:A, s2:b, want:'B' },
          { s1:a, A1:A, s2:c, want:'C' },
          { s1:b, A1:B, s2:a, want:'A' },
          { s1:b, A1:B, s2:c, want:'C' },
          { s1:c, A1:C, s2:a, want:'A' },
          { s1:c, A1:C, s2:b, want:'B' },
        ];
        for (const t of attempts) {
          const { s1, A1, s2, want } = t;
          if (!isPos(s1) || A1 == null || !isPos(s2)) continue;

          if (want === 'A' && A != null) continue;
          if (want === 'B' && B != null) continue;
          if (want === 'C' && C != null) continue;

          const ang = lawOfSinesAngle(s1, A1, s2);
          if (ang == null) continue;

          const alt = 180 - ang;
          const candidates = [ang, alt].filter(x => x > 0 && x < 180);

          let chosen = candidates[0];
          if (candidates.length === 2) {
            note = "SSA ambiguous: two possible triangles exist; chosen a valid one (usually the acute solution).";
          }

          if (want === 'A') A = chosen;
          if (want === 'B') B = chosen;
          if (want === 'C') C = chosen;

          fillThirdAngle();
          break;
        }
      }
      trySSA();

      // all angles + one side -> remaining sides
      fillThirdAngle();
      if (A != null && B != null && C != null) {
        if (isPos(a)) {
          if (!isPos(b)) b = lawOfSinesSide(a, A, B);
          if (!isPos(c)) c = lawOfSinesSide(a, A, C);
        } else if (isPos(b)) {
          if (!isPos(a)) a = lawOfSinesSide(b, B, A);
          if (!isPos(c)) c = lawOfSinesSide(b, B, C);
        } else if (isPos(c)) {
          if (!isPos(a)) a = lawOfSinesSide(c, C, A);
          if (!isPos(b)) b = lawOfSinesSide(c, C, B);
        }
      }

      const after = JSON.stringify({ a,b,c,A,B,C });
      if (before === after) break;
    }

    if (!isPos(a) || !isPos(b) || !isPos(c) || A == null || B == null || C == null) {
      throw new Error("Not enough consistent information to solve. Try SSS, SAS, or ASA/AAS.");
    }

    if (a + b <= c + 1e-9 || a + c <= b + 1e-9 || b + c <= a + 1e-9) {
      throw new Error("Computed sides violate the triangle inequality (inputs likely inconsistent).");
    }

    const sum = A + B + C;
    if (Math.abs(sum - 180) > 1e-3) throw new Error("Angles do not sum to 180°. Inputs may be inconsistent.");

    return { a,b,c,A,B,C,note };
  }

  // ---------- visualization ----------
  function drawTriangle(sol) {
    const svgMsg = $('svgMsg');
    svgMsg.textContent = sol.note || "";

    // Vertex A at left base, B at right base, C at top.
    // AB = c, BC = a, AC = b.
    const a = sol.a, b = sol.b, c = sol.c;

    // A=(0,0), B=(c,0), C=(x,y)
    const x = (b*b + c*c - a*a) / (2*c);
    const y = Math.sqrt(Math.max(0, b*b - x*x));

    const pad = 70, W = 900, H = 520;
    const minX = Math.min(0, c, x), maxX = Math.max(0, c, x);
    const minY = 0, maxY = Math.max(0, y);

    const triW = (maxX - minX) || 1;
    const triH = (maxY - minY) || 1;
    const scale = Math.min((W - 2*pad)/triW, (H - 2*pad)/triH);

    const tx = (px) => pad + (px - minX) * scale;
    const ty = (py) => (H - pad) - (py - minY) * scale;

    const Ax = tx(0),  Ay = ty(0);
    const Bx = tx(c),  By = ty(0);
    const Cx = tx(x),  Cy = ty(y);

    $('tri').setAttribute('d', `M ${Ax} ${Ay} L ${Bx} ${By} L ${Cx} ${Cy} Z`);

    $('pA').setAttribute('cx', Ax); $('pA').setAttribute('cy', Ay);
    $('pB').setAttribute('cx', Bx); $('pB').setAttribute('cy', By);
    $('pC').setAttribute('cx', Cx); $('pC').setAttribute('cy', Cy);

    $('labelA').textContent = "A";
    $('labelB').textContent = "B";
    $('labelC').textContent = "C";
    $('labelA').setAttribute('x', Ax - 18); $('labelA').setAttribute('y', Ay + 20);
    $('labelB').setAttribute('x', Bx + 10); $('labelB').setAttribute('y', By + 20);
    $('labelC').setAttribute('x', Cx - 6);  $('labelC').setAttribute('y', Cy - 12);

    const midBC = {x:(Bx+Cx)/2, y:(By+Cy)/2};
    const midAC = {x:(Ax+Cx)/2, y:(Ay+Cy)/2};
    const midAB = {x:(Ax+Bx)/2, y:(Ay+By)/2};

    $('labela').textContent = `a=${fmt(sol.a)}`;
    $('labelb').textContent = `b=${fmt(sol.b)}`;
    $('labelc').textContent = `c=${fmt(sol.c)}`;

    $('labela').setAttribute('x', midBC.x + 8);  $('labela').setAttribute('y', midBC.y - 8);
    $('labelb').setAttribute('x', midAC.x - 58); $('labelb').setAttribute('y', midAC.y - 8);
    $('labelc').setAttribute('x', midAB.x - 25); $('labelc').setAttribute('y', midAB.y + 22);

    function angleArc(P, Q, R, r, idPath, idText, angDeg) {
      const v1 = {x: P.x - Q.x, y: P.y - Q.y};
      const v2 = {x: R.x - Q.x, y: R.y - Q.y};
      const a1 = Math.atan2(v1.y, v1.x);
      const a2 = Math.atan2(v2.y, v2.x);

      let start = a1, end = a2;
      while (end - start > Math.PI) end -= 2*Math.PI;
      while (end - start < -Math.PI) end += 2*Math.PI;

      const sweep = (end > start) ? 1 : 0;
      const sx = Q.x + r*Math.cos(start);
      const sy = Q.y + r*Math.sin(start);
      const ex = Q.x + r*Math.cos(end);
      const ey = Q.y + r*Math.sin(end);

      $(idPath).setAttribute('d', `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`);

      const mid = (start + end) / 2;
      const lx = Q.x + (r + 16)*Math.cos(mid);
      const ly = Q.y + (r + 16)*Math.sin(mid);
      $(idText).textContent = fmtDeg(angDeg);
      $(idText).setAttribute('x', lx - 14);
      $(idText).setAttribute('y', ly + 5);
    }

    const PA = {x:Ax,y:Ay}, PB={x:Bx,y:By}, PC={x:Cx,y:Cy};
    angleArc(PB, PA, PC, 28, 'arcA', 'angleA', sol.A);
    angleArc(PC, PB, PA, 28, 'arcB', 'angleB', sol.B);
    angleArc(PA, PC, PB, 28, 'arcC', 'angleC', sol.C);
  }

  function clearVizAndOutputs() {
    $('results').style.display = 'none';
    $('tri').setAttribute('d', '');
    ['arcA','arcB','arcC'].forEach(id => $(id).setAttribute('d', ''));
    ['angleA','angleB','angleC','labelA','labelB','labelC','labela','labelb','labelc'].forEach(id => $(id).textContent = "");
    $('svgMsg').textContent = "Enter values…";
  }

  function writeOutputs(sol) {
    $('results').style.display = '';
    $('outA').textContent = fmt(sol.a);
    $('outB').textContent = fmt(sol.b);
    $('outC').textContent = fmt(sol.c);
    $('outAngA').textContent = fmtDeg(sol.A);
    $('outAngB').textContent = fmtDeg(sol.B);
    $('outAngC').textContent = fmtDeg(sol.C);
  }

  function readInputs() {
    return {
      a: numOrNull($('a').value),
      b: numOrNull($('b').value),
      c: numOrNull($('c').value),
      A: numOrNull($('A').value),
      B: numOrNull($('B').value),
      C: numOrNull($('C').value),
    };
  }

  // Debounced real-time updates (so holding a key doesn't spam compute)
  function debounce(fn, ms) {
    let t = null;
    return (...args) => {
      window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), ms);
    };
  }

  const update = debounce(() => {
    try {
      const input = readInputs();
      // if nothing entered, reset UI gently
      const any = Object.values(input).some(v => v != null);
      if (!any) {
        setStatus("Enter at least 3 values that define a triangle (with at least one side).");
        clearVizAndOutputs();
        return;
      }

      const sol = solveTriangle(input);
      writeOutputs(sol);
      drawTriangle(sol);
      setStatus(sol.note ? ("Solved.\n" + sol.note) : "Solved.", "ok");
    } catch (e) {
      // On partial input, errors are expected—still show them, but keep it usable.
      setStatus(e.message || String(e), "err");
      clearVizAndOutputs();
    }
  }, 120);

  // Wire real-time updates
  inputs.forEach(inp => {
    inp.addEventListener('input', update);
    inp.addEventListener('change', update);
  });

  $('clearBtn').addEventListener('click', () => {
    inputs.forEach(i => i.value = '');
    setStatus("Enter at least 3 values that define a triangle (with at least one side).");
    clearVizAndOutputs();
  });

  $('exampleBtn').addEventListener('click', () => {
    inputs.forEach(i => i.value = '');
    $('a').value = 7;
    $('b').value = 9;
    $('C').value = 40;
    update();
  });

  // Initial
  clearVizAndOutputs();
})();

