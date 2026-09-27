// @ts-nocheck
/* eslint-disable */
// Near-verbatim port of the original app's imperative scroll/WebGL/canvas
// engine (variable names kept short to match the source 1:1 and minimize
// transcription risk across ~50 cross-referenced tuning constants). Typed
// strictly, this file would need ~150 manual annotations on single-letter
// params with zero behavioral benefit — skipped deliberately; the browser
// runs the JS regardless of what tsc infers here.
import type { Reel } from "./reels";
import { FAQ_ITEMS } from "./faq-data";
import { SAMPLES } from "./samples";
import {
  VERT as Ot,
  buildFragmentSource as kt,
  UNIFORM_NAMES as Mt,
  At,
  jt,
} from "./shaders";

var d = (e, t, n) => Math.min(Math.max(e, t), n),
  f = (e) => e * e * (3 - 2 * e),
  p = (e) => e * e * e * (e * (e * 6 - 15) + 10),
  m = (e) => 1 - (1 - e) ** 4,
  h = (e) => 0.5 - Math.sin(Math.asin(1 - 2 * d(e, 0, 1)) / 3),
  g = (e, t) => {
    if (t <= 1.001) return e;
    let n = e ** +t;
    return n / (n + (1 - e) ** t);
  },
  _ = [
    { n: `smooth`, f: (e) => e * e * (3 - 2 * e) },
    { n: `smoother`, f: (e) => e * e * e * (e * (e * 6 - 15) + 10) },
    { n: `out-quart`, f: (e) => 1 - (1 - e) ** 4 },
    { n: `out-expo`, f: (e) => (e >= 1 ? 1 : 1 - 2 ** (-9 * e)) },
    {
      n: `out-back`,
      f: (e) => {
        let t = 1 - e;
        return 1 - t * t * t * (2.7 * t - 1.7);
      },
    },
    {
      n: `in-out`,
      f: (e) => (e < 0.5 ? 4 * e * e * e : 1 - (-2 * e + 2) ** 3 / 2),
    },
    { n: `linear`, f: (e) => e },
  ],
  v = {
    plan: 0,
    p: 0,
    g: 0,
    off: 0,
    lockEnd: 0,
    push: 0,
    burn: 0,
    coda: 0,
    end: 0,
    ink: 0,
    pan: 0,
  };
window.__READOUT = v;
var y = { x: 0 },
  b = { x: 0, y: 0, tx: 0, ty: 0 };
function x() {
  addEventListener(
    `pointermove`,
    (e) => {
      ((b.tx = (e.clientX / innerWidth - 0.5) * 2),
        (b.ty = (e.clientY / innerHeight - 0.5) * 2));
    },
    { passive: !0 },
  );
}
var ee = { lit: !1 },
  S = { t0: -1 },
  C = matchMedia(`(prefers-reduced-motion: reduce)`).matches,
  te = matchMedia(`(pointer: coarse)`).matches,
  w = [
    {
      id: `signal`,
      src: `/films/signal.mp4`,
      poster: `/films/signal-poster.jpg`,
      origin: [0.707, 0.926],
      pos: [0.72, 0.72, 1],
      bridge: `v28`,
    },
    {
      id: `colossus`,
      src: `/films/colossus.mp4`,
      poster: `/films/colossus-poster.jpg`,
      origin: [0.732, 0.54],
      pos: [0.72, 0.6, 1],
      bridge: `v51`,
    },
    {
      id: `reveal`,
      src: `/films/reveal.mp4`,
      poster: `/films/reveal-poster.jpg`,
      origin: [0.84, 0.63],
      pos: [0.72, 0.62, 1],
      bridge: `v61`,
    },
  ],
  T = 1200 / 5350,
  E = 600 / 5350,
  ne = 300 / 5350,
  re = 900 / 5350,
  ie = 300 / 5350,
  ae = 600 / 5350,
  oe = 500 / 5350,
  se = 250 / 5350,
  ce = 700 / 5350,
  D = 0.04,
  O = 0.76,
  k = {
    at: 0.775,
    len: 0.14,
    x: 0.48,
    y: 0.57,
    ax: 2.35,
    ay: 1.1,
    noise: 0.295,
    grain: 0.125,
    dither: 0.052,
    hash: 0.15,
    char: 0,
    charW: 0.31,
    glowW: 0.0104,
    glowH: 5,
    split: 0.4,
    e0: -0.16,
    e1: 1.3,
    fx: 1,
    fxAt: 0,
    fxLen: 0.75,
    zoom: 0,
    zoomPan: 0.34,
    zoomAt: 0.25,
    shape: 1,
    dx: 20,
    dy: 75,
    seam: 0.85,
    seamW: 0.2,
    seamH: 0.62,
    seamSoft: 0.055,
    reelZ: 0.6,
    zAt: 0.8,
    zLin: 0.38,
  },
  A = {
    over: 0.1,
    len: 0.105,
    w: 6.45,
    h: 15.7,
    hold: 0.45,
    fade: 0.55,
    ret: 0.26,
    retLen: 0.82,
    e: 0,
    auto: 0,
    lead: -0.04,
    ease: 2.25,
  },
  le = { x: 0.48, y: 0.57 },
  ue = {
    driftX: 0.03,
    driftY: -0.018,
    mblur: 0.012,
    edgeBl: 0.01,
    edgeAt: 0.55,
  },
  j = { zoom: 2, at: 0.59, lin: 0.96, spin: 0.13, part: 0.05, lag: 0.58 },
  M = () => {
    let e = (A.w / 100) * k.ax,
      t = (A.h / 100) * k.ay;
    return d(
      ((k.shape === 2
        ? e + t
        : k.shape === 0
          ? Math.hypot(e, t)
          : k.shape === 3
            ? (e ** 4 + t ** 4) ** 0.25
            : Math.max(e, t)) -
        k.e0) /
        Math.max(1e-4, k.e1 - k.e0),
      0,
      1,
    );
  },
  N = {
    speed: 2.6,
    drift: 1.65,
    jiggle: 2.25,
    scale: 2.6,
    depth: 0.085,
    breathe: 2.5,
    rake: 0.35,
    cycle: 1.85,
    pulp: 0.115,
    fibre: 0.055,
    tooth: 0.038,
    fleck: 0.55,
    lag: 0.055,
    lagD: 0.16,
    smear: 0.3,
    keyX: 0.255,
    keyY: 0.5,
    keyS: 0.46,
    zoom: 1,
    panX: 0,
    panY: 0,
    r: 226,
    g: 208,
    b: 177,
  },
  de = {
    noise: 0.06,
    grain: 0.17,
    dither: 0.01,
    hash: 0.1,
    charW: 0.055,
    charBack: 1.5,
    char: 0.62,
    glowW: 0.01,
  },
  fe = 420 / 5350,
  pe = 1.26,
  me = [0.4, 0.3],
  he = 0.425,
  ge = 0.72,
  _e = (420 * 1) / 900,
  ve = 0.45,
  ye = 0.12,
  be = (e) =>
    e < 0.45 ? (e / ve) * ye : ye + ((e - ve) / (1 - ve)) * (1 - ye),
  xe = 0.1,
  Se = 0.42,
  P = 1.62,
  Ce = 0.26,
  we = 0.24,
  F = 0.62,
  Te = FAQ_ITEMS.map(({ q, a }) => [q, q, a]),
  Ee = [
    [0.26, 0.534],
    [0.709, 0.354],
    [0.259, 0.907],
    [0.718, 0.815],
    [0.27, 0.236],
  ],
  De = [1920, 1080],
  I = {
    at: 0.69,
    span: 0.3,
    stagger: 0.18,
    each: 0.34,
    blur: 9.5,
    fill: 0.1,
    rim: 0.41,
    bev: 2.5,
    bev2: 0.35,
    spec: 0.4,
    sat: 1.1,
    px: -8,
    py: -128,
    scale: 0.95,
    hold: 0.35,
    run: 0.65,
    ease: 0,
    rx: 6,
    ry: 9,
    rz: 1.6,
    rxIn: 9,
    ryIn: 22,
    rzIn: 4,
    persp: 1700,
    ins: 0.475,
    insB: 6,
    insY: 1,
    pop: 64,
    push: 26,
    bgScale: 1,
    bgX: 0,
    bgY: 50,
  },
  Oe = [
    [
      `defective`,
      `Load a defective notice`,
      `button`,
      452,
      148,
      236,
      62,
      `M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.2v.3`,
    ],
    [
      `compliant`,
      `Load a compliant notice`,
      `button`,
      712,
      148,
      236,
      62,
      `M4.5 12.5l4.5 4.5 10.5-10.5`,
    ],
    [
      `notice`,
      `Paste the text of a SNAP notice`,
      `area`,
      452,
      226,
      496,
      226,
      `M6 2.5h8.5l4.5 4.5v14.5h-13zM14 2.5v5h5M9 12h6M9 15.5h6`,
    ],
  ],
  ke = [
    [0.3802, 0.1662, 2],
    [0.6047, 0.1131, 2],
    [0.434, 0.4782, 1],
    [0.3876, 0.3921, 1],
    [0.3392, 0.5292, 1],
    [0.2582, 0.256, 1],
    [0.4235, 0.3413, 1],
    [0.7883, 0.2255, 1],
    [0.5515, 0.2254, 1],
    [0.4043, 0.2556, 1],
    [0.5566, 0.1053, 1],
    [0.6594, 0.2556, 1],
    [0.7957, 0.1049, 1],
    [0.491, 0.3812, 1],
    [0.8971, 0.2551, 1],
    [0.7497, 0.5906, 1],
    [0.5081, 0.5907, 1],
  ],
  Ae = [
    [0.56, 0.36, 0.18, 0.105, -14],
    [0.545, 0.395, 0.245, 0.15, 9],
    [0.59, 0.345, 0.135, 0.195, -32],
  ],
  je = 0.62,
  Me = (() => {
    let e = fe * pe,
      t = [
        [D * T, D * T],
        [(O - D) * T, 0.19149532710280373],
        [(1 - O) * T, (1 - O) * T],
        [E, E],
        [ne, ne],
        [e, e - 0.008],
        [0.12538317757009346, 0.11438317757009346],
        [ae, ae - 0.003],
        [oe, oe - 0.008],
        [se, se],
        [je * ce, je * ce],
      ],
      n = [
        [(0.8 - je) * ce, 0.005],
        [0.2 * ce, 0.012],
      ],
      r = 0.983 / t.reduce((e, t) => e + t[1], 0),
      i = [[0, 0]],
      a = 0,
      o = 0;
    for (let [e, n] of t) ((o += e), (a += n * r), i.push([a, o]));
    for (let [e, t] of n) ((o += e), (a += t), i.push([a, o]));
    return ((i[i.length - 1] = [1, 1]), i);
  })();
function Ne(e, t) {
  if (!t) return e;
  for (let t = 1; t < Me.length; t++)
    if (e <= Me[t][0])
      return (
        Me[t - 1][1] +
        ((e - Me[t - 1][0]) * (Me[t][1] - Me[t - 1][1])) /
          (Me[t][0] - Me[t - 1][0])
      );
  return 1;
}
function Pe(e, t) {
  if (!t) return e;
  for (let t = 1; t < Me.length; t++)
    if (e <= Me[t][1])
      return (
        Me[t - 1][0] +
        ((e - Me[t - 1][1]) * (Me[t][0] - Me[t - 1][0])) /
          (Me[t][1] - Me[t - 1][1])
      );
  return 1;
}
var Fe = {
    mode: 1,
    at: 0.74,
    span: 0.18,
    noise: 74,
    scaleB: 1.018,
    radius: 0.9,
    width: 0.35,
  },
  Ie = [0, 1, 4, 9, 10],
  Le = [0.955, 0.757, 0.714, 0.533, 0.515],
  Re = [
    `For SNAP households`,
    `Claude extraction`,
    `7 CFR 273.13`,
    `Fair hearing`,
  ],
  ze = 23.7,
  Be = 85.6,
  Ve = 1450,
  He = { v28: 100, v51: 85, v61: 90 },
  Ue = { x: 0, from: 0, ramp: 0.12 },
  We = { x: 0, y: 0, z: 1 },
  Ge = { x: 5, y: -440, z: 2.5, at: 0, span: 1 },
  Ke = { x: 0.5, y: 0.735, s: 0.78, join: 0.655 },
  qe = 1.45,
  Je = 0.718,
  Ye = { x: 20, from: 0, span: 1 },
  Xe = { at: 0.12, span: 0.6 },
  Ze = { w: 0.905, x: 0, y: 0 },
  Qe = { k: 3 },
  $e = [0, 0.3, 0.6],
  et = 1328,
  tt = 3515,
  nt = [0, 1180, 2050],
  rt = tt / 34,
  L = { target: scrollY, current: scrollY, velocity: 0, on: !C && !te },
  ot = -1,
  st = (e) => {
    ot = e;
  },
  R = () => document.documentElement.scrollHeight - innerHeight;
function ct() {
  (ut(),
    lt(),
    L.on &&
      (addEventListener(
        `wheel`,
        (e) => {
          if (e.ctrlKey) return;
          e.preventDefault();
          let t = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
          L.target = d(L.target + e.deltaY * t, 0, R());
        },
        { passive: !1 },
      ),
      addEventListener(`keydown`, (e) => {
        let t = e.target;
        if (
          t &&
          (t.isContentEditable ||
            t.tagName === `INPUT` ||
            t.tagName === `TEXTAREA` ||
            t.tagName === `SELECT`)
        )
          return;
        let n = {
          ArrowDown: 90,
          ArrowUp: -90,
          PageDown: innerHeight * 0.9,
          PageUp: -innerHeight * 0.9,
          " ": innerHeight * 0.9,
          Home: -1e7,
          End: 1e7,
        }[e.key];
        n !== void 0 &&
          (e.preventDefault(), (L.target = d(L.target + n, 0, R())));
      }),
      addEventListener(
        `scroll`,
        () => {
          Math.abs(scrollY - ot) > 2 && (L.target = L.current = scrollY);
        },
        { passive: !0 },
      )));
}
function lt() {
  for (let e of document.querySelectorAll(`.ov .cta`))
    e.addEventListener(`click`, (e) => {
      e.preventDefault();
      let t = d(Pe(1 - ce - se * 0.7, innerWidth <= 720) * R(), 0, R());
      (st(t), scrollTo(0, t), (L.target = L.current = t));
    });
}
function ut() {
  let e = document.querySelector(`.ov .menu`),
    t = document.getElementById(`nvm`);
  if (!e || !t) return;
  let n = !1;
  function r(r) {
    ((n = r),
      document.body.classList.toggle(`nav-open`, r),
      t.setAttribute(`aria-hidden`, r ? `false` : `true`),
      e.setAttribute(`aria-expanded`, r ? `true` : `false`),
      e.setAttribute(`aria-label`, r ? `Close` : `Menu`),
      (t.style.pointerEvents = r ? `auto` : `none`),
      (document.documentElement.style.overflow = r ? `hidden` : ``),
      r && (L.target = L.current));
    let i = document.querySelector(`.nvs`),
      a = (e, t, n) => e && e.style.setProperty(t, n, `important`);
    (a(i, `opacity`, r ? `1` : `0`),
      a(t, `opacity`, r ? `1` : `0`),
      a(t, `visibility`, r ? `visible` : `hidden`),
      t.querySelectorAll(`a`).forEach((e, t) => {
        ((e.style.transitionDelay = r
          ? (0.05 + t * 0.07).toFixed(2) + `s`
          : `0s`),
          a(e, `opacity`, r ? `1` : `0`));
      }));
  }
  (r(!1),
    e.addEventListener(`click`, (e) => {
      (e.preventDefault(), r(!n));
    }),
    addEventListener(`keydown`, (e) => {
      e.key === `Escape` && n
        ? r(!1)
        : n &&
          /^(Arrow|Page|Home|End|Space| )/.test(e.key) &&
          e.preventDefault();
    }));
  let i = (e) => {
    n &&
      (e.preventDefault(),
      e.stopPropagation(),
      e.stopImmediatePropagation && e.stopImmediatePropagation(),
      (L.target = L.current));
  };
  (addEventListener(`wheel`, i, { passive: !1, capture: !0 }),
    addEventListener(`touchmove`, i, { passive: !1, capture: !0 }),
    t.addEventListener(`click`, (e) => {
      e.target === t && r(!1);
    }));
  for (let e of t.querySelectorAll(`a`))
    e.addEventListener(`click`, (t) => {
      (t.preventDefault(),
        (L.target = d(parseFloat(e.dataset.at || `0`) * R(), 0, R())),
        L.on || (st(L.target), scrollTo(0, L.target), (L.current = L.target)),
        r(!1));
    });
}
var dt = 8,
  ft = [],
  pt = 0,
  mt = [];
function ht(e) {
  (ft.push(e), gt());
}
function gt() {
  for (let e = 0; pt < dt && e < ft.length;) {
    let t = ft.shift(),
      n = t.hot && t.hot() ? 2 : 1,
      r = 0;
    for (let e = 0; e < n && pt < dt; e++) {
      let e = t();
      if (!e) break;
      (r++,
        pt++,
        e(() => {
          (pt--, gt());
        }));
    }
    (ft.push(t), r ? (e = 0) : e++);
  }
}
var _t = 0.1,
  vt = [];
function yt(e) {
  for (let t = vt.length - 1; t >= 0; t--)
    e >= vt[t].from && e <= vt[t].to && ht(vt.splice(t, 1)[0].feed);
}
function bt(e, t, n) {
  vt.push({ from: Math.max(0, e - _t), to: Math.min(1, t) + _t, feed: n });
}
var xt = 24;
function St({ order: e, count: t, url: n, land: r, want: i }) {
  let a = new Uint8Array(t),
    o = new Uint8Array(t),
    s = 0;
  return () => {
    let c = -1,
      l = i();
    if (l >= 0) {
      scan: for (let e = 0; e <= xt && c < 0; e++)
        for (let n of e ? [l + e, l - e] : [l])
          if (n >= 0 && n < t && !a[n]) {
            c = n;
            break scan;
          }
    }
    for (; c < 0 && s < e.length;) {
      let t = e[s++];
      a[t] || (c = t);
    }
    return c < 0
      ? null
      : ((a[c] = 1),
        (t) => {
          let i = new Image();
          ((i.decoding = `async`),
            (i.onload = () => {
              (r(c, i), t());
            }),
            (i.onerror = i.onabort =
              () => {
                (++o[c] < 3 && ((a[c] = 0), e.push(c)), t());
              }),
            (i.src = n(c)));
        });
  };
}
function Ct(e, t = 0) {
  let n = [],
    r = new Set();
  for (let i = 32; i >= 1; i >>= 1)
    for (let a = 0; a < e; a += i) {
      let e = t + a;
      r.has(e) || (r.add(e), n.push(e));
    }
  return n;
}
function wt(e, t, n = 2, r = 0, i = 1) {
  let a = matchMedia(`(max-width: 820px)`).matches ? `/768` : ``,
    o = { imgs: [], ready: !1, loaded: 0 },
    s = -1,
    c = 0;
  mt.push({ name: e.replace(`/films/`, ``), seq: o, count: t });
  let l = St({
    order: Ct(t),
    count: t,
    url: (t) => `${e}${a}/f_${String(t + 1).padStart(3, `0`)}.webp?r=13`,
    land: (e, t) => {
      ((o.imgs[e] = t), ++o.loaded > n && (o.ready = !0));
    },
    want: () => s,
  });
  return (
    (l.hot = () => c && performance.now() - c < 500),
    bt(r, i, l),
    (o.aim = (e) => {
      ((c = performance.now()), e !== s && ((s = e), Et(o.imgs, e, t)));
    }),
    (o.near = (e) => {
      o.aim(e);
      for (let n = 0; n < t; n++) {
        let t = o.imgs[e - n],
          r = o.imgs[e + n];
        if (t && t.naturalWidth) return t;
        if (r && r.naturalWidth) return r;
      }
      return null;
    }),
    o
  );
}
var Tt = new URLSearchParams(location.search).has(`nowarm`);
function Et(e, t, n) {
  if (!Tt)
    for (let r = 1; r <= 3; r++)
      for (let i of [t + r, t - r]) {
        let t = i >= 0 && i < n && e[i];
        t && t.decode && t.decode().catch(() => {});
      }
}
function Dt(e, t, n = 1) {
  let r = [
      { name: e, count: 121 },
      { name: `renaissance`, count: 362 },
    ],
    i = { N: r.reduce((e, t) => e + t.count, 0), frames: [], loaded: 0 },
    a = -1,
    o = 0;
  mt.push({
    name: `reel`,
    seq: i,
    get count() {
      return i.N;
    },
  });
  let s = (e) => {
    for (let n of r) {
      if (e < n.count)
        return `/films/model/${n.name}/${t}/f_${String(e + 1).padStart(3, `0`)}.webp?r=13`;
      e -= n.count;
    }
    return ``;
  };
  function c() {
    ((i.N = r.reduce((e, t) => e + t.count, 0)), (i.frames = Array(i.N)));
    let e = [],
      t = 0;
    for (let n of r) ((e = e.concat(Ct(n.count, t))), (t += n.count));
    let c = St({
      order: e,
      count: i.N,
      url: s,
      land: (e, t) => {
        let n = () => {
          ((i.frames[e] = t), i.loaded++);
        };
        t.decode ? t.decode().then(n, n) : n();
      },
      want: () => a,
    });
    ((c.hot = () => o && performance.now() - o < 500),
      bt(0.10010000000000001, n, c));
  }
  return (
    Promise.all(
      r.map((e) =>
        fetch(`/films/model/${e.name}/manifest.json?r=13`)
          .then((e) => e.json())
          .then((n) => {
            e.count = n.tiers[t].count;
          })
          .catch(() => {}),
      ),
    ).then(c),
    (i.aim = (e) => {
      ((o = performance.now()), e !== a && ((a = e), Et(i.frames, e, i.N)));
    }),
    (i.frameNear = (e) => {
      i.aim(e);
      for (let t = 0; t < i.N; t++) {
        if (i.frames[e + t]) return i.frames[e + t];
        if (i.frames[e - t]) return i.frames[e - t];
      }
      return null;
    }),
    i
  );
}
function Nt(e) {
  let t = document.querySelector(`.gl`),
    n = t.getContext(`webgl`, { alpha: !1, antialias: !1, depth: !1 }),
    r = !!n.getExtension(`OES_standard_derivatives`),
    i = (e, t) => {
      let r = n.createShader(e);
      return (
        n.shaderSource(r, t),
        n.compileShader(r),
        n.getShaderParameter(r, n.COMPILE_STATUS)
          ? r
          : (console.warn(n.getShaderInfoLog(r)), null)
      );
    },
    a = n.createProgram();
  (n.attachShader(a, i(n.VERTEX_SHADER, Ot)),
    n.attachShader(a, i(n.FRAGMENT_SHADER, kt(r, innerWidth <= 720))),
    n.linkProgram(a),
    n.getProgramParameter(a, n.LINK_STATUS) ||
      console.warn(n.getProgramInfoLog(a)),
    n.useProgram(a));
  let o = n.createBuffer();
  (n.bindBuffer(n.ARRAY_BUFFER, o),
    n.bufferData(
      n.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      n.STATIC_DRAW,
    ));
  let s = n.getAttribLocation(a, `aPos`);
  (n.enableVertexAttribArray(s),
    n.vertexAttribPointer(s, 2, n.FLOAT, !1, 0, 0));
  function c(e) {
    let t = n.createTexture();
    return (
      n.activeTexture(n.TEXTURE0 + e),
      n.bindTexture(n.TEXTURE_2D, t),
      n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, !0),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR),
      n.texImage2D(
        n.TEXTURE_2D,
        0,
        n.RGBA,
        1,
        1,
        0,
        n.RGBA,
        n.UNSIGNED_BYTE,
        new Uint8Array([11, 10, 9, 255]),
      ),
      t
    );
  }
  let l = { A: c(0), B: c(1), C: c(2), E: c(3), G: c(4), P: c(5) },
    u = {};
  for (let e of Mt) u[e] = n.getUniformLocation(a, e);
  (n.uniform1i(n.getUniformLocation(a, `uA`), 0),
    n.uniform1i(n.getUniformLocation(a, `uB`), 1),
    n.uniform1i(n.getUniformLocation(a, `uC`), 2),
    n.uniform1i(n.getUniformLocation(a, `uE`), 3),
    n.uniform1i(n.getUniformLocation(a, `uG`), 4),
    n.uniform1i(n.getUniformLocation(a, `uP`), 5));
  let d = (e, t, r) => {
      (n.activeTexture(n.TEXTURE0 + e), n.bindTexture(n.TEXTURE_2D, t));
      let i = r.videoWidth || r.naturalWidth || r.width,
        a = r.videoHeight || r.naturalHeight || r.height;
      t._w === i && t._h === a
        ? n.texSubImage2D(n.TEXTURE_2D, 0, 0, 0, n.RGBA, n.UNSIGNED_BYTE, r)
        : (n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, r),
          (t._w = i),
          (t._h = a));
    },
    f = new Image();
  return (
    (f.onload = () => {
      (d(2, l.C, f), n.uniform2f(u.uResC, f.naturalWidth, f.naturalHeight));
    }),
    (f.src = `/art/scaffold_expand.jpg`),
    n.uniform1f(u.uDot, 7),
    n.uniform1f(u.uBlk, 11),
    n.uniform1f(u.uScale, 3.2),
    n.uniform1f(u.uAsc, 9),
    n.uniform1f(u.uHeat, 1),
    n.uniform2f(u.uOrigin, e.origin[0], e.origin[1]),
    n.uniform1f(u.uGlow, 0.62),
    { gl: n, canvas: t, tex: l, u, upload: d, plate: f }
  );
}
var Pt = 320,
  Ft = new Path2D(
    `M12 0Q13.1 10.9 24 12Q13.1 13.1 12 24Q10.9 13.1 0 12Q10.9 10.9 12 0Z`,
  ),
  It,
  Lt,
  Rt,
  zt,
  Bt = 0,
  Vt = null,
  Ht = 0,
  Ut,
  Wt,
  Gt,
  Kt,
  qt,
  Jt = () => Ht;
function Yt() {
  ((It = document.querySelector(`.ov .lines`)),
    It &&
      ((Lt = It.getContext(`2d`)),
      (Rt = document.createElement(`canvas`)),
      (zt = Rt.getContext(`2d`, { willReadFrequently: !0 })),
      (Ut = document.querySelector(`.ov .gv:not(.gv--r)`)),
      (Wt = document.querySelector(`.ov .gv--r`)),
      (Gt = document.querySelector(`.ov .gh[data-out="u"]`)),
      (Kt = document.querySelector(`.ov .gh[data-out="d"]`)),
      (qt = [...document.querySelectorAll(`.ov .gx:not(.gx--lock)`)])));
}
var Xt = (e) => 1 - (1 - d(e, 0, 1)) ** 3,
  Zt = [
    [0, 0, 2.6],
    [0.4, 1, 0.78],
    [0.62, 0.15, 1.14],
    [1, 1, 1],
  ];
function Qt(e) {
  for (let t = 1; t < Zt.length; t++)
    if (e <= Zt[t][0]) {
      let [n, r, i] = Zt[t - 1],
        [a, o, s] = Zt[t],
        c = (e - n) / (a - n);
      return { a: r + (o - r) * c, s: i + (s - i) * c };
    }
  return { a: 1, s: 1 };
}
function $t(e, t, n, r, i, a) {
  if (!It) return;
  let o = 1 - d(t / 0.08, 0, 1),
    s = e.readyState >= 2 && e.videoWidth,
    c = a && a.el && a.el.complete && a.el.naturalWidth,
    l = s ? e : c ? a.el : null;
  if (((Ht = l ? o : 0), Ht <= 0.001)) {
    It.style.opacity !== `0` &&
      ((It.style.opacity = `0`), Lt.clearRect(0, 0, It.width, It.height));
    return;
  }
  It.style.opacity = Ht.toFixed(3);
  let u = l.videoWidth || l.naturalWidth,
    f = l.videoHeight || l.naturalHeight,
    p = Math.min(devicePixelRatio || 1, 2),
    m = Math.round(innerWidth * p),
    h = Math.round(innerHeight * p);
  (It.width !== m || It.height !== h) && ((It.width = m), (It.height = h));
  let g = m / innerWidth,
    _ = S.t0 < 0 ? -1 : C ? 10 : (n - S.t0) / 1e3;
  if ((Lt.clearRect(0, 0, m, h), _ < 0)) return;
  let v = document.querySelector(`.ov`).classList.contains(`on-light`),
    y = v ? `rgba(29,28,25,0.165)` : `rgba(255,255,255,0.225)`,
    b = v ? `rgb(29,28,25)` : `#fff`;
  Lt.fillStyle = y;
  let x = (e, t, n) => {
    if (!e) return;
    let r = e.getBoundingClientRect();
    if (!r.width && !r.height) return;
    let i = Xt((_ - t) / 1.15);
    i <= 0 ||
      (n
        ? Lt.fillRect(r.left * g, r.top * g, g, r.height * g * i)
        : Lt.fillRect(r.left * g, r.top * g, r.width * g * i, g));
  };
  if (
    (x(Ut, 0.2, !0),
    x(Wt, 0.3, !0),
    x(Gt, 0.25, !1),
    x(Kt, 0.4, !1),
    (Lt.fillStyle = b),
    qt.forEach((e, t) => {
      let n = e.getBoundingClientRect();
      if (!n.width) return;
      let r = d((_ - (t ? 1.18 : 1.05)) / 0.72, 0, 1);
      if (r <= 0) return;
      let { a: i, s: a } = Qt(r),
        o = n.width * g * a,
        s = (n.left + n.width / 2) * g,
        c = (n.top + n.height / 2) * g;
      ((Lt.globalAlpha = i),
        Lt.setTransform(o / 24, 0, 0, o / 24, s - o / 2, c - o / 2),
        Lt.fill(Ft),
        Lt.setTransform(1, 0, 0, 1, 0, 0),
        (Lt.globalAlpha = 1));
    }),
    n - Bt > 40 || l !== Vt)
  ) {
    ((Bt = n), (Vt = l));
    let e = Pt,
      t = Math.max(1, Math.round((Pt * f) / u));
    (Rt.width !== e || Rt.height !== t) && ((Rt.width = e), (Rt.height = t));
    try {
      zt.drawImage(l, 0, 0, e, t);
      let n = zt.getImageData(0, 0, e, t),
        r = n.data;
      for (let e = 0; e < r.length; e += 4) {
        let t = (r[e + 2] - Math.max(r[e], r[e + 1]) - 8) / 34;
        r[e + 3] = t <= 0 ? 0 : t >= 1 ? 255 : Math.round(t * 255);
      }
      zt.putImageData(n, 0, 0);
    } catch {
      return;
    }
  }
  let ee = Math.max(m / u, h / f),
    te = u * ee,
    w = f * ee,
    T = (m - te) / 2 - (r || 0) * te,
    E = (h - w) / 2;
  {
    let e = (i || 1) * (a ? 1.06 - 0.06 * a.p : 1),
      t = m / 2,
      n = h / 2;
    ((T = t + (T - t) * e), (E = n + (E - n) * e), (te *= e), (w *= e));
  }
  ((Lt.globalCompositeOperation = `destination-in`),
    Lt.drawImage(Rt, T, E, te, w),
    (Lt.globalCompositeOperation = `source-over`));
}
var en,
  tn,
  nn,
  rn = [],
  an = [],
  on = -1,
  sn = -1;
function cn(e) {
  let t = [],
    n = [];
  return (
    [...e.childNodes].forEach((e) => {
      if (e.nodeType !== 3) return;
      let r = document.createDocumentFragment();
      (e.nodeValue.split(/(\s+)/).forEach((e) => {
        if (!e) return;
        if (/^\s+$/.test(e)) {
          r.appendChild(document.createTextNode(e));
          return;
        }
        let i = document.createElement(`span`);
        i.className = `wd`;
        for (let t of e) {
          let e = document.createElement(`span`);
          ((e.className = `ch`),
            (e.textContent = t),
            (e.dataset.c = t),
            i.appendChild(e),
            n.push(e));
        }
        (t.push(i), r.appendChild(i));
      }),
        e.parentNode.replaceChild(r, e));
    }),
    { words: t, chars: n }
  );
}
function ln(e) {
  let t = e.textContent;
  e.textContent = ``;
  let n = [];
  return (
    t.split(/(\s+)/).forEach((t) => {
      if (!t) return;
      if (/^\s+$/.test(t)) {
        e.appendChild(document.createTextNode(t));
        return;
      }
      let r = document.createElement(`span`);
      r.className = `wd`;
      for (let e of t) {
        let t = document.createElement(`span`);
        ((t.className = `ch`),
          (t.textContent = e),
          r.appendChild(t),
          n.push(t));
      }
      e.appendChild(r);
    }),
    n
  );
}
function un() {
  ((en = document.querySelector(`.ov`)),
    (tn = document.querySelector(`.ov .fill`)),
    (nn = document.querySelector(`.ov .tag`)),
    (rn = [
      [0, 0.045],
      [0.26, 0.4],
      [0.44, 0.55],
      [0.56, 0.65],
    ].map(([e, t], n) => {
      let r = [...document.querySelectorAll(`.bk[data-beat="${n}"]`)];
      return {
        a: e,
        b: t,
        els: r,
        lines: r.flatMap((e) => [...e.querySelectorAll(`.ln i`)]),
        stand: r.map((e) => e.querySelector(`.stand`)).filter(Boolean),
        chars: r.flatMap((e) => [...e.querySelectorAll(`.stand`)].flatMap(ln)),
        heads: [...r.flatMap((e) => [...e.querySelectorAll(`.ln i`)])].map(
          (e) => ({ i: e, ...cn(e) }),
        ),
        shown: !1,
      };
    })),
    (an = [...document.querySelectorAll(`.ov [data-out]`)].map((e) => ({
      el: e,
      role: e.dataset.out,
      base: parseFloat(getComputedStyle(e).opacity) || 1,
      x0: 0,
      y0: 0,
    }))),
    addEventListener(`resize`, dn),
    requestAnimationFrame(dn));
}
function dn() {
  for (let e of an) {
    e.el.style.transform = ``;
    let t = e.el.getBoundingClientRect();
    ((e.x0 = t.left + t.width / 2),
      (e.y0 = t.top + t.height / 2),
      e.el.classList.contains(`gv--r`) &&
        ((e.el.style.top = ``), (e.top0 = e.el.getBoundingClientRect().top)));
  }
}
function fn(e, t) {
  (en.classList.add(`go`), (sn = e + t), (S.t0 = e));
}
function pn(e, t) {
  e.heads.forEach((e, n) => {
    let r = m(d((t - n * 0.115) / 0.6, 0, 1));
    e.i.style.transform = `translate(var(--exitX, 0px), calc(${((1 - r) * 175).toFixed(2)}% + var(--exitY, 0px)))`;
  });
}
function mn(e, t) {
  let n = v.pan,
    r = !1;
  for (let n of rn) {
    let i = n.b - n.a,
      a = d((e - n.a) / i, 0, 1),
      o = e > n.a - 0.02 && e < n.b + 0.02;
    if (
      (o !== n.shown &&
        ((n.shown = o),
        n.els.forEach((e) => {
          e.style.visibility = o ? `visible` : `hidden`;
        })),
      !o)
    )
      continue;
    r = !0;
    let s = n === rn[0],
      c = s
        ? f(d((1 - a) / 0.28, 0, 1))
        : Math.min(f(d(a / 0.16, 0, 1)), f(d((1 - a) / 0.2, 0, 1)));
    if (s) {
      let e = 1 - c,
        t = e * e;
      (n.els.forEach((e) => {
        e.style.opacity = c.toFixed(3);
      }),
        n.heads.forEach((e, n) => {
          let r = t * (1 + n * 0.16);
          (e.i.style.setProperty(`--exitX`, `${(-r * 54).toFixed(2)}px`),
            e.i.style.setProperty(`--exitY`, `${(-r * 7).toFixed(2)}px`));
        }),
        n.els.forEach((n) => {
          ((n.style.transform = `translate3d(${(-t * 86).toFixed(1)}px,${(-t * 14).toFixed(1)}px,0) scale(${(1 - t * 0.04).toFixed(4)})`),
            (n.style.filter = e > 0.02 ? `blur(${(t * 5).toFixed(2)}px)` : ``));
        }));
    } else
      n.els.forEach((e) => {
        ((e.style.opacity = c.toFixed(3)),
          (e.style.transform = ``),
          (e.style.filter = ``));
      });
    let l = s
      ? sn < 0
        ? 0
        : d((t - sn) / Ve, 0, 1)
      : d((a - 0.03) / 0.3, 0, 1);
    if ((pn(n, l), s)) {
      let e = m(d((l - 0.34) / 0.3, 0, 1)),
        t = m(d((l - 0.52) / 0.22, 0, 1));
      n.els.forEach((n) => {
        let r = n.querySelector(`.cta`);
        if (!r) return;
        ((r.style.opacity = e.toFixed(3)),
          (r.style.transform = `translateY(${((1 - e) * 14).toFixed(1)}px)`));
        let i = r.querySelector(`.flood`);
        i && (i.style.clipPath = `inset(${((1 - t) * 100).toFixed(2)}% 0 0 0)`);
      });
    }
    if (nn) {
      let e = rn.indexOf(n);
      e !== on && ((on = e), (nn.textContent = Re[e] || Re[0]));
      let t = m(d((l - (s ? 0.8 : 0.35)) / 0.2, 0, 1)) * c;
      ((nn.style.opacity = t.toFixed(3)),
        (nn.style.transform = `translateY(${((1 - t) * 10).toFixed(1)}px)`));
    }
    let u =
      d(s ? (l - 0.56) / 0.36 : (a - 0.14) / 0.26, 0, 1) * (n.chars.length + 4);
    n.chars.forEach((e, t) => {
      e.style.opacity = d((u - t) * 2.4, 0, 1).toFixed(2);
    });
  }
  nn && !r && on !== -1 && ((on = -1), (nn.style.opacity = `0`));
  {
    let t = k.at + A.over * k.len;
    ((v.p = e), (v.lockEnd = t));
    let r = f(d((e - (t - A.len)) / A.len, 0, 1)),
      i = innerWidth * le.x,
      a = innerHeight * (1 - le.y),
      o = A.e > 0 ? innerWidth * (A.e / k.ax) : (innerWidth * A.w) / 100,
      s = A.e > 0 ? innerHeight * (A.e / k.ay) : (innerHeight * A.h) / 100,
      c = { l: i - o, r: i + o, ld: i - o, rd: i + o, lu: i - o, ru: i + o },
      l = { u: a - s, d: a + s, ld: a + s, rd: a + s, lu: a - s, ru: a - s },
      u = d((e - k.at) / k.len, 0, 1),
      p = g(
        d(
          (u - (A.auto > 0.5 ? d(M() + A.lead, 0, 1) : A.ret)) / A.retLen,
          0,
          1,
        ),
        A.ease,
      ),
      m = f(d((u - (A.ret - 0.18)) / 0.18, 0, 1)),
      h =
        1 + 0.85 * Math.max(0, Math.sin(Math.PI * d((r - 0.55) / 0.45, 0, 1)));
    for (let e of an) {
      if (n > 0 && e.el.classList.contains(`fill`)) continue;
      let t = e.el.classList.contains(`gx`),
        i = t ? r : r * (1 - p),
        a = c[e.role] === void 0 ? 0 : (c[e.role] - e.x0) * i,
        o = l[e.role] === void 0 ? 0 : (l[e.role] - e.y0) * i,
        s = e.el.classList.contains(`gh`) && e.role === `d`,
        u = e.el.classList.contains(`gv--r`);
      if ((s && (o += p * (innerHeight + 24 - e.y0)), u)) {
        let t = innerWidth <= 720 ? 1 - f(d((v.burn - 0.1) / 0.25, 0, 1)) : 1;
        a += p * t * (y.x - e.x0);
      }
      let g = t ? ` scale(${h.toFixed(3)})` : ``;
      if (u) {
        let t = innerWidth <= 720 ? 0 : f(d((v.coda - 0.42) / 0.3, 0, 1));
        e.el.style.top =
          (e.top0 * (1 - Math.max(i, p)) + t * innerHeight).toFixed(1) + `px`;
      }
      e.el.style.transform = `translate(${a.toFixed(1)}px,${o.toFixed(1)}px)${g}`;
      let _ = e.el.classList.contains(`fill`) ? 1 - r : 1,
        b = e.el.classList.contains(`gx--lock`) ? f(d(r / 0.5, 0, 1)) : 1,
        x = t ? 1 - m : s ? 1 - p : 1,
        ee = 1 - Jt();
      e.el.style.opacity = (e.base * _ * b * x * ee).toFixed(3);
    }
    if (((v.g = r), (v.off = p), ee.lit))
      en.style.getPropertyValue(`--rule`) &&
        (en.style.removeProperty(`--rule`),
        en.style.removeProperty(`--cross`),
        en.style.removeProperty(`--mark`));
    else if (r > 0.001) {
      let e = (e, t) => e + (t - e) * p,
        t = [e(29, 255), e(28, 255), e(25, 255)].map(Math.round).join(` `);
      (en.style.setProperty(
        `--rule`,
        `rgb(${t} / ${e(0.165 + 0.5 * r, 0.225).toFixed(3)})`,
      ),
        en.style.setProperty(
          `--cross`,
          `rgb(${t} / ${e(0.34 + 0.6 * r, 0.525).toFixed(3)})`,
        ),
        en.style.setProperty(`--mark`, p > 0.5 ? `#fff` : `var(--ink)`));
    } else
      en.style.getPropertyValue(`--rule`) &&
        (en.style.removeProperty(`--rule`),
        en.style.removeProperty(`--cross`),
        en.style.removeProperty(`--mark`));
  }
  if (((v.burn = d((e - k.at) / k.len, 0, 1)), tn))
    if (n > 0) tn.style.opacity = `0`;
    else {
      let t = ze * (1 - f(d((e - 0.052) / 0.09, 0, 1)));
      ((tn.style.left = t.toFixed(2) + `%`),
        (tn.style.width = ((Be - t) * f(e)).toFixed(2) + `%`));
    }
}
var hn = `M12 0Q13.1 10.9 24 12Q13.1 13.1 12 24Q10.9 13.1 0 12Q10.9 10.9 12 0Z`,
  gn,
  _n,
  vn,
  yn,
  bn = [];
function xn() {
  if (
    ((gn = document.querySelector(`.faq`)),
    (_n = gn && gn.querySelector(`.faq-lead`)),
    (vn = _n && _n.querySelector(`line`)),
    (yn = _n && _n.querySelector(`rect`)),
    (bn = []),
    gn)
  )
    for (let e = 0; e < Te.length; e++) {
      let t = document.createElement(`div`);
      ((t.className = `fq`),
        (t.innerHTML = `<span class="fr"></span><span class="st a"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${hn}"/></svg></span><span class="st b"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${hn}"/></svg></span><h3>${Te[e][0]}</h3><p>${Te[e][2]}</p>`),
        gn.appendChild(t),
        bn.push(t));
    }
}
var Sn = !1;
function Cn(e) {
  if (!gn) return;
  if (((gn.style.opacity = e > 0.001 ? `1` : `0`), e <= 0.001)) {
    if (Sn) return;
    Sn = !0;
  } else Sn = !1;
  let t = innerWidth,
    n = innerHeight,
    r = bn.length,
    i = Math.max(t / De[0], n / De[1]),
    a = De[0] * i,
    o = De[1] * i,
    s = (t - a) / 2,
    c = (n - o) / 2,
    l = d(e / 0.85, 0, 1),
    u = 0.22,
    p = d((l - u) / (1 - u), 0, 1),
    m = 360 / r,
    h = -p * (360 - m),
    g = 0,
    _ = -2;
  for (let e = 0; e < r; e++) {
    let t = Math.cos((((((e * m + h) % 360) + 360) % 360) * Math.PI) / 180);
    t > _ && ((_ = t), (g = e));
  }
  let v = t <= 720,
    y = v ? t * 0.36 : Math.min(360, t * 0.26),
    x = v ? Math.min(1, t / 560) : 1;
  for (let e = 0; e < r; e++) {
    let t = bn[e],
      r = f(d((l - 0.04 - e * 0.05) / 0.22, 0, 1)),
      i = (((e * m + h) % 360) + 360) % 360,
      a = (i * Math.PI) / 180,
      o = (Math.cos(a) + 1) / 2,
      s = e === g && o > 0.9 && r > 0.92;
    (s !== t.classList.contains(`on`) && t.classList.toggle(`on`, s),
      (t.style.left = `50%`),
      (t.style.top = (n * 0.602).toFixed(0) + `px`),
      (t.style.transform = `translate(${(-50 + b.x * 2.4).toFixed(2)}%,${(-50 + b.y * 2).toFixed(2)}%) rotateY(${i.toFixed(2)}deg) translateZ(${y}px) rotateY(${(-i).toFixed(2)}deg) translateY(${(Math.sin(a) * 26 - (1 - r) * 34).toFixed(1)}px) scale(${(Math.round(r * x * (0.58 + 0.42 * o ** 1.4) * 100) / 100).toFixed(2)})`));
    let c = Math.round((1 - o) * 8.4) / 2;
    ((t.style.filter = c > 0.05 ? `blur(${c.toFixed(1)}px)` : ``),
      (t.style.zIndex = Math.round(o * 100)));
  }
  let [ee, S] = Ee[g],
    C = s + ee * a,
    te = c + S * o,
    w = bn[g].getBoundingClientRect(),
    T = C < t / 2 ? w.left - 34 : w.right + 34,
    E = w.top + 26,
    ne = f(d(((_ + 1) / 2 - 0.9) / 0.055, 0, 1));
  (yn.setAttribute(`x`, (T - 4).toFixed(1)),
    yn.setAttribute(`y`, (E - 4).toFixed(1)),
    vn.setAttribute(`x1`, C.toFixed(1)),
    vn.setAttribute(`y1`, te.toFixed(1)),
    vn.setAttribute(`x2`, T.toFixed(1)),
    vn.setAttribute(`y2`, E.toFixed(1)),
    (_n.style.opacity = ne.toFixed(3)));
}
function wn(e) {
  if (!gn) return 0;
  let t = f(d((e - 0.8) / 0.2, 0, 1));
  return (
    gn.classList.toggle(`out`, t > 0.001),
    t > 0.001
      ? (gn.style.setProperty(`--go`, Math.round((80 - t * 80) / 2) * 2 + `%`),
        (gn.style.filter = `blur(${(Math.round(t * 18) / 2).toFixed(1)}px)`),
        (gn.style.transform = `translateY(${(-t * innerHeight * 0.06).toFixed(1)}px) scale(${(Math.round((1 + t * 0.05) * 100) / 100).toFixed(2)})`))
      : ((gn.style.filter = ``), (gn.style.transform = ``)),
    t
  );
}
function Mn() {
  let e = document.querySelector(`.cf-cta`);
  if (!e) return;
  let t = (e) => document.querySelector(`.cf-in [data-k="${e}"]`);
  for (let n of [`defective`, `compliant`])
    t(n).addEventListener(`click`, () => {
      ((t(`notice`).value = SAMPLES[n]), (t(`notice`).scrollTop = 0));
    });
  e.addEventListener(`click`, () => {
    let n = t(`notice`).value;
    if (!n.trim()) return t(`notice`).focus();
    try {
      sessionStorage.setItem(`cg:notice`, n);
    } catch {}
    location.href = `/dashboard`;
  });
}
var Nn,
  Pn,
  Fn,
  In = -1,
  Ln = null,
  Rn = 0,
  zn,
  Bn,
  Vn,
  Hn,
  Un,
  Wn,
  Gn = [],
  Kn = [],
  qn = -1,
  Jn = [],
  Yn = 0,
  Xn = [0, 0],
  Zn,
  Qn = !1,
  $n = !1,
  er = !1,
  tr,
  nr,
  rr,
  ir,
  ar,
  or,
  sr,
  cr,
  lr = -1,
  ur = null;
function dr(e, t) {
  ((e.width !== t.naturalWidth || e.height !== t.naturalHeight) &&
    ((e.width = t.naturalWidth), (e.height = t.naturalHeight)),
    e.getContext(`2d`).drawImage(t, 0, 0));
}
var fr,
  pr = null,
  mr = null,
  hr = -1,
  gr = !1,
  _r = -1,
  vr = 0,
  yr = 0,
  br = !1,
  xr = null,
  Sr = [];
function Cr(e) {
  let t = e || 1,
    n = () => (t = (t * 1103515245 + 12345) & 2147483647) / 2147483647;
  Sr = [];
  for (let e = 0; e < 4; e++) {
    let e = n() * Math.PI * 2,
      t = 0.35 + n() * 0.9;
    Sr.push({
      d: +(n() * 0.34).toFixed(3),
      r: +(0.42 + n() * 0.58).toFixed(3),
      e: Math.floor(n() * _.length),
      ax: +(Math.cos(e) * t).toFixed(3),
      ay: +(Math.sin(e) * t * 0.6).toFixed(3),
      rz: +((n() - 0.5) * 7).toFixed(2),
    });
  }
}
function wr() {
  (Cr(0),
    (Nn = document.querySelector(`.fly`)),
    (Pn = document.querySelector(`.fly-w`)),
    (Fn = wt(`/films/flysky`, 121, 2, 1 - ce - se - oe, 1)),
    (sr = document.querySelector(`.trans`)),
    (cr = wt(`/films/trans`, 121, 2, 1 - ce, 1)),
    (Zn = document.querySelector(`.foot`)),
    (Zn.muted = !0),
    Zn.setAttribute(`muted`, ``));
  let e = () => {
    if (er) return;
    let t = document.documentElement.scrollHeight - innerHeight;
    if (t < 1 || scrollY / t < 0.5) return;
    ((er = !0), removeEventListener(`touchstart`, e));
    let n = Zn.play();
    n &&
      n.then &&
      n
        .then(() => {
          Qn || Zn.pause();
        })
        .catch(() => {});
  };
  if (
    (addEventListener(`touchstart`, e, { passive: !0 }),
    (fr = document.querySelector(`.ftx`)),
    (tr = document.querySelector(`.ft`)),
    (nr = tr && tr.querySelector(`.ft-in`)),
    (rr = tr ? [...tr.querySelectorAll(`.ft-r`)] : []),
    (ir = tr && tr.querySelector(`.ft-box rect`)),
    (ar = tr
      ? [...tr.querySelectorAll(`.ft-st,.ft-mark,.ft-tag,.ft-meta`)]
      : []),
    (or = tr ? [...tr.querySelectorAll(`.ft-tag .ln i`)] : []),
    ir && (ir.style.strokeDasharray = 2 * 1442),
    (zn = document.querySelector(`.cf`)),
    (Bn = document.querySelector(`.cf-lead`)),
    (Vn = zn && zn.querySelector(`.cf-in`)),
    (Hn = document.querySelector(`.cf-orb`)),
    (Un = Hn ? [...Hn.querySelectorAll(`ellipse`)] : []),
    (Wn = document.querySelector(`.cf-gl`)),
    Wn)
  )
    for (let e = 0; e < ke.length; e++) {
      let t = document.createElement(`i`);
      (t.style.setProperty(`--dur`, (1.9 + (e % 7) * 0.42).toFixed(2) + `s`),
        t.style.setProperty(`--dl`, (-(e * 0.53) % 3.1).toFixed(2) + `s`),
        Wn.appendChild(t),
        Gn.push(t));
    }
  Tr();
}
function Tr() {
  if (!Vn) return;
  for (let e = 0; e < Oe.length; e++) {
    let [t, n, r, i, a, o, s, c] = Oe[e],
      l = document.createElement(`div`);
    ((l.className = r === `area` ? `cf-f` : `cf-f pill`),
      (l.style.cssText = `left:${i}px;top:${a}px;width:${o}px;height:${s}px`),
      (l.innerHTML = `<span class="rim"></span><span class="rim2"></span><span class="ic"><svg viewBox="0 0 24 24"><path d="${c}"/></svg></span>${r === `area` ? `<textarea data-k="${t}" rows="4" placeholder="${n}" spellcheck="false"></textarea>` : r === `button` ? `<button data-k="${t}" type="button">${n}</button>` : `<input data-k="${t}" type="${r}" placeholder="${n}">`}`));
    let u = l.querySelector(`input,textarea,button`);
    (l.addEventListener(`click`, () => u.focus()),
      l.addEventListener(`pointerenter`, () => {
        qn = e;
      }),
      l.addEventListener(`pointerleave`, () => {
        qn === e && (qn = -1);
      }),
      Vn.appendChild(l),
      Kn.push(l));
  }
  let e = document.createElement(`button`);
  ((e.className = `cf-cta`),
    (e.type = `button`),
    (e.textContent = `Check this notice`),
    (e.style.cssText = `left:452px;top:486px;width:262px;height:40px`),
    e.addEventListener(`pointerenter`, () => {
      qn = Kn.length - 1;
    }),
    e.addEventListener(`pointerleave`, () => {
      qn === Kn.length - 1 && (qn = -1);
    }),
    Vn.appendChild(e),
    Kn.push(e),
    Vn.addEventListener(`pointerdown`, (e) => {
      if (!(e.target.closest && e.target.closest(`input,textarea,button`)))
        for (let t of Kn) {
          let n = t.getBoundingClientRect();
          if (
            e.clientX < n.left ||
            e.clientX > n.right ||
            e.clientY < n.top ||
            e.clientY > n.bottom
          )
            continue;
          let r = t.querySelector && t.querySelector(`input,textarea`);
          r ? (e.preventDefault(), r.focus()) : t.click && t.click();
          return;
        }
    }),
    Mn());
}
function Er(e, t) {
  let n = innerWidth,
    r = innerHeight,
    i = t === void 0 ? I.bgScale : t,
    a =
      e === void 0
        ? innerWidth <= 720
          ? 50 + (Ye.x - 50) * d((Rn - Ye.from) / Math.max(0.02, Ye.span), 0, 1)
          : 50 + (I.bgX - 50) * f(d((Rn - 0.26) / 0.34, 0, 1))
        : e,
    o = Math.max(n / 1280, r / 720),
    s = 1280 * o * i,
    c = 720 * o * i;
  return { dw: s, dh: c, ox: (n - s) * (a / 100), oy: (r - c) * (I.bgY / 100) };
}
function Dr(e) {
  if (!Nn) return;
  if (((Rn = e), e > 1e-4 && !er && ((er = !0), Zn.load()), e <= 1e-4)) {
    ((Nn.style.opacity = `0`), (In = -1));
    return;
  }
  {
    let t = Math.min(120, Math.round(e * 120));
    if ((Fn.aim(t), Fn.ready && t !== In)) {
      let e = Fn.near(t);
      e && (e !== Ln && (dr(Nn, e), (Ln = e)), (In = t));
    }
  }
  ((Nn.style.opacity = f(d(e / 0.05, 0, 1)).toFixed(3)),
    (Pn.style.opacity = `0`));
  let t = Er();
  ((Nn.style.width = t.dw.toFixed(1) + `px`),
    (Nn.style.height = t.dh.toFixed(1) + `px`),
    (Nn.style.left = t.ox.toFixed(1) + `px`),
    (Nn.style.top = t.oy.toFixed(1) + `px`));
}
var Or = ``,
  kr = [];
function Ar(e) {
  if (!Hn || ((Hn.style.opacity = e.toFixed(3)), e < 0.002)) return;
  let t = Er(),
    n = `${e.toFixed(3)}|${t.ox.toFixed(1)}|${t.oy.toFixed(1)}|${t.dw.toFixed(1)}`,
    r = n !== Or;
  Or = n;
  for (let n = 0; n < Un.length; n++) {
    let [i, a, o, s, c] = Ae[n],
      l = Un[n],
      u = t.ox + i * t.dw,
      p = t.oy + a * t.dh,
      m = o * t.dw,
      h = s * t.dh;
    if (r) {
      (l.setAttribute(`cx`, u.toFixed(1)),
        l.setAttribute(`cy`, p.toFixed(1)),
        l.setAttribute(`rx`, m.toFixed(1)),
        l.setAttribute(`ry`, h.toFixed(1)));
      let t = (m - h) ** 2 / (m + h) ** 2,
        r = Math.PI * (m + h) * (1 + (3 * t) / (10 + Math.sqrt(4 - 3 * t))),
        i = f(d((e - n * 0.16) / 0.52, 0, 1));
      ((l.style.strokeDasharray = `1.4 7`),
        (l.style.strokeDashoffset = ((1 - i) * r).toFixed(1)),
        (l.style.opacity = i.toFixed(3)),
        l.style.setProperty(`--adur`, (7.5 + n * 2.6).toFixed(1) + `s`),
        l.style.setProperty(`--adl`, (-(n * 3.1)).toFixed(1) + `s`));
    }
    let g = c + (performance.now() / 1e3) * (n % 2 ? -0.6 : 0.9),
      _ = (Math.round(g / 0.2) * 0.2).toFixed(1);
    (kr[n] !== _ || r) &&
      ((kr[n] = _),
      l.setAttribute(
        `transform`,
        `rotate(${_} ${u.toFixed(1)} ${p.toFixed(1)})`,
      ));
  }
}
var jr = ``;
function Mr(e) {
  if (!Wn || ((Wn.style.opacity = e.toFixed(3)), e < 0.002)) return;
  let t = Er(),
    n = `${t.ox.toFixed(1)}|${t.oy.toFixed(1)}|${t.dw.toFixed(1)}`;
  if (n !== jr) {
    jr = n;
    for (let e = 0; e < Gn.length; e++) {
      let [n, r, i] = ke[e],
        a = (i === 2 ? 78 : 46) * I.bgScale,
        o = Gn[e];
      ((o.style.left = (t.ox + n * t.dw).toFixed(1) + `px`),
        (o.style.top = (t.oy + r * t.dh).toFixed(1) + `px`),
        (o.style.width = a.toFixed(1) + `px`),
        (o.style.height = a.toFixed(1) + `px`));
    }
  }
}
var Nr = !1,
  Pr = null;
function Fr(e, t) {
  if (!zn) return;
  if (e <= 5e-4 && Yn <= 5e-4 && t <= I.at) {
    if (Nr) return;
    Nr = !0;
  } else Nr = !1;
  (Mr(f(d((t - 0.9) / 0.1, 0, 1))), Ar(f(d((t - 0.8) / 0.2, 0, 1))));
  let n = d((t - I.at) / I.span, 0, 1),
    r = f(n);
  if (Bn) {
    let e = d((n - I.hold - 0.1) / 0.46, 0, 1),
      t = e * e * e * (e * (e * 6 - 15) + 10);
    ((Bn.style.opacity = t.toFixed(3)),
      (Bn.style.transform = `translateY(${((1 - t) * 11).toFixed(1)}px)`));
  }
  zn.style.opacity = r > 0.001 || e > 0.001 ? `1` : `0`;
  {
    let t = e > 0.001 || n > 0.995;
    (zn.classList.toggle(`live`, t),
      (zn.inert = !t),
      zn.setAttribute(`aria-hidden`, String(!t)));
  }
  zn.style.perspective = I.persp + `px`;
  let i = innerWidth,
    a = innerHeight,
    o = i <= 720,
    s = o
      ? Math.min((i * Ze.w) / 496, (a - 240) / 378) / I.scale
      : Math.min(i / 1180, a / 900),
    c = o ? Ze.x - 210 * s * I.scale : I.px,
    l = s * I.scale,
    u = o ? 60 - a / 2 + 232 * l + Ze.y : I.py,
    p = Math.max(f(d((e - 0.06) / 0.4, 0, 1)), r),
    m = (1 - p) * I.ryIn + I.ry + b.x * 5.5,
    h = (1 - p) * I.rxIn + I.rx - b.y * 4,
    g = (1 - p) * I.rzIn + I.rz,
    v = Er(),
    y = v.ox + 0.3715 * v.dw,
    x = v.oy + 0.148 * v.dh,
    ee = d((n - I.hold) / Math.max(0.02, I.run), 0, 1),
    S = 1 - _[I.ease | 0].f(ee),
    C =
      Yn > 5e-4
        ? `translate3d(0,${(-Yn * innerHeight * 1.22).toFixed(1)}px,0) scale(${(1 + Yn * 0.1).toFixed(4)}) `
        : ``,
    te = (e, t) =>
      C +
      `translate(${(c + e + b.x * 16).toFixed(1)}px, ${(u + t + (1 - p) * 90 + b.y * 12).toFixed(1)}px) scale(${(s * I.scale).toFixed(4)}) rotateX(${h.toFixed(2)}deg) rotateY(${m.toFixed(2)}deg) rotateZ(${g.toFixed(2)}deg)`;
  !Pr && Kn[0] && (Pr = Kn[0].querySelector(`.ic`));
  let w = S > 0.002 && Pr;
  if (w) {
    Vn.style.transform = te(0, 0);
    let e = w.getBoundingClientRect();
    Xn = [y - (e.left + e.width / 2), x - (e.top + e.height / 2)];
  }
  Vn.style.transform = te(Xn[0] * S, Xn[1] * S);
  for (let e = 0; e < Kn.length; e++) {
    let t = Sr[e % Sr.length],
      n = f(d((r - e * I.stagger) / I.each, 0, 1));
    Kn[e].style.opacity = n.toFixed(3);
    let i = qn < 0 ? 0 : e === qn ? I.pop : -I.push;
    Jn[e] = (Jn[e] || 0) + (i - (Jn[e] || 0)) * 0.12;
    let a = e === qn ? 1 : qn < 0 ? 0 : -1,
      o = (Kn.length - 1 - e) * 7,
      s = d((ee - t.d) / Math.max(0.05, t.r), 0, 1),
      c = 1 - _[t.e].f(s),
      l = (t.ax * c * 90).toFixed(1),
      u = (t.ay * c * 90).toFixed(1);
    ((Kn[e].style.transform =
      `translate3d(${l}px, ${u}px, ${((1 - n) * -180 + o + Jn[e]).toFixed(1)}px) rotateZ(${(t.rz * c).toFixed(2)}deg)`),
      (Kn[e].style.filter =
        a < 0 && innerWidth > 720
          ? `brightness(${(1 - 0.1 * (-Jn[e] / Math.max(1, I.push))).toFixed(3)})`
          : ``));
    let p = Kn[e].style;
    (p.setProperty(`--blur`, I.blur + `px`),
      p.setProperty(`--fill`, I.fill),
      p.setProperty(`--rim`, I.rim),
      p.setProperty(`--bev`, I.bev + `px`),
      p.setProperty(`--bev2`, I.bev2),
      p.setProperty(`--spec`, I.spec),
      p.setProperty(`--sat`, I.sat),
      p.setProperty(`--ins`, I.ins),
      p.setProperty(`--insB`, I.insB + `px`),
      p.setProperty(`--insY`, I.insY + `px`));
  }
}
function Ir() {
  let e = fr.getContext(`webgl`);
  if (!e) return null;
  let t = (t, n) => {
      let r = e.createShader(t);
      return (
        e.shaderSource(r, n),
        e.compileShader(r),
        e.getShaderParameter(r, e.COMPILE_STATUS)
          ? r
          : (console.warn(e.getShaderInfoLog(r)), null)
      );
    },
    n = t(e.VERTEX_SHADER, At),
    r = t(e.FRAGMENT_SHADER, jt);
  if (!n || !r) return null;
  let i = e.createProgram();
  (e.attachShader(i, n),
    e.attachShader(i, r),
    e.linkProgram(i),
    e.useProgram(i));
  let a = e.createBuffer();
  (e.bindBuffer(e.ARRAY_BUFFER, a),
    e.bufferData(
      e.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      e.STATIC_DRAW,
    ));
  let o = e.getAttribLocation(i, `a`);
  (e.enableVertexAttribArray(o),
    e.vertexAttribPointer(o, 2, e.FLOAT, !1, 0, 0),
    e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !0));
  let s = (t) => {
      let n = e.createTexture();
      return (
        e.activeTexture(e.TEXTURE0 + t),
        e.bindTexture(e.TEXTURE_2D, n),
        [
          [e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE],
          [e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE],
          [e.TEXTURE_MIN_FILTER, e.LINEAR],
          [e.TEXTURE_MAG_FILTER, e.LINEAR],
        ].forEach(([t, n]) => e.texParameteri(e.TEXTURE_2D, t, n)),
        n
      );
    },
    c = s(0),
    l = s(1),
    u = new Uint8Array([11, 10, 9, 255]);
  for (let [t, n] of [
    [0, c],
    [1, l],
  ])
    (e.activeTexture(e.TEXTURE0 + t),
      e.bindTexture(e.TEXTURE_2D, n),
      e.texImage2D(
        e.TEXTURE_2D,
        0,
        e.RGBA,
        1,
        1,
        0,
        e.RGBA,
        e.UNSIGNED_BYTE,
        u,
      ));
  let d = {};
  for (let t of [
    `progress`,
    `grade`,
    `scaleB`,
    `mode`,
    `radius`,
    `width`,
    `intensity`,
    `time`,
    `res`,
    `img`,
  ])
    d[t] = e.getUniformLocation(i, t);
  let f = (t) => e.getUniformLocation(i, t);
  return (
    e.uniform1i(f(`t1`), 0),
    e.uniform1i(f(`t2`), 1),
    e.uniform1f(d.scaleB, Fe.scaleB),
    e.uniform1f(d.mode, Fe.mode),
    e.uniform1f(d.radius, Fe.radius),
    e.uniform1f(d.width, Fe.width),
    e.uniform1f(d.intensity, Fe.noise),
    e.uniform2f(d.img, 1920, 1080),
    { g: e, loc: d, tA: c, tB: l }
  );
}
var Lr = (e) => {
  let t = 1;
  for (; t < Ie.length - 1 && e > Ie[t];) t++;
  let n = (e - Ie[t - 1]) / (Ie[t] - Ie[t - 1]);
  return Le[t - 1] + (Le[t] - Le[t - 1]) * d(n, 0, 1);
};
function Rr(e, t) {
  if (((pr ||= Ir()), !pr)) return 0;
  let n = d((e - Fe.at) / Fe.span, 0, 1);
  if (n <= 5e-4) return ((fr.style.opacity = `0`), (br = !1), 0);
  ((fr.style.opacity = `1`), (br = !0));
  let { g: r, loc: i } = pr,
    a = Math.min(devicePixelRatio, innerWidth <= 720 ? 1.5 : 2),
    o = Math.round(innerWidth * a),
    s = Math.round(innerHeight * a);
  ((fr.width !== o || fr.height !== s) && ((fr.width = o), (fr.height = s)),
    r.viewport(0, 0, fr.width, fr.height));
  let c = !1;
  if (
    (t &&
      t.complete &&
      t.naturalWidth &&
      t !== mr &&
      ((mr = t),
      (c = !0),
      r.activeTexture(r.TEXTURE0),
      r.bindTexture(r.TEXTURE_2D, pr.tA),
      (r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, t),
        (gr = !0))),
    Zn.readyState >= 2 && Zn.currentTime !== hr)
  ) {
    ((hr = Zn.currentTime),
      (c = !0),
      r.activeTexture(r.TEXTURE1),
      r.bindTexture(r.TEXTURE_2D, pr.tB),
      r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, Zn));
  }
  if (
    (n !== _r && ((_r = n), (c = !0)),
    (fr.width !== vr || fr.height !== yr) &&
      ((vr = fr.width), (yr = fr.height), (c = !0)),
    !c)
  )
    return 1;
  let l = d(Zn.currentTime || 0, 0, 10);
  return (
    r.uniform1f(i.progress, n),
    r.uniform1f(i.grade, 0.955 / Lr(l)),
    r.uniform1f(i.time, performance.now() / 1e3),
    r.uniform2f(i.res, fr.width, fr.height),
    r.drawArrays(r.TRIANGLES, 0, 3),
    1
  );
}
function zr(e) {
  if (
    !tr ||
    ((tr.style.opacity = e > 0.001 ? `1` : `0`),
    document.body.classList.toggle(`ft-on`, e > 0.02),
    e < 0.001)
  )
    return;
  let t =
    Math.min(innerWidth / 1920, innerHeight / 1080) *
    (innerWidth <= 720 ? Qe.k : 1);
  nr.style.transform = `scale(${t.toFixed(5)})`;
  for (let t = 0; t < rr.length; t++) {
    let n = f(d((e - t * 0.04) / 0.26, 0, 1));
    rr[t].style.transform = rr[t].classList.contains(`h`)
      ? `scaleX(${n.toFixed(3)})`
      : `scaleY(${n.toFixed(3)})`;
  }
  let n = f(d((e - 0.1) / 0.42, 0, 1));
  ir.style.strokeDashoffset = (2884 * (1 - n)).toFixed(1);
  for (let t = 0; t < ar.length; t++) {
    let n = f(d((e - 0.14 - t * 0.045) / 0.26, 0, 1));
    ar[t].style.opacity = n.toFixed(3);
  }
  for (let t = 0; t < or.length; t++) {
    let n = m(d((e - 0.2 - t * 0.075) / 0.34, 0, 1));
    or[t].style.transform = `translateY(${((1 - n) * 120).toFixed(1)}%)`;
  }
}
function Br(e) {
  if (!Zn) return;
  if (!(e > 5e-4)) {
    (zr(0),
      (sr.style.opacity = `0`),
      (Zn.style.opacity = `0`),
      (fr.style.opacity = `0`),
      $n &&
        (($n = !1),
        (Yn = 0),
        zn &&
          ((zn.style.transform = ``),
          (zn.style.filter = ``),
          (zn.style.opacity = ``),
          (zn.style.zIndex = ``)),
        Vn && (Vn.style.filter = ``),
        Bn && (Bn.style.opacity = ``)),
      Qn && ((Qn = !1), Zn.pause()),
      (lr = -1));
    return;
  }
  if (((Qn = !0), Zn.paused && Zn.readyState >= 2)) {
    let e = Zn.play();
    e && e.catch && e.catch(() => {});
  }
  let t = f(d(e / 0.34, 0, 1));
  (($n = !0),
    (Yn = t),
    zn &&
      ((zn.style.zIndex = `7`),
      (zn.style.transform = ``),
      (zn.style.filter = ``),
      (zn.style.opacity = t > 0.99 ? `0` : `1`)),
    Vn && (Vn.style.filter = t > 0.02 ? `blur(${(t * 7).toFixed(2)}px)` : ``),
    Bn && (Bn.style.opacity = (1 - f(d(e / 0.28, 0, 1))).toFixed(3)));
  let n = d(e / je, 0, 1);
  {
    let e = Math.min(120, Math.round(n * 120));
    if ((cr.aim(e), cr.ready && e !== lr)) {
      let t = cr.near(e);
      t && (t !== ur && ((ur = t), br || (dr(sr, t), (xr = t))), (lr = e));
    }
  }
  let r = innerWidth <= 720,
    i = r
      ? 50 + (Ye.x - 50) * d((1 - Ye.from) / Math.max(0.02, Ye.span), 0, 1)
      : I.bgX,
    a = f(
      d((n - (r ? Xe.at : 0.12)) / Math.max(0.02, r ? Xe.span : 0.6), 0, 1),
    ),
    o = Er(i + (50 - i) * a, I.bgScale + (1 - I.bgScale) * a);
  ((sr.style.width = o.dw.toFixed(1) + `px`),
    (sr.style.height = o.dh.toFixed(1) + `px`),
    (sr.style.left = o.ox.toFixed(1) + `px`),
    (sr.style.top = o.oy.toFixed(1) + `px`));
  let s = Rr(n, lr >= 0 ? ur : null);
  (!s && ur && xr !== ur && (dr(sr, ur), (xr = ur)),
    (sr.style.opacity = lr >= 0 && !s ? `1` : `0`),
    (Zn.style.opacity = !s && n >= 1 ? `1` : `0`),
    zr(f(d((e - je * 0.3) / (1 - je * 0.3), 0, 1))));
}
var Vr,
  Hr,
  Ur,
  Wr,
  Gr = [],
  Kr = [],
  qr = [],
  Jr = [],
  Yr,
  Xr,
  Zr,
  Qr,
  $r,
  ei = [],
  ti = [],
  ni = [],
  ri = 0,
  ii = !1,
  ai = -1,
  oi = 0,
  si = 0,
  ci = -1;
function li() {
  if (
    ((Vr = document.querySelector(`.fin`)),
    (Hr = [...document.querySelectorAll(`.fin-top, .fin-bot`)]),
    (Ur = document.querySelector(`.fin-g[data-f="1"] .fin-top`)),
    (Wr = document.querySelector(`.fin-g[data-f="1"] .fin-bot`)),
    (Gr = [...document.querySelectorAll(`.fin-g`)]),
    (Kr = Gr.map((e) => [...e.querySelectorAll(`.fin-h .ln i`)])),
    (qr = Gr.map((e) => [...e.querySelectorAll(`.fin-l, .fin-chip, .fin-s`)])),
    (Jr = Gr.map((e) => [...e.querySelectorAll(`.fin-soak`)])),
    (Yr = document.querySelector(`#inkf feDisplacementMap`)),
    (Xr = document.querySelector(`#inkf feFuncA`)),
    innerWidth <= 720)
  )
    for (let e of Jr) for (let t of e) t.style.filter = `none`;
  else for (let e of Jr[1] || []) e.style.filter = `none`;
  ((Zr = document.querySelector(`.sign`)),
    (Qr = Zr && Zr.querySelector(`.sg-a`)),
    ($r = Zr && Zr.querySelector(`.sg-b`)),
    (ei = $r
      ? [...$r.querySelectorAll(`path`)].map((e) => {
          let t = e.getTotalLength();
          return (
            (e.style.strokeDasharray = t),
            (e.style.strokeDashoffset = t),
            (e.style.opacity = `0`),
            { el: e, a: +e.dataset.a, b: +e.dataset.b, len: t }
          );
        })
      : []),
    (ti = [...document.querySelectorAll(`.ov .wob`)]),
    (ni = [...document.querySelectorAll(`.ov .gv, .ov .gh`)]));
}
function ui(e, t, n) {
  if (!Vr) return ri;
  let r = innerWidth <= 720,
    i = innerWidth / 1516;
  r &&
    Vr._join !== Ke.join &&
    ((Vr._join = Ke.join),
    Vr.style.setProperty(`--join`, (Ke.join * 100).toFixed(1) + `%`));
  for (let e of Hr)
    e === Ur ||
      e === Wr ||
      (e.style.transform = r ? `scale(1)` : `scale(${i.toFixed(5)})`);
  let a = d((v.plan - ge) / (1 - ge), 0, 1);
  ((ri = d((t - _e) / (1 - _e), 0, 1)), (v.ink = a));
  let o = d(e / ve, 0, 1),
    s = ri > 0.5 ? f(d((be(e) - Ce) / we, 0, 1)) : 0,
    c = [f(d(a / 0.22, 0, 1)), f(d(o / 0.02, 0, 1)) * (1 - s)];
  if (Ur) {
    let e = f(d(o / 0.78, 0, 1)),
      t = m(d(r ? e : (e - 0.62) / 0.38, 0, 1)),
      n = 1 + ((r ? qe : P) - 1) * (1 - t);
    if (
      (r && (n = Math.round(n * 100) / 100),
      (Ur.style.transform = r
        ? `translate(0px,${((1 - e) * 520).toFixed(1)}px) scale(${n.toFixed(4)})`
        : `scale(${i.toFixed(5)}) translate(0px,${((1 - e) * 1190).toFixed(1)}px) scale(${n.toFixed(4)})`),
      Wr)
    ) {
      let t = f(d((e - 0.55) / 0.4, 0, 1));
      ((Wr.style.transform = r
        ? `translateY(${((1 - t) * 110).toFixed(1)}px)`
        : `scale(${i.toFixed(5)}) translateY(${((1 - t) * 230).toFixed(1)}px)`),
        (Wr.style.opacity = t.toFixed(3)));
    }
  }
  let l = a >= 0.999 || a <= 0.001;
  if (Yr && Math.abs(a - ai) > 5e-4 && (l || innerWidth > 720 || n - oi > 33)) {
    ((oi = n), (ai = a));
    let e = f(a);
    if (r)
      for (let t of Jr[0])
        ((t.style.filter =
          a >= 0.999
            ? `none`
            : `blur(${((1 - e) * 3.4).toFixed(2)}px) contrast(${(1 + (1 - e) * 6).toFixed(2)})`),
          (t.style.opacity = d(a * 1.12, 0, 1).toFixed(3)));
    else {
      (Yr.setAttribute(`scale`, ((1 - e) * 34).toFixed(2)),
        Xr.setAttribute(
          `intercept`,
          (-7.4 + 8.4 * d(a * 1.12, 0, 1)).toFixed(3),
        ),
        Xr.setAttribute(`slope`, (9 - 5 * e).toFixed(2)));
      for (let t of Jr[0])
        (t.style.setProperty(`--soak`, ((1 - e) * 3.4).toFixed(2) + `px`),
          t.style.setProperty(`--bite`, (1 + (1 - e) * 6).toFixed(2)),
          (t.style.filter = a >= 0.999 ? `none` : ``));
    }
  }
  {
    let e = !!ee.lit * (1 - f(d((ri - 0.35) / 0.2, 0, 1)));
    if (e > 0.01 !== ii) {
      ii = e > 0.01;
      for (let e of ni) e.classList.toggle(`warp`, ii);
      for (let e of ti) e._L = void 0;
    }
    if (ii && n - si > 32) {
      si = n;
      let t = n * 0.001;
      for (let n of ti) {
        let r = n.parentElement;
        if (n._L === void 0) {
          let e = r.getBoundingClientRect();
          n._L = Math.max(1, r.classList.contains(`gv`) ? e.height : e.width);
        }
        let i = r.classList.contains(`gv`),
          a = n._L,
          o = e * 7.5,
          s = ``;
        for (let e = 0; e <= 14; e++) {
          let n = e / 14,
            r = n * a,
            c =
              o *
              (Math.sin(n * 5.2 + t * 1.25) * 0.62 +
                Math.sin(n * 11.4 - t * 0.87) * 0.38);
          s +=
            (e ? `L` : `M`) +
            (i
              ? `${(24 + c).toFixed(1)},${r.toFixed(1)}`
              : `${r.toFixed(1)},${(24 + c).toFixed(1)}`);
        }
        (n.setAttribute(
          `viewBox`,
          i ? `0 0 49 ${a.toFixed(0)}` : `0 0 ${a.toFixed(0)} 49`,
        ),
          n.firstElementChild.setAttribute(`d`, s));
      }
    }
  }
  let u = r ? Math.round(s * 26) / 2 : s * 13;
  if (
    ((Gr[1].style.filter = u > 0.01 ? `blur(${u.toFixed(2)}px)` : ``),
    Math.abs(ri - ci) > 5e-4)
  ) {
    ci = ri;
    let e = (1.52 - 2.04 * ri) * 100;
    r
      ? ((Gr[0].style.clipPath =
          ri > 0.001 ? `inset(0 0 ${d(100 - e, 0, 100).toFixed(2)}% 0)` : ``),
        (Gr[1].style.clipPath =
          ri > 0.001 && ri < 0.999
            ? `inset(${d(e, 0, 100).toFixed(2)}% 0 0 0)`
            : ``))
      : ((Gr[0].style.webkitMaskImage = Gr[0].style.maskImage =
          ri > 0.001
            ? `linear-gradient(to top, rgba(0,0,0,0) ${(100 - e - 1.5).toFixed(1)}%, #000 ${(100 - e + 3).toFixed(1)}%)`
            : ``),
        (Gr[1].style.webkitMaskImage = Gr[1].style.maskImage =
          ri > 0.001 && ri < 0.999
            ? `linear-gradient(to top, #000 ${(100 - e - 1.5).toFixed(1)}%, rgba(0,0,0,0) ${(100 - e + 3).toFixed(1)}%)`
            : ``));
  }
  Vr.style.opacity = Math.max(c[0], c[1]) > 0.001 ? `1` : `0`;
  for (let e = 0; e < Gr.length; e++) {
    let t = c[e];
    Gr[e].style.opacity = t.toFixed(3);
    let n = Kr[e];
    for (let e = 0; e < n.length; e++) {
      let r = m(d((t - e * 0.12) / 0.62, 0, 1));
      n[e].style.transform = `translateY(${((1 - r) * 120).toFixed(1)}%)`;
    }
    for (let t of qr[e])
      ((t.style.opacity = `1`), (t.style.transform = `translateY(0px)`));
  }
  return ri;
}
function di(e, t) {
  if (!Zr) return;
  let n = Math.round(t * 22) / 2;
  Zr.style.filter = n > 0.01 ? `blur(${n.toFixed(1)}px)` : ``;
  let r = d((e - F) / (1 - F), 0, 1),
    i = f(d((r - 0.3) / 0.7, 0, 1)),
    a = innerWidth <= 720 ? Je + (1 - Je) * i : 1 - (1 - Je) * i,
    o = Math.round(a * (1 + t * 0.06) * 100) / 100;
  ((Zr.style.transform = `translate(${(b.x * 15).toFixed(1)}px,${(-i * innerHeight * 0.072 + b.y * 12 - t * innerHeight * 0.09).toFixed(1)}px) scale(${o.toFixed(2)})`),
    (Zr.style.opacity = (1 - t).toFixed(3)),
    Qr && (Qr.style.opacity = f(d(r / 0.22, 0, 1)).toFixed(3)));
  let s = f(d((r - 0.2) / 0.62, 0, 1));
  if ($r) {
    $r.style.opacity = s > 0.001 ? `1` : `0`;
    for (let e = 0; e < ei.length; e++) {
      let t = ei[e],
        n = d((s - t.a) / Math.max(1e-4, t.b - t.a), 0, 1);
      ((t.el.style.opacity = n > 0 ? `1` : `0`),
        (t.el.style.strokeDashoffset = (t.len * (1 - n)).toFixed(2)));
    }
  }
}
var fi,
  pi,
  mi,
  hi = [],
  gi = [],
  _i = [],
  vi = [],
  yi = [],
  bi = [],
  xi = 0,
  Si = 0;
function Ci() {
  ((fi = document.querySelector(`.pf`)),
    (pi = document.querySelector(`.pf-in`)),
    (mi = document.querySelector(`.pf-head`)),
    (hi = [...document.querySelectorAll(`.pf-g`)]),
    (gi = hi.map((e) => [...e.querySelectorAll(`.pf-h .ln i`)])),
    (_i = hi.map((e) => [
      e.querySelector(`.pf-chip`),
      e.querySelector(`.pf-b`),
    ])),
    (yi = hi.map(() => 0)),
    (bi = hi.map(() => 0)));
  let e = document.querySelector(`.pf-ticks`);
  if (((vi = []), e))
    for (let t = 1; t < 34; t++) {
      let n = t * rt,
        r = t % 5 == 0,
        i = document.createElementNS(`http://www.w3.org/2000/svg`, `line`);
      (i.setAttribute(`x1`, 818),
        i.setAttribute(`x2`, 818 + (r ? 13 : 6)),
        i.setAttribute(`y1`, n),
        i.setAttribute(`y2`, n),
        e.appendChild(i),
        vi.push({ el: i, y: n, long: r }));
    }
}
var wi = (e) => ((Si ||= e), (e - Si) / 1e3);
function Ti(e, t, n, r, i) {
  if (!fi) return;
  if (t <= 0 || i <= 0.001) {
    fi.style.opacity !== `0` && (fi.style.opacity = `0`);
    return;
  }
  fi.style.opacity = `1`;
  let a = innerWidth / et,
    o = innerWidth <= 720 ? innerWidth * 0.0475 - 818 * a : 0,
    s = innerHeight - innerHeight * t * (1 - n);
  pi.style.transform = `translate(${o.toFixed(2)}px,${s.toFixed(2)}px) scale(${a.toFixed(5)})`;
  let c = A.auto > 0.5 ? d(M() + A.lead, 0, 1) : A.ret,
    l = Math.min(0.8, c + A.retLen * 0.85),
    u = f(d((i - l) / Math.max(0.06, 1 - l), 0, 1));
  wi(r);
  let p = d((innerHeight * 0.92 - s) / a, 0, tt);
  if (mi) {
    ((mi.style.transform = `translateY(${p.toFixed(1)}px)`),
      (mi.style.opacity = (u * f(d((1 - e) / 0.08, 0, 1))).toFixed(3)));
    let t = Math.round((p / tt) * 100);
    t !== mi._p && ((mi._p = t), (mi.firstChild.textContent = t + `%`));
  }
  let m = 0;
  for (let e = 0; e < nt.length; e++) p >= nt[e] && (m = e);
  let h = nt[m],
    g = m + 1 < nt.length ? nt[m + 1] : tt,
    _ = 0;
  for (let e of vi) e.j = e.y >= h && e.y < g ? _++ : -1;
  for (let e = 0; e < vi.length; e++) {
    let t = vi[e],
      n = d((p - t.y) / 60, 0, 1),
      r = Math.exp(-Math.abs(p - t.y) / 190),
      i = 0.5 + 0.5 * Math.sin(p * 0.011 + e * 1.7),
      a = t.long ? 15 : 7,
      o = 0;
    if (t.j >= 0) {
      let e = _ > 1 ? 0.62 / (_ - 1) : 0;
      o = f(d((yi[m] - t.j * e) / 0.34, 0, 1));
    }
    let s = a * (0.55 + 0.75 * i + 0.9 * r) + o * (t.long ? 30 : 23);
    (t.el.setAttribute(`x2`, (818 + s).toFixed(1)),
      (t.el.style.opacity = (
        u * Math.max(n * ((t.long ? 0.62 : 0.38) + 0.38 * r), o * 0.96)
      ).toFixed(3)));
  }
  let v = xi ? Math.min(64, r - xi) : 16;
  xi = r;
  for (let t = 0; t < hi.length; t++) {
    let n = innerWidth <= 720,
      r = n ? e >= $e[t] : p >= nt[t],
      i = n && t + 1 < $e.length && e >= $e[t + 1],
      a = u > 0.1 && r && !i,
      o = t === 0 ? 340 : 0,
      s = v / 820;
    bi[t] = d(bi[t] + (a ? s : -s), 0, 1);
    let c = f(d(bi[t] + (a && o ? o / 820 : 0), 0, 1)),
      l = n ? 0 : (nt[t] - p) * 0.375;
    yi[t] = c;
    let m = c;
    ((hi[t].style.opacity = c.toFixed(3)),
      (hi[t].style.transform =
        `translateY(${(l + (1 - m) * 10).toFixed(1)}px)`));
    let h = gi[t];
    for (let e = 0; e < h.length; e++) {
      let t = d((m - e * 0.055) / 0.8, 0, 1);
      h[e].style.transform = `translateX(${((1 - t) * 115).toFixed(2)}%)`;
    }
    let g = d(m / 0.42, 0, 1),
      _ = d((m - 0.3) / 0.7, 0, 1);
    (_i[t][0] &&
      ((_i[t][0].style.opacity = g.toFixed(3)),
      (_i[t][0].style.transform = `translateY(${((1 - g) * 8).toFixed(1)}px)`)),
      _i[t][1] &&
        ((_i[t][1].style.opacity = _.toFixed(3)),
        (_i[t][1].style.transform =
          `translateY(${((1 - _) * 10).toFixed(1)}px)`)));
  }
}
function Ei(e) {
  fi && e > 0 && (fi.style.opacity = (1 - f(d(e / 0.16, 0, 1))).toFixed(3));
}
var Di = [];
function Oi() {
  Di = [...document.querySelectorAll(`.rail a`)].map((e) => ({
    el: e,
    at: parseFloat(e.dataset.at || `0`),
  }));
  for (let e of Di)
    e.el.addEventListener(`click`, (t) => {
      (t.preventDefault(),
        (L.target = d(e.at * R(), 0, R())),
        L.on || (st(L.target), scrollTo(0, L.target), (L.current = L.target)));
    });
}
function ki(e) {
  let t = -1;
  for (let n = 0; n < Di.length; n++) e >= Di[n].at - 0.002 && (t = n);
  for (let e = 0; e < Di.length; e++) {
    let n = e === t;
    n !== Di[e].on && ((Di[e].on = n), Di[e].el.classList.toggle(`on`, n));
  }
}
var Ai = new URLSearchParams(location.search),
  ji = Ai.has(`hud`),
  Mi = parseFloat(Ai.get(`drive`) || `0`),
  Ni = {
    nogl: Ai.has(`nogl`),
    nofin: Ai.has(`nofin`),
    noscrub: Ai.has(`noscrub`),
  },
  z = null,
  B = 0,
  Pi = 0,
  Fi = 0,
  Ii = 0,
  Li = 0,
  Ri = 0,
  zi = !1,
  Bi = 0,
  Vi = {};
function Hi(e) {
  if (!ji) return;
  let t = performance.now();
  (e && (Vi[e] = (Vi[e] || 0) + (t - Bi)), (Bi = t));
}
function Ui(e, t) {
  if (!ji && !Mi) return;
  if (!B) {
    B = e;
    return;
  }
  let n = e - B;
  if (((B = e), Mi)) {
    let e = document.documentElement.scrollHeight - innerHeight;
    scrollY < e && scrollBy(0, (e / (Mi * 1e3)) * n);
  }
  if (
    ji &&
    (z ||
      ((z = document.createElement(`div`)),
      (z.style.cssText = `position:fixed;top:70px;left:12px;z-index:99;padding:6px 10px;font:700 13px/1.4 monospace;color:#0f0;background:rgba(0,0,0,.72);pointer-events:none;white-space:pre-wrap;max-width:calc(100vw - 24px)`),
      document.body.appendChild(z)),
    (Pi += n),
    Fi++,
    (Ii = Math.max(Ii, n)),
    Li < 150 &&
      (Li++, n > 31 && n < 36 && Ri++, Li === 150 && (zi = Ri / Li > 0.8)),
    Pi >= 500)
  ) {
    let e = Object.values(Vi).reduce((e, t) => e + t, 0),
      n = Object.entries(Vi)
        .sort((e, t) => t[1] - e[1])
        .slice(0, 5)
        .map(([e, t]) => `${e} ${(t / Fi).toFixed(1)}`);
    z.textContent =
      (zi
        ? `LPM? rAF is 30Hz-quantised
`
        : ``) +
      `${Math.round(Fi / (Pi / 1e3))}fps worst ${Ii.toFixed(0)}ms\nroad ${(t * 100).toFixed(1)}%\n` +
      n.join(`  `) +
      `  unacct ${((Pi - e) / Fi).toFixed(1)}\n` +
      mt.map((e) => `${e.name} ${e.seq.loaded}/${e.count}`).join(` `);
    for (let e in Vi) delete Vi[e];
    ((Pi = 0), (Fi = 0), (Ii = 0));
  }
}
var Wi = !1;
export function initPearEngine(reel: Reel) {
  if (Wi) return;
  ((Wi = !0),
    `scrollRestoration` in history && (history.scrollRestoration = `manual`),
    scrollTo(0, 0),
    (L.target = L.current = 0),
    (document.documentElement.style.overflow = `hidden`));
  let e = !1,
    t = document.querySelector(`.boot-note`),
    n = () => {
      e ||
        ((e = !0),
        (document.documentElement.style.overflow = ``),
        t && (t.classList.add(`off`), setTimeout(() => t.remove(), 800)));
    };
  if ((setTimeout(n, 4e3), x(), ct(), un(), xn(), wr(), li(), Ni.nofin)) {
    let e = document.querySelector(`.fin`);
    e && e.style.setProperty(`display`, `none`, `important`);
  }
  (Ci(), Oi(), Yt());
  let r = reel,
    i = document.querySelector(`.src`);
  i.src = r.src;
  let a = () => (C ? 1 : 1.06),
    o = (e, t) => {
      if (!e || !t) return 0;
      let n = innerWidth / innerHeight,
        i = e / t;
      if (n >= i) return 0;
      let o = r.pos[innerWidth < 768 ? 0 : innerWidth < 1180 ? 1 : 2];
      return (1 - n / i / a()) * (o - 0.5);
    },
    s = document.querySelector(`.boot`),
    c = !1,
    l = !s,
    u = 0,
    m = 0,
    g = 0,
    _ = () => {
      try {
        i.duration &&
          i.buffered.length &&
          (u = Math.max(
            u,
            Math.min(0.92, i.buffered.end(i.buffered.length - 1) / i.duration),
          ));
      } catch {}
    };
  (i.addEventListener(`progress`, _),
    i.addEventListener(`loadedmetadata`, _),
    i.addEventListener(`canplaythrough`, () => {
      u = 1;
    }),
    i.addEventListener(`playing`, () => {
      u = 1;
    }));
  let S = () => {
      c ||
        !s ||
        ((c = !0),
        s.classList.add(`off`),
        s.addEventListener(
          `transitionend`,
          () => {
            (s.remove(), (l = !0));
          },
          { once: !0 },
        ));
    },
    te = (n) => {
      if (!s || c) return;
      let r = g ? Math.min(0.1, (n - g) / 1e3) : 0.016;
      ((g = n), (m = Math.min(u, m + r * 0.55)));
      let i = f(m);
      if (
        ((s.style.filter = `blur(${((1 - i) * 26).toFixed(1)}px) saturate(${(0.62 + 0.38 * i).toFixed(3)}) brightness(${(0.92 + 0.08 * i).toFixed(3)})`),
        (s.style.transform = `scale(${(a() * (1.06 - 0.06 * i)).toFixed(4)})`),
        t && !e)
      ) {
        let e = Math.round(m * 100);
        t._p !== e && ((t._p = e), (t.lastElementChild.textContent = e + `%`));
      }
      if (s.naturalWidth) {
        let e = innerHeight * (s.naturalWidth / s.naturalHeight),
          t = innerWidth - e;
        if (t < -1) {
          let n = o(s.naturalWidth, s.naturalHeight),
            r = ((t / 2 - n * e) / t) * 100;
          s.style.objectPosition = `${r.toFixed(2)}% 50%`;
        } else s.style.objectPosition = `50% 50%`;
      }
    };
  ((i.muted = !0), i.setAttribute(`muted`, ``));
  let w = () => {
    let e = i.play();
    e && e.catch(() => {});
  };
  (w(),
    i.addEventListener(`canplay`, w),
    i.addEventListener(`canplay`, n),
    i.addEventListener(`playing`, n),
    addEventListener(`pointerdown`, w, { once: !0 }));
  let M = matchMedia(`(max-width: 820px)`).matches ? `768` : `1440`,
    ge = Dt(r.bridge, M, T + E),
    _e = wt(`/films/plan`, 121, 2, T + E + ne, T + E + ne + re),
    ve = wt(`/films/coda`, 89, 3, T + E, T + E + ne + re),
    ye = wt(`/films/tree`, 121, 2, T + E + ne, 1 - ce - se - oe),
    { gl: P, canvas: Ce, tex: we, u: F, upload: Te, plate: Ee } = Nt(r),
    De = document.querySelector(`.stage`),
    I = () =>
      Ee.naturalWidth
        ? (Ee.naturalHeight * Ce.clientWidth) /
          (Ee.naturalWidth * Ce.clientHeight)
        : 0,
    Oe = [`breathe`, `slice`, `halftone`, `displace`, `static`, `ring`],
    ke = (new URLSearchParams(location.search).get(`t`) || ``).toLowerCase(),
    Ae = Oe.indexOf(ke) >= 0 ? Oe.indexOf(ke) : Oe.indexOf(`ring`),
    je = [
      `none`,
      `slabs`,
      `halftone`,
      `warp`,
      `tear`,
      `fine`,
      `mosaic`,
      `dither`,
      `shred`,
      `ditherblock`,
    ],
    Me = { overlap: [0.4, 1], after: [0.7, 1] },
    Pe = document.querySelector(`.ov`),
    Fe = document.createElement(`canvas`);
  ((Fe.width = 8), (Fe.height = 5));
  let Ie = Fe.getContext(`2d`, { willReadFrequently: !0 }),
    Le = !1,
    Re = 0;
  function ze(e) {
    if (!e) return;
    let t = e.videoWidth || e.naturalWidth,
      n = e.videoHeight || e.naturalHeight;
    if (!(!t || !n))
      try {
        innerWidth <= 720
          ? Ie.drawImage(e, t * 0.3, n * 0.15, t * 0.4, n * 0.75, 0, 0, 8, 5)
          : Ie.drawImage(e, 0, n * 0.18, t * 0.58, n * 0.68, 0, 0, 8, 5);
        let r = Ie.getImageData(0, 0, 8, 5).data,
          i = 0;
        for (let e = 0; e < r.length; e += 4)
          i += 0.299 * r[e] + 0.587 * r[e + 1] + 0.114 * r[e + 2];
        let a = i / (r.length / 4),
          o = innerWidth <= 720 ? a > (Le ? 150 : 185) : a > (Le ? 132 : 168);
        o !== Le && ((Le = o), Pe.classList.toggle(`on-light`, o));
      } catch {}
  }
  let Be = -1,
    Ve = null,
    qe = null,
    Je = null,
    Ye = 0,
    Xe = innerWidth <= 720 ? 1.5 : 2,
    Ze = Xe,
    Qe = 0,
    $e = 0,
    et = 0,
    tt = 0,
    nt = 0,
    rt = 0,
    it = !1,
    ot = performance.now();
  function R(t) {
    if (
      (requestAnimationFrame(R),
      te(t),
      !e && L.on && (L.target = L.current = 0),
      L.on)
    ) {
      let e = L.current;
      ((L.current += (L.target - L.current) * 0.085),
        Math.abs(L.target - L.current) < 0.08 && (L.current = L.target),
        (L.velocity = L.current - e),
        L.current !== e && (st(L.current), scrollTo(0, L.current)));
    } else
      ((L.velocity = scrollY - L.current),
        (L.target = scrollY),
        (L.current += (L.target - L.current) * 0.3),
        Math.abs(L.target - L.current) < 0.5 && (L.current = L.target));
    let c = I(),
      u = tt ? t - tt : 16.7;
    ((tt = t),
      innerWidth <= 720 &&
        (u > 26 ? (Qe++, ($e = 0)) : ($e++, (Qe = Math.max(0, Qe - 1))),
        Qe > 150 && Ze > 1 && t - et > 4e3
          ? ((Ze = Math.max(1, Ze - 0.25)), (Qe = 0), (et = t))
          : $e > 900 &&
            Ze < Xe &&
            t - et > 4e3 &&
            ((Ze = Math.min(Xe, Ze + 0.25)), ($e = 0), (et = t))));
    let g = Math.min(devicePixelRatio || 1, Ze),
      _ = 1,
      x = Math.round(Ce.clientWidth * g),
      C = Math.round(Ce.clientHeight * g);
    (Ce.width !== x || Ce.height !== C) &&
      ((Ce.width = x), (Ce.height = C), P.viewport(0, 0, x, C));
    let M = Math.max(1, De.offsetHeight - innerHeight),
      Oe = (e) => Ne(e, innerWidth <= 720),
      ke = Oe(d(L.current / M, 0, 1));
    (yt(Oe(d(L.target / M, 0, 1))),
      Ui(t, ke),
      Hi(),
      (b.x += (b.tx - b.x) * 0.055),
      (b.y += (b.ty - b.y) * 0.055));
    let Fe = d(ke / T, 0, 1),
      Ie = d((ke - T) / E, 0, 1),
      at = d((ke - T - E) / ne, 0, 1),
      ct = d((ke - T - E - ne) / re, 0, 1),
      lt = re * 0.25,
      ut = d((ke - T - E - ne - re + lt) / (ie + lt), 0, 1),
      dt = d((ke - (T + E + ne + re + ie)) / ae, 0, 1);
    nt = p(d(dt / 0.85, 0, 1));
    let ft = d(Fe / D, 0, 1),
      pt = d((Fe - D) / (O - D), 0, 1),
      mt = d((Fe - k.at) / k.len, 0, 1),
      ht = Ie;
    ((v.pan = ht), (v.raw = ke));
    let gt = ft * ft * (3 - 2 * ft);
    (i.readyState >= 2 &&
      (gt < 0.999
        ? (Te(0, we.A, i),
          P.uniform2f(F.uResA, i.videoWidth, i.videoHeight),
          i.paused && w(),
          n(),
          m > 0.99 && S())
        : i.paused || i.pause()),
      gt >= 0.999 && S());
    let _t = Math.round(pt * (ge.N - 1)),
      vt = ge.frameNear(_t);
    (vt &&
      vt !== Be &&
      ((Be = vt),
      Te(1, we.B, vt),
      P.uniform2f(F.uResB, vt.naturalWidth, vt.naturalHeight)),
      P.uniform2f(F.uRes, x, C));
    let bt = innerWidth <= 720,
      xt = i.videoWidth
        ? o(i.videoWidth, i.videoHeight)
        : s && s.naturalWidth
          ? o(s.naturalWidth, s.naturalHeight)
          : 0,
      St = (e) => (e / 1179) * x,
      Ct = (e) => (e / 2556) * C,
      wt = f(d((_t + 1 - (He[r.bridge] || 100)) / 8, 0, 1)),
      Tt = 0;
    if (xt && i.videoWidth) {
      let e = x / C,
        t = i.videoWidth / i.videoHeight;
      Tt = xt * x * (t / e);
    }
    (P.uniform1f(F.uPanPx, Tt + (St(-20) - Tt) * wt),
      P.uniform1f(F.uPanY, 0),
      P.uniform1f(F.uZoom, a() + (1 - a()) * wt),
      P.uniform1f(F.uZoomE, bt ? We.z : 1),
      P.uniform1f(F.uPanE, bt ? St(We.x) : 0),
      P.uniform1f(F.uPanEY, bt ? Ct(We.y) : 0));
    let Et = f(d((ht - Ge.at) / Math.max(0.05, Ge.span), 0, 1));
    (P.uniform3f(
      F.uPlateFit,
      bt ? St(Ge.x) * Et : 0,
      bt ? Ct(Ge.y) * Et : 0,
      bt ? 1 + (Ge.z - 1) * Et : 1,
    ),
      P.uniform1f(
        F.uPanG,
        bt
          ? St(Ue.x) * f(d((be(ut) - Ue.from) / Math.max(0.001, Ue.ramp), 0, 1))
          : 0,
      ),
      Hi(`film`),
      $t(i, ft, t, xt, a(), l ? null : { el: s, p: f(m) }),
      Hi(`mask`),
      P.uniform1f(F.uT, gt),
      P.uniform1f(F.uTime, t / 1e3),
      P.uniform1i(F.uMode, Ae));
    let Dt = Me.overlap,
      Ot = d((gt - Dt[0]) / (Dt[1] - Dt[0]), 0, 1);
    P.uniform1i(F.uMode2, je.indexOf(`fine`));
    let kt = d((mt - k.fxAt) / Math.max(0.001, k.fxLen), 0, 1),
      At = Math.sin(Math.PI * Ot),
      jt = mt > 0 && mt < 1 ? Math.sin(Math.PI * kt) * k.fx : 0;
    (P.uniform1f(F.uT2, Math.max(At, jt)),
      P.uniform1f(F.uBurn, mt),
      (le.x = k.x + k.dx / innerWidth),
      (le.y = k.y + k.dy / innerHeight),
      P.uniform1f(F.uBurnX, le.x),
      P.uniform1f(F.uBurnY, le.y),
      P.uniform2f(F.uBurnAB, k.ax, k.ay),
      P.uniform4f(F.uBurnFld, k.noise, k.grain, k.dither, k.hash),
      P.uniform4f(F.uBurnChr, k.char, k.charW, k.glowW, k.glowH),
      P.uniform1f(F.uSplit, j.part * f(d(mt / j.lag, 0, 1))),
      P.uniform2f(F.uBurnE, k.e0, k.e1));
    let Mt = k.at + A.over * k.len - A.len * (1 - h(j.at)),
      Nt = d((Fe - Mt) / Math.max(1e-4, k.at + k.len - Mt), 0, 1),
      Pt = Nt * (j.lin + (1 - j.lin) * Nt * Nt);
    ((v.push = Pt),
      P.uniform1f(F.uReelZ, 1 + j.zoom * Pt),
      P.uniform2f(F.uDrift, ue.driftX * Pt, ue.driftY * Pt),
      P.uniform1f(F.uMBlur, ue.mblur * Pt),
      P.uniform1f(F.uSpin, j.spin * Pt),
      P.uniform1f(
        F.uEdgeBl,
        ue.edgeBl *
          f(d((mt - ue.edgeAt) / Math.max(0.02, 1 - ue.edgeAt), 0, 1)),
      ),
      P.uniform1f(
        F.uSeam,
        k.seam * f(d(mt / 0.55, 0, 1)) * (1 - f(d((mt - 0.55) / 0.4, 0, 1))),
      ),
      P.uniform2f(F.uSeamWH, k.seamW, k.seamH),
      P.uniform3f(F.uSeamCol, 0.898, 0.882, 0.839),
      P.uniform1f(F.uSeamSoft, Math.max(0.002, k.seamSoft)));
    let Ft = k.at + k.zoomAt * k.len,
      It = f(d((Fe - Ft) / Math.max(1e-4, 1 - Ft), 0, 1)),
      Lt = 1 + k.zoom * (1 - f(mt)) + k.zoomPan * It;
    ((y.x = innerWidth * (818 / 1328)),
      P.uniform1f(F.uPlateZ, Lt),
      P.uniform1i(F.uShape, k.shape | 0));
    let Rt = c > 0 ? (1 - 1 / c) * (1 - ht) : 0;
    if (
      (c > 0 && P.uniform1f(F.uPan, Rt),
      Hi(`uni`),
      at <= 0.2 && Ti(ht, c, Rt, t, mt),
      Hi(`plate`),
      at > 0 && rt < 0.999)
    ) {
      let e = Math.min(88, Math.round(at * 88));
      if ((ve.aim(e), ve.ready && !Ni.noscrub)) {
        let t = ve.near(e);
        t &&
          t !== Ve &&
          _ > 0 &&
          (_--,
          (Ve = t),
          Te(3, we.E, t),
          P.uniform2f(F.uResE, t.naturalWidth, t.naturalHeight));
      }
    }
    if (
      ((Ye = ve.ready ? Math.min(1, Ye + 0.055) : 0),
      P.uniform1f(F.uCoda, f(d(at / xe, 0, 1)) * Ye),
      P.uniform1f(F.uFlat, f(d((at - Se) / (1 - Se), 0, 1))),
      (v.coda = at),
      (v.end = ct),
      ct > 0 && ke < 0.7489719626168224)
    ) {
      let e = be(ut),
        t = Math.max(
          0,
          Math.min(120, Math.round(e * 120) - Math.round(nt * 36)),
        );
      if ((ye.aim(t), ye.ready && !Ni.noscrub)) {
        let e = ye.near(t);
        e &&
          e !== qe &&
          _ > 0 &&
          (_--,
          (qe = e),
          Te(4, we.G, e),
          P.uniform2f(F.uResG, e.naturalWidth, e.naturalHeight));
      }
    }
    (Hi(`tex`),
      (rt = ui(ut, ct, t)),
      Hi(`fin`),
      (ee.lit = at > 0.44 && rt < 0.55),
      P.uniform3f(F.uPaperC, N.r / 255, N.g / 255, N.b / 255),
      P.uniform4f(F.uRay1, N.speed, N.drift, N.jiggle, N.scale),
      P.uniform4f(F.uRay2, N.depth, N.breathe, N.rake, N.cycle),
      P.uniform4f(F.uPap, N.pulp, N.fibre, N.tooth, N.fleck),
      P.uniform3f(F.uDrag, N.lag, N.lagD, N.smear));
    let zt = d((ke - (T + E + ne)) / fe, 0, 1);
    if (((v.plan = zt), ke > 0.3725233644859813 && rt < 0.999)) {
      let e = d((ke - (T + E + ne)) / (fe * pe), 0, 1),
        t = Math.min(120, Math.round(e * 120));
      if ((_e.aim(t), _e.ready && !Ni.noscrub)) {
        let e = _e.near(t);
        e &&
          e !== Je &&
          _ > 0 &&
          (_--,
          (Je = e),
          Te(5, we.P, e),
          P.uniform2f(F.uResP, e.naturalWidth, e.naturalHeight));
      }
    }
    (P.uniform4f(F.uPlan2, Je ? f(d(zt / he, 0, 1)) : 0, 0, 0, 0),
      P.uniform4f(F.uPlan3, N.zoom, N.panX, N.panY, 0),
      P.uniform4f(
        F.uPlan,
        f(d((zt - me[0]) / me[1], 0, 1)),
        bt ? Ke.x : N.keyX,
        bt ? Ke.y : N.keyY,
        bt ? Ke.s : N.keyS,
      ),
      Cn(dt),
      Hi(`faq`));
    let Bt = wn(dt),
      Vt = d((ke - (T + E + ne + re + ie + ae)) / oe, 0, 1);
    (Dr(Vt),
      Fr(d((ke - (T + E + ne + re + ie + ae + oe)) / se, 0, 1), Vt),
      Br(d((ke - (T + E + ne + re + ie + ae + oe + se)) / ce, 0, 1)),
      di(ut, Bt),
      Hi(`sky`),
      P.uniform1f(F.uEnd, qe ? (rt >= 0.94 ? 1 : rt) : 0),
      P.uniform1f(F.uScrim, 0.18 * f(d((Fe - 0.26) / 0.08, 0, 1))),
      P.uniform4f(F.uEndF, de.noise, de.grain, de.dither, de.hash),
      P.uniform4f(F.uEndC, de.charW, de.charBack, de.char, de.glowW),
      Ei(at),
      !Ni.nogl && Vt <= 0.06 && P.drawArrays(P.TRIANGLES, 0, 3),
      Hi(`gl`),
      !it && (L.current > 6 || t - ot > 620) && ((it = !0), fn(t, 425)),
      mn(Fe, t),
      ki(ke),
      Hi(`ov`),
      t - Re > 160 &&
        ((Re = t),
        ee.lit
          ? Pe.classList.contains(`on-light`) ||
            ((Le = !0), Pe.classList.add(`on-light`))
          : ze(
              mt > 0.5
                ? Ee.naturalWidth
                  ? Ee
                  : null
                : gt < 0.5
                  ? i.readyState >= 2
                    ? i
                    : null
                  : vt,
            )));
  }
  requestAnimationFrame(R);
}