// @ts-nocheck
/* eslint-disable */
// Kit d’animations du logo (18/11/2026). Source : /mnt/project-files/kit-logo. Ne pas modifier à la main.
/* Loomina — moteur d'animation du logo (Web Animations API, sans dépendance).
   Toutes les animations partent des tracés vectorisés du vrai logo (geom.js). */
(function () {
  const G = window.LOOMINA_GEOM;
  const NS = 'http://www.w3.org/2000/svg';
  const ORDER = ['L', 'o1', 'o2', 'm', 'i', 'n', 'a'];

  const EASE = {
    outExpo: 'cubic-bezier(.16,1,.3,1)',
    outQuart: 'cubic-bezier(.25,1,.5,1)',
    inOut: 'cubic-bezier(.65,0,.35,1)',
    spring: 'cubic-bezier(.34,1.56,.64,1)',
    inQuad: 'cubic-bezier(.5,0,.75,0)',
  };

  const COLORS = {
    ink: '#111111', star: '#EE9B2D', white: '#FFFFFF',
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // chemin dans un <g translate> : on anime le <path> sans écraser la position
  function glyph(parent, p, fill, id) {
    const g = el('g', { transform: `translate(${p.tx},${p.ty})` }, parent);
    const path = el('path', { d: p.d, fill }, g);
    if (id) path.id = id;
    path.style.transformBox = 'fill-box';
    path.style.transformOrigin = '50% 50%';
    return path;
  }

  function theme(opts) {
    const t = opts.theme || 'light';
    if (t === 'dark') return { ink: COLORS.white, star: COLORS.star };
    if (t === 'mono-dark') return { ink: COLORS.ink, star: COLORS.ink };
    if (t === 'mono-light') return { ink: COLORS.white, star: COLORS.white };
    return { ink: COLORS.ink, star: COLORS.star };
  }

  /* ---------- scènes ---------- */
  function wordmark(svg, c, opts = {}) {
    const root = el('g', {}, svg);
    const letters = {};
    const clipId = 'clip' + Math.random().toString(36).slice(2);
    if (opts.clip) {
      const cp = el('clipPath', { id: clipId }, svg);
      el('rect', { x: -200, y: -2000, width: 5000, height: 3212 }, cp); // coupe sous la ligne de base
    }
    const lg = el('g', opts.clip ? { 'clip-path': `url(#${clipId})` } : {}, root);
    ORDER.forEach(k => { letters[k] = glyph(lg, G.letters[k], c.ink); });
    const star = glyph(root, G.star, c.star);
    return { root, letters, star };
  }

  function monogram(svg, c) {
    const root = el('g', {}, svg);
    const L = glyph(root, G.monoL, c.ink);
    const star = glyph(root, G.monoStar, c.star);
    return { root, L, star };
  }

  function starOnly(svg, c) {
    const root = el('g', {}, svg);
    const star = glyph(root, G.monoStar, c.star);
    return { root, star };
  }

  const VB = {
    wordmark: '-260 -260 4810 1740',
    mono: '330 -60 1580 2180',
    star: '1040 30 626 718',
  };

  /* ---------- bibliothèque d'animations ---------- */
  const A = {};

  // 1. Révélation — intro du logo
  A.revelation = {
    label: 'Révélation', use: 'Intro de vidéo, ouverture du site, écran de chargement long',
    duration: 2400, loop: false, vb: VB.wordmark,
    build(svg, c) {
      const w = wordmark(svg, c, { clip: true });
      const an = [];
      ORDER.forEach((k, i) => {
        an.push(w.letters[k].animate([
          { transform: 'translateY(105%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 1000, delay: 120 + i * 70, easing: EASE.outExpo, fill: 'both' }));
      });
      an.push(w.star.animate([
        { transform: 'translateY(-60%) rotate(-135deg) scale(0)', opacity: 0, offset: 0 },
        { transform: 'translateY(4%) rotate(8deg) scale(1.12)', opacity: 1, offset: .62 },
        { transform: 'translateY(0) rotate(0) scale(1)', opacity: 1, offset: 1 }
      ], { duration: 1100, delay: 900, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, w.star, 1950, c));
      return an;
    }
  };

  // 2. Le fil — signature de fin (Loomina = métier à tisser, « le fil de nos jours »)
  A.fil = {
    label: 'Le fil', use: 'Signature de fin de vidéo et de pub, fin d\'appel de démo',
    duration: 3400, loop: false, vb: VB.wordmark,
    build(svg, c) {
      const cid = 'reveal' + Math.random().toString(36).slice(2);
      const cp = el('clipPath', { id: cid }, svg);
      const rect = el('rect', { x: -100, y: -400, width: 0, height: 1700 }, cp);
      const w = wordmark(svg, c);
      w.root.querySelectorAll(':scope > g:first-child').forEach(g => g.setAttribute('clip-path', `url(#${cid})`));
      const thread = el('line', { x1: -60, y1: 1262, x2: -60, y2: 1262, stroke: c.star, 'stroke-width': 34, 'stroke-linecap': 'round' }, svg);
      const an = [];
      // le fil se tend de gauche à droite et dévoile les lettres
      an.push(anim(rect, 'width', 0, 4500, 1500, 150, EASE.inOut));
      an.push(anim(thread, 'x2', -60, 4330, 1500, 150, EASE.inOut));
      // puis il se rembobine vers le point du i
      an.push(anim(thread, 'x1', -60, 2719, 700, 1650, EASE.inOut, 1, 0, true));
      an.push(anim(thread, 'x2', 4330, 2719, 700, 1650, EASE.inOut, 1, 0, true));
      an.push(thread.animate([{ opacity: 1 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: 2400, delay: 0, fill: 'both' }));
      // et devient l'étoile
      an.push(w.star.animate([
        { transform: 'translateY(280%) scale(0) rotate(-360deg)', opacity: 0, offset: 0 },
        { transform: 'translateY(280%) scale(.15) rotate(-300deg)', opacity: 1, offset: .25 },
        { transform: 'translateY(-6%) scale(1.1) rotate(-20deg)', opacity: 1, offset: .8 },
        { transform: 'translateY(0) scale(1) rotate(0)', opacity: 1, offset: 1 }
      ], { duration: 1000, delay: 2150, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, w.star, 2700, c));
      return an;
    }
  };

  // 3. Monogramme — splash, app, avatar
  A.monogramme = {
    label: 'Monogramme', use: 'Écran de démarrage, avatar animé, ouverture de l\'espace auteur',
    duration: 1900, loop: false, vb: VB.mono,
    build(svg, c) {
      const cid = 'mc' + Math.random().toString(36).slice(2);
      const cp = el('clipPath', { id: cid }, svg);
      el('rect', { x: -500, y: -1000, width: 3000, height: 2570 }, cp);
      const m = monogram(svg, c);
      m.L.parentNode.setAttribute('clip-path', `url(#${cid})`);
      const an = [];
      an.push(m.L.animate([
        { transform: 'translateY(102%)' }, { transform: 'translateY(0)' }
      ], { duration: 950, delay: 100, easing: EASE.outExpo, fill: 'both' }));
      an.push(m.star.animate([
        { transform: 'rotate(-180deg) scale(0)', opacity: 0 },
        { transform: 'rotate(10deg) scale(1.15)', opacity: 1, offset: .65 },
        { transform: 'rotate(0) scale(1)', opacity: 1 }
      ], { duration: 1000, delay: 650, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, m.star, 1550, c));
      return an;
    }
  };

  // 4. Monogramme ↔ logo — l'en-tête qui se replie au défilement
  A.morph = {
    label: 'Repli', use: 'En-tête du site qui se replie au défilement, passage logo ↔ icône',
    duration: 2600, loop: false, vb: VB.wordmark,
    build(svg, c) {
      const w = wordmark(svg, c);
      const rest = ['o1', 'o2', 'm', 'i', 'n', 'a'];
      const mid = 'mk' + Math.random().toString(36).slice(2);
      const mcp = el('clipPath', { id: mid }, svg);
      el('rect', { x: 566, y: -2000, width: 5000, height: 4000 }, mcp);
      const restG = el('g', { 'clip-path': `url(#${mid})` }, w.root.firstChild);
      rest.forEach(r => restG.appendChild(w.letters[r].parentNode));
      const dx = 405 - 2719.5, dy = 161.6 - 205.6;       // étoile posée en haut à droite du L
      const shift = (4290 - 600) / 2;                     // recentrage du monogramme
      const an = [];
      // état replié -> déplié -> replié
      const k = (a, b) => [
        { transform: a, offset: 0 }, { transform: a, offset: .12 },
        { transform: b, offset: .46 }, { transform: b, offset: .62 },
        { transform: a, offset: .96 }, { transform: a, offset: 1 }];
      an.push(w.root.animate(k(`translateX(${shift}px)`, 'translateX(0)'), { duration: 2600, easing: EASE.inOut, fill: 'both' }));
      rest.forEach((r, i) => {
        an.push(w.letters[r].animate([
          { opacity: 0, transform: 'translateX(-40%) scale(.9)', offset: 0 },
          { opacity: 0, transform: 'translateX(-40%) scale(.9)', offset: .14 + i * .012 },
          { opacity: 1, transform: 'none', offset: .44 + i * .012 },
          { opacity: 1, transform: 'none', offset: .62 + (5 - i) * .012 },
          { opacity: 0, transform: 'translateX(-40%) scale(.9)', offset: .9 - i * .01 },
          { opacity: 0, transform: 'translateX(-40%) scale(.9)', offset: 1 }
        ], { duration: 2600, easing: EASE.inOut, fill: 'both' }));
      });
      an.push(w.star.animate([
        { transform: `translate(${dx}px,${dy}px) rotate(0)`, offset: 0 },
        { transform: `translate(${dx}px,${dy}px) rotate(0)`, offset: .12 },
        { transform: 'translate(0,0) rotate(360deg)', offset: .46 },
        { transform: 'translate(0,0) rotate(360deg)', offset: .62 },
        { transform: `translate(${dx}px,${dy}px) rotate(720deg)`, offset: .96 },
        { transform: `translate(${dx}px,${dy}px) rotate(720deg)`, offset: 1 }
      ], { duration: 2600, easing: EASE.inOut, fill: 'both' }));
      return an;
    }
  };

  // 5. Loomina écrit — chargement (boucle)
  A.ecrit = {
    label: 'Loomina écrit', use: 'Chargement, rédaction du livre en cours, bouton en attente',
    duration: 1800, loop: true, vb: VB.star,
    build(svg, c) {
      const s = starOnly(svg, c);
      return [s.star.animate([
        { transform: 'rotate(0) scale(1)' },
        { transform: 'rotate(180deg) scale(.7)', offset: .5 },
        { transform: 'rotate(360deg) scale(1)' }
      ], { duration: 1800, easing: EASE.inOut, iterations: Infinity })];
    }
  };

  // 6. À l'écoute — appel en cours (boucle)
  A.ecoute = {
    label: 'À l\'écoute', use: 'Appel en cours, micro ouvert, « Loomina vous écoute »',
    duration: 2400, loop: true, vb: '760 -250 1280 1280',
    build(svg, c) {
      const an = [];
      const cx = 1353, cy = 389;
      for (let i = 0; i < 3; i++) {
        const ring = el('circle', { cx, cy, r: 270, fill: 'none', stroke: c.star, 'stroke-width': 16 }, svg);
        ring.style.transformBox = 'fill-box'; ring.style.transformOrigin = '50% 50%';
        an.push(ring.animate([
          { transform: 'scale(.95)', opacity: .7 },
          { transform: 'scale(2.3)', opacity: 0 }
        ], { duration: 2400, delay: i * 800 - 2400, easing: EASE.outQuart, iterations: Infinity }));
      }
      const s = starOnly(svg, c);
      an.push(s.star.animate([
        { transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: .18 },
        { transform: 'scale(.96)', offset: .34 }, { transform: 'scale(1)', offset: .5 }, { transform: 'scale(1)' }
      ], { duration: 1200, easing: EASE.inOut, iterations: Infinity }));
      return an;
    }
  };

  // 7. Survol — micro-interaction du logo d'en-tête
  A.survol = {
    label: 'Survol', use: 'Survol du logo dans l\'en-tête, retour à l\'accueil',
    duration: 1400, loop: true, vb: VB.wordmark,
    build(svg, c) {
      const w = wordmark(svg, c);
      return [w.star.animate([
        { transform: 'rotate(0) scale(1)', offset: 0 },
        { transform: 'rotate(0) scale(1)', offset: .2 },
        { transform: 'rotate(200deg) scale(1.22)', offset: .45 },
        { transform: 'rotate(360deg) scale(1)', offset: .7 },
        { transform: 'rotate(360deg) scale(1)', offset: 1 }
      ], { duration: 1400, easing: EASE.spring, iterations: Infinity }),
      ...glint(svg, w.star, 650, c, Infinity, 1400)];
    }
  };

  // 8. Livre prêt — succès
  A.pret = {
    label: 'Livre prêt', use: 'Livre terminé, paiement confirmé, chapitre ajouté',
    duration: 1800, loop: false, vb: '700 -310 1310 1400',
    build(svg, c) {
      const an = [];
      const cx = 1353, cy = 389;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const big = i % 2 === 0;
        const dot = el('circle', { cx, cy, r: big ? 30 : 20, fill: c.star }, svg);
        const d = big ? 560 : 430;
        an.push(dot.animate([
          { transform: 'translate(0,0) scale(0)', opacity: 0 },
          { transform: `translate(${Math.cos(a) * d * .55}px,${Math.sin(a) * d * .55}px) scale(1)`, opacity: 1, offset: .35 },
          { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity: 0 }
        ], { duration: 900, delay: 420, easing: EASE.outQuart, fill: 'both' }));
      }
      const s = starOnly(svg, c);
      an.push(s.star.animate([
        { transform: 'scale(0) rotate(-90deg)' },
        { transform: 'scale(1.28) rotate(10deg)', offset: .45 },
        { transform: 'scale(.94) rotate(0)', offset: .7 },
        { transform: 'scale(1) rotate(0)' }
      ], { duration: 1000, delay: 120, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, s.star, 1300, c));
      return an;
    }
  };

  // 9. Scintillement — logo vivant au repos (boucle lente)
  A.scintille = {
    label: 'Scintillement', use: 'Logo au repos sur l\'accueil, fond d\'écran, attente longue',
    duration: 5000, loop: true, vb: VB.wordmark,
    build(svg, c) {
      const w = wordmark(svg, c);
      const an = [];
      // reflet lumineux qui balaie les lettres
      const gid = 'sh' + Math.random().toString(36).slice(2);
      const defs = el('defs', {}, svg);
      const lg = el('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0, gradientUnits: 'objectBoundingBox' }, defs);
      const tint = c.ink === COLORS.white ? '#F6D9A8' : '#7A5A2A';
      [['0', c.ink, 1], ['.42', c.ink, 1], ['.5', tint, 1], ['.58', c.ink, 1], ['1', c.ink, 1]].forEach(([o, col]) =>
        el('stop', { offset: o, 'stop-color': col }, lg));
      ORDER.forEach(k => w.letters[k].setAttribute('fill', `url(#${gid})`));
      // une seule bande pour tout le mot : gradient en espace utilisateur
      lg.setAttribute('gradientUnits', 'userSpaceOnUse');
      lg.setAttribute('x1', -1500); lg.setAttribute('x2', 0);
      an.push(anim(lg, 'x1', -2600, 4400, 2200, 600, EASE.inOut, Infinity, 5000));
      an.push(anim(lg, 'x2', -1600, 5400, 2200, 600, EASE.inOut, Infinity, 5000));
      // les lettres sont translatées : on compense via gradientTransform par lettre -> plus simple : un gradient par lettre
      ORDER.forEach(k => {
        const p = G.letters[k];
        const g2 = lg.cloneNode(true); g2.id = gid + k; defs.appendChild(g2);
        g2.setAttribute('gradientTransform', `translate(${-p.tx},0)`);
        w.letters[k].setAttribute('fill', `url(#${g2.id})`);
        an.push(anim(g2, 'x1', -2600, 4400, 2200, 600, EASE.inOut, Infinity, 5000));
        an.push(anim(g2, 'x2', -1600, 5400, 2200, 600, EASE.inOut, Infinity, 5000));
      });
      an.push(w.star.animate([
        { transform: 'rotate(0) scale(1)', offset: 0 },
        { transform: 'rotate(0) scale(1)', offset: .5 },
        { transform: 'rotate(200deg) scale(1.15)', offset: .6 },
        { transform: 'rotate(360deg) scale(1)', offset: .72 },
        { transform: 'rotate(360deg) scale(1)', offset: 1 }
      ], { duration: 5000, easing: EASE.inOut, iterations: Infinity }));
      an.push(...glint(svg, w.star, 3200, c, Infinity, 5000));
      return an;
    }
  };

  /* ---------- outils ---------- */
  // éclat : petite croix lumineuse qui traverse l'étoile
  function glint(svg, star, delay, c, iterations = 1, period) {
    const bb = star.getBBox();
    const t = star.parentNode.transform.baseVal.consolidate().matrix;
    const cx = bb.x + t.e + bb.width * .5, cy = bb.y + t.f + bb.height * .5;
    const holder = el('g', { transform: `translate(${cx},${cy})` }, svg);
    const spin = el('g', {}, holder);
    const fill = c.star === COLORS.ink ? '#666' : '#FFF6E2';
    const d = 'M0,-9 C14,-14 14,-14 120,0 C14,14 14,14 0,9 C-14,14 -14,14 -120,0 C-14,-14 -14,-14 0,-9Z';
    el('path', { d, fill }, spin);
    el('path', { d, fill, transform: 'rotate(90) scale(.8)' }, spin);
    const dur = 700;
    if (iterations === Infinity) {
      const o0 = delay / period, o1 = Math.min((delay + dur) / period, 1);
      return [spin.animate([
        { transform: 'scale(0) rotate(0)', opacity: 0, offset: 0 },
        { transform: 'scale(0) rotate(0)', opacity: 0, offset: o0 },
        { transform: 'scale(1.6) rotate(45deg)', opacity: .95, offset: (o0 + o1) / 2 },
        { transform: 'scale(0) rotate(90deg)', opacity: 0, offset: o1 },
        { transform: 'scale(0) rotate(90deg)', opacity: 0, offset: 1 }
      ], { duration: period, iterations: Infinity })];
    }
    return [spin.animate([
      { transform: 'scale(0) rotate(0)', opacity: 0 },
      { transform: 'scale(1.6) rotate(45deg)', opacity: .95, offset: .5 },
      { transform: 'scale(0) rotate(90deg)', opacity: 0 }
    ], { duration: dur, delay, easing: EASE.outQuart, fill: 'both' })];
  }

  // anime un attribut SVG numérique via une animation « porteuse »
  function anim(node, attr, from, to, duration, delay, easing, iterations = 1, period, skipBefore = false) {
    const proxy = document.createElement('i');
    const opts = iterations === Infinity
      ? { duration: period, iterations: Infinity }
      : { duration, delay, fill: 'both', easing };
    let kf;
    if (iterations === Infinity) {
      const a = delay / period, b = (delay + duration) / period;
      kf = [{ '--p': 0, offset: 0 }, { '--p': 0, offset: a, easing }, { '--p': 1, offset: b }, { '--p': 1, offset: 1 }];
    } else kf = [{ '--p': 0 }, { '--p': 1 }];
    // évalue l'easing à la main pour rester déterministe pendant le rendu image par image
    const a = proxy.animate([{ opacity: 0 }, { opacity: 1 }], opts);
    const ease = bezier(easing);
    const tick = () => {
      const ct = a.currentTime || 0;
      let p;
      if (iterations === Infinity) {
        const tt = ct % period;
        p = tt < delay ? 0 : tt > delay + duration ? 1 : ease((tt - delay) / duration);
      } else {
        if (skipBefore && ct < delay) return;
        p = ct < delay ? 0 : ct > delay + duration ? 1 : ease((ct - delay) / duration);
      }
      node.setAttribute(attr, from + (to - from) * p);
    };
    a._tick = tick;
    TICKERS.add(a);
    return a;
  }
  const TICKERS = new Set();
  (function loop() { TICKERS.forEach(a => a._tick()); requestAnimationFrame(loop); })();

  function bezier(str) {
    const m = /cubic-bezier\(([^)]+)\)/.exec(str || '');
    if (!m) return t => t;
    const [x1, y1, x2, y2] = m[1].split(',').map(Number);
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { let t = x; for (let i = 0; i < 8; i++) { const d = sx(t) - x; if (Math.abs(d) < 1e-5) break; t -= d / (dx(t) || 1e-6); } return sy(Math.min(1, Math.max(0, t))); };
  }

  /* ---------- API publique ---------- */
  function mount(container, name, opts = {}) {
    const def = A[name];
    container.innerHTML = '';
    const svg = el('svg', { viewBox: opts.vb || def.vb, width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }, container);
    svg.style.overflow = 'visible';
    const anims = def.build(svg, theme(opts));
    const api = {
      anims, def,
      play() { anims.forEach(a => { a.currentTime = 0; a.play(); }); },
      pause() { anims.forEach(a => a.pause()); },
      seek(t) { anims.forEach(a => { a.pause(); a.currentTime = t; a._tick && a._tick(); }); },
    };
    if (opts.paused) api.seek(0);
    return api;
  }

  function staticLogo(container, kind, opts = {}) {
    container.innerHTML = '';
    const vb = { wordmark: '-60 -40 4410 1300', mono: '520 40 1200 1960', star: '1060 60 590 660' }[kind];
    const svg = el('svg', { viewBox: vb, width: '100%', height: '100%' }, container);
    const c = theme(opts);
    if (kind === 'wordmark') wordmark(svg, c);
    else if (kind === 'mono') monogram(svg, c);
    else starOnly(svg, c);
    return svg;
  }

  window.Loomina = { mount, staticLogo, list: A, EASE, COLORS, VB,
    _: { el, glyph, wordmark, monogram, starOnly, glint, anim, bezier, G, ORDER, theme } };
})();

export {};
