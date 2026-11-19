// @ts-nocheck
/* eslint-disable */
// Kit d’animations du logo (18/11/2026). Source : /mnt/project-files/kit-logo. Ne pas modifier à la main.
/* Loomina — animations supplémentaires et personnage « l'Étincelle ». Nécessite kit-core.js. */
(function () {
  const { list: A, EASE, VB } = window.Loomina;
  const { el, glyph, wordmark, starOnly, glint, anim, G, ORDER } = window.Loomina._;
  const BB = G.bbox;
  const cx = k => BB[k][0] + BB[k][2] / 2;
  const STAR = { x: 2719.5, y: 205.6 };
  const uid = p => p + Math.random().toString(36).slice(2);

  // 10. Tracé à la plume — chaque lettre se dessine puis s'encre
  A.plume = {
    label: 'Tracé à la plume', use: 'Intro de pub plus lente et émotive, page « Notre histoire », vidéo de marque',
    duration: 3400, loop: false, vb: VB.wordmark, group: 'pub',
    build(svg, c) {
      const w = wordmark(svg, c);
      const an = [];
      ORDER.forEach((k, i) => {
        const p = w.letters[k];
        p.setAttribute('pathLength', 1);
        p.style.stroke = c.ink; p.style.strokeWidth = 9; p.style.strokeDasharray = '1 1';
        an.push(p.animate([
          { strokeDashoffset: 1, fillOpacity: 0 },
          { strokeDashoffset: 0, fillOpacity: 0, offset: .72 },
          { strokeDashoffset: 0, fillOpacity: 1 }
        ], { duration: 1500, delay: 150 + i * 210, easing: EASE.inOut, fill: 'both' }));
      });
      const s = w.star;
      s.setAttribute('pathLength', 1);
      s.style.stroke = c.star; s.style.strokeWidth = 9; s.style.strokeDasharray = '1 1';
      an.push(s.animate([
        { strokeDashoffset: 1, fillOpacity: 0, transform: 'scale(.9)' },
        { strokeDashoffset: 0, fillOpacity: 0, transform: 'scale(.9)', offset: .55 },
        { strokeDashoffset: 0, fillOpacity: 1, transform: 'scale(1.1)', offset: .8 },
        { strokeDashoffset: 0, fillOpacity: 1, transform: 'scale(1)' }
      ], { duration: 1100, delay: 1900, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, s, 2750, c));
      return an;
    }
  };

  // 11. L'étoile écrit — l'étoile sert de plume, saute de lettre en lettre puis devient le point du i
  A.etoilePlume = {
    label: 'L\'étoile écrit', use: 'Section « Loomina écrit votre livre », intro de pub, chargement de l\'espace auteur',
    duration: 3270, loop: false, vb: VB.wordmark, group: 'pub',
    build(svg, c) {
      const w = wordmark(svg, c, { clip: true });
      const an = [];
      const step = 260, t0 = 250;
      const xs = ORDER.map(k => cx(k));
      // l'étoile part de la gauche, survole chaque lettre en petits sauts
      const kf = [{ transform: `translate(${-400 - STAR.x}px, ${260}px) scale(.55) rotate(-200deg)`, opacity: 0, offset: 0 }];
      const total = t0 + step * ORDER.length + 900;
      xs.forEach((x, i) => {
        const t = (t0 + step * i) / total;
        kf.push({ transform: `translate(${x - STAR.x}px, ${150}px) scale(.55) rotate(${-180 + i * 26}deg)`, opacity: 1, offset: t });
        kf.push({ transform: `translate(${x + step * .5 * 0 + 120 - STAR.x}px, ${40}px) scale(.55) rotate(${-170 + i * 26}deg)`, opacity: 1, offset: t + step / total / 2 });
      });
      kf.push({ transform: `translate(${4500 - STAR.x}px, ${120}px) scale(.55) rotate(0deg)`, opacity: 1, offset: (t0 + step * 7) / total });
      kf.push({ transform: 'translate(0,-12%) scale(1.15) rotate(340deg)', opacity: 1, offset: (total - 350) / total });
      kf.push({ transform: 'translate(0,0) scale(1) rotate(360deg)', opacity: 1, offset: 1 });
      an.push(w.star.animate(kf, { duration: total, easing: 'linear', fill: 'both' }));
      ORDER.forEach((k, i) => {
        an.push(w.letters[k].animate([
          { transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }
        ], { duration: 700, delay: t0 + step * i + 60, easing: EASE.outExpo, fill: 'both' }));
      });
      an.push(...glint(svg, w.star, total - 150, c));
      return an;
    }
  };

  // 12. De la voix au livre — une onde de voix devient le fil, puis le nom, puis l'étoile
  A.voix = {
    label: 'De la voix au livre', use: 'Cœur de la pub, section « Comment ça marche », fin d\'un appel',
    duration: 4200, loop: false, vb: VB.wordmark, group: 'pub',
    build(svg, c) {
      const an = [];
      const cid = uid('vx');
      const cp = el('clipPath', { id: cid }, svg);
      const rect = el('rect', { x: -100, y: -400, width: 0, height: 1700 }, cp);
      const w = wordmark(svg, c);
      w.root.firstChild.setAttribute('clip-path', `url(#${cid})`);
      const N = 44, x0 = 40, x1 = 4250, midY = 830;
      const bars = el('g', {}, svg);
      for (let i = 0; i < N; i++) {
        const x = x0 + (x1 - x0) * i / (N - 1);
        const env = Math.sin(Math.PI * i / (N - 1));
        const b = el('rect', { x: x - 22, y: midY - 260, width: 44, height: 520, rx: 22, fill: c.star }, bars);
        b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 50%';
        const amp = n => Math.max(.06, env * (.25 + .75 * Math.abs(Math.sin(i * 1.7 + n * 2.3))));
        const k = [];
        for (let f = 0; f <= 8; f++) k.push({ transform: `scaleY(${amp(f).toFixed(3)})`, offset: f / 8 * .42 });
        k.push({ transform: 'scaleY(.07)', offset: .5 });
        const reveal = .55 + .3 * i / (N - 1);
        k.push({ transform: 'scaleY(.07)', opacity: 1, offset: reveal });
        k.push({ transform: 'scaleY(.07)', opacity: 0, offset: Math.min(reveal + .04, 1) });
        k.push({ transform: 'scaleY(.07)', opacity: 0, offset: 1 });
        an.push(b.animate(k, { duration: 3000, easing: EASE.inOut, fill: 'both' }));
      }
      // révélation des lettres derrière l'onde aplatie
      an.push(anim(rect, 'width', 0, 4500, 900, 1650, EASE.inOut));
      an.push(w.star.animate([
        { transform: 'translateY(300%) scale(0) rotate(-360deg)', opacity: 0 },
        { transform: 'translateY(-8%) scale(1.12) rotate(-20deg)', opacity: 1, offset: .75 },
        { transform: 'none', opacity: 1 }
      ], { duration: 900, delay: 2650, easing: EASE.outQuart, fill: 'both' }));
      an.push(...glint(svg, w.star, 3250, c));
      return an;
    }
  };

  // 13. Constellation — mille souvenirs qui se rassemblent en une étoile
  A.constellation = {
    label: 'Constellation', use: 'Pub « mille histoires », page d\'accueil des familles, carte de vœux',
    duration: 3600, loop: false, vb: VB.wordmark, group: 'pub',
    build(svg, c) {
      const an = [];
      const pts = [[-1900, 300], [-1500, -250], [-1100, 700], [-600, -150], [-300, 900], [200, -280], [600, 850], [1100, -120], [1500, 650], [-800, 420], [900, 300], [-1300, 80], [1300, 100], [0, 520]];
      const g = el('g', {}, svg);
      pts.forEach(([dx, dy], i) => {
        const p = glyph(g, G.star, c.star);
        const s = .16 + (i % 4) * .05;
        an.push(p.animate([
          { transform: `translate(${dx}px,${dy}px) scale(0) rotate(0)`, opacity: 0, offset: 0 },
          { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(0)`, opacity: .9, offset: .25 + (i % 5) * .03 },
          { transform: `translate(${dx * .96}px,${dy * .96}px) scale(${s * .7}) rotate(30deg)`, opacity: .55, offset: .5 },
          { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(0)`, opacity: .95, offset: .62 },
          { transform: `translate(0,0) scale(.25) rotate(180deg)`, opacity: 1, offset: .9 },
          { transform: `translate(0,0) scale(.1) rotate(220deg)`, opacity: 0, offset: 1 }
        ], { duration: 2200, delay: i * 40, easing: EASE.inOut, fill: 'both' }));
      });
      const w = wordmark(svg, c);
      an.push(w.star.animate([
        { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
        { transform: 'scale(1.3) rotate(10deg)', opacity: 1, offset: .5 },
        { transform: 'none', opacity: 1 }
      ], { duration: 800, delay: 2050, easing: EASE.outQuart, fill: 'both' }));
      ORDER.forEach((k, i) => an.push(w.letters[k].animate([
        { opacity: 0, transform: 'translateY(8%)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ], { duration: 900, delay: 2250 + i * 50, easing: EASE.outExpo, fill: 'both' })));
      an.push(...glint(svg, w.star, 3000, c));
      return an;
    }
  };

  // 14. Passage — transition entre deux plans de pub : l'étoile couvre l'écran, puis redevient le point du i
  A.passage = {
    label: 'Passage', use: 'Transition entre deux plans de vidéo, changement de page plein écran',
    duration: 2200, loop: false, vb: VB.wordmark, group: 'pub',
    build(svg, c) {
      const w = wordmark(svg, c, { clip: true });
      const an = [];
      an.push(w.star.animate([
        { transform: 'scale(0) rotate(-90deg)', offset: 0 },
        { transform: 'scale(40) rotate(45deg)', offset: .38 },
        { transform: 'scale(40) rotate(45deg)', offset: .48 },
        { transform: 'scale(1) rotate(360deg)', offset: .9 },
        { transform: 'scale(1) rotate(360deg)', offset: 1 }
      ], { duration: 2200, easing: EASE.inOut, fill: 'both' }));
      ORDER.forEach((k, i) => an.push(w.letters[k].animate([
        { transform: 'translateY(105%)' }, { transform: 'none' }
      ], { duration: 800, delay: 1150 + i * 55, easing: EASE.outExpo, fill: 'both' })));
      // les lettres doivent passer au-dessus de l'étoile géante
      w.root.appendChild(w.root.firstChild);
      return an;
    }
  };

  /* ---------- L'Étincelle : le personnage ---------- */
  // Le corps est la vraie étoile du monogramme ; seuls des yeux sont ajoutés.
  const C = { x: 1342, y: 392 };          // centre visuel de l'étoile
  function character(svg, c, opts = {}) {
    const root = el('g', {}, svg);
    const body = el('g', {}, root);        // corps animé (sauts, inclinaison)
    body.style.transformBox = 'view-box';
    body.style.transformOrigin = `${C.x}px ${C.y + 220}px`;
    const star = glyph(body, G.monoStar, c.star);
    const face = el('g', { transform: `translate(${C.x},${C.y + 10})` }, body);
    const look = el('g', {}, face);
    const ink = c.ink === '#FFFFFF' ? '#16213A' : '#141412';
    const eyes = [-70, 70].map(dx => {
      const g = el('g', { transform: `translate(${dx},0)` }, look);
      const open = el('ellipse', { rx: 25, ry: 38, fill: ink }, g);
      open.style.transformBox = 'fill-box'; open.style.transformOrigin = '50% 50%';
      const happy = el('path', { d: 'M-24,8 Q0,-22 24,8', fill: 'none', stroke: ink, 'stroke-width': 11, 'stroke-linecap': 'round', opacity: 0 }, g);
      const shut = el('path', { d: 'M-24,-4 Q0,18 24,-4', fill: 'none', stroke: ink, 'stroke-width': 11, 'stroke-linecap': 'round', opacity: 0 }, g);
      const shine = el('circle', { cx: 9, cy: -14, r: 7.5, fill: '#FFF6E2' }, g);
      return { g, open, happy, shut, shine };
    });
    const cheeks = [-112, 112].map(dx => el('ellipse', { cx: dx, cy: 46, rx: 22, ry: 12, fill: '#E2731F', opacity: .35 }, face));
    return { root, body, star, face, look, eyes, cheeks, ink };
  }
  function blink(ch, times, period) {
    // times = instants (ms) des clignements dans la période
    const kf = [{ transform: 'scaleY(1)', offset: 0 }];
    times.forEach(t => {
      const o = t / period;
      kf.push({ transform: 'scaleY(1)', offset: Math.max(o - .02, 0) });
      kf.push({ transform: 'scaleY(.08)', offset: o });
      kf.push({ transform: 'scaleY(1)', offset: Math.min(o + .025, 1) });
    });
    kf.push({ transform: 'scaleY(1)', offset: 1 });
    return ch.eyes.flatMap(e => [e.open.animate(kf, { duration: period, iterations: Infinity }),
      e.shine.animate(kf.map(k => ({ opacity: k.transform === 'scaleY(.08)' ? 0 : 1, offset: k.offset })), { duration: period, iterations: Infinity })]);
  }
  function swapEyes(ch, kind, kf, opt) { // kind: happy | shut
    const an = [];
    ch.eyes.forEach(e => {
      an.push(e[kind].animate(kf.map(([o, v]) => ({ opacity: v, offset: o })), opt));
      an.push(e.open.animate(kf.map(([o, v]) => ({ opacity: 1 - v, offset: o })), opt));
      an.push(e.shine.animate(kf.map(([o, v]) => ({ opacity: 1 - v, offset: o })), opt));
    });
    return an;
  }
  const CVB = '880 -140 930 1040';

  A.persoBonjour = {
    label: 'Bonjour', use: 'Accueil de l\'espace auteur, page « Bienvenue » après la commande, premier mail',
    duration: 3200, loop: true, vb: CVB, group: 'perso',
    build(svg, c) {
      const ch = character(svg, c);
      const P = 3200;
      return [
        ch.body.animate([
          { transform: 'translateY(0) rotate(0) scale(1,1)', offset: 0 },
          { transform: 'translateY(0) rotate(0) scale(1.08,.9)', offset: .08 },
          { transform: 'translateY(-90px) rotate(-6deg) scale(.95,1.06)', offset: .18 },
          { transform: 'translateY(0) rotate(0) scale(1.06,.94)', offset: .28 },
          { transform: 'translateY(0) rotate(0) scale(1,1)', offset: .34 },
          { transform: 'rotate(9deg)', offset: .46 }, { transform: 'rotate(-9deg)', offset: .58 },
          { transform: 'rotate(7deg)', offset: .68 }, { transform: 'rotate(0)', offset: .78 },
          { transform: 'rotate(0)', offset: 1 }
        ], { duration: P, iterations: Infinity, easing: EASE.inOut }),
        ...swapEyes(ch, 'happy', [[0, 0], [.4, 0], [.44, 1], [.74, 1], [.78, 0], [1, 0]], { duration: P, iterations: Infinity }),
        ...blink(ch, [2900], P)
      ];
    }
  };

  A.persoEcoute = {
    label: 'J\'écoute', use: 'Page de l\'appel de démo, « Loomina vous rappelle », pendant un appel',
    duration: 3000, loop: true, vb: '700 -140 1110 1040', group: 'perso',
    build(svg, c) {
      const ch = character(svg, c);
      const P = 3000, an = [];
      an.push(ch.body.animate([
        { transform: 'rotate(-7deg)' }, { transform: 'rotate(-4deg) translateY(10px)', offset: .25 },
        { transform: 'rotate(-7deg)', offset: .5 }, { transform: 'rotate(-4deg) translateY(10px)', offset: .75 }, { transform: 'rotate(-7deg)' }
      ], { duration: P, iterations: Infinity, easing: EASE.inOut }));
      an.push(...swapEyes(ch, 'shut', [[0, 1], [1, 1]], { duration: P, iterations: Infinity }));
      // ondes de voix qui arrivent par la gauche
      for (let i = 0; i < 3; i++) {
        const r = 130 + i * 80;
        const arc = el('path', { d: `M${1060 - r * .2},${392 - r} A${r},${r} 0 0 0 ${1060 - r * .2},${392 + r}`, fill: 'none', stroke: c.star, 'stroke-width': 18, 'stroke-linecap': 'round' }, svg);
        an.push(arc.animate([
          { opacity: 0, transform: 'translateX(-60px)' }, { opacity: .9, transform: 'translateX(-20px)', offset: .3 },
          { opacity: 0, transform: 'translateX(30px)', offset: .7 }, { opacity: 0, offset: 1 }
        ], { duration: 1500, delay: i * 220, iterations: Infinity, easing: EASE.outQuart }));
      }
      return an;
    }
  };

  A.persoEcrit = {
    label: 'J\'écris', use: 'Pendant la rédaction du livre, « votre chapitre est en cours d\'écriture »',
    duration: 2400, loop: true, vb: '780 -140 1130 1300', group: 'perso',
    build(svg, c) {
      const ch = character(svg, c);
      const P = 2400, an = [];
      // le regard vers le bas, l'étoile se balance comme une plume qui écrit
      ch.look.setAttribute('transform', 'translate(-6,26)');
      const lineY = 1010;
      const line = el('path', { d: `M920,${lineY} q60,-40 120,0 t120,0 t120,0 t120,0 t120,0 t120,0`, fill: 'none', stroke: ch.ink, 'stroke-width': 14, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1' }, svg);
      an.push(line.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: .8 }, { strokeDashoffset: 0, opacity: 0 }], { duration: P, iterations: Infinity, easing: EASE.inOut }));
      const kf = [];
      for (let i = 0; i <= 6; i++) kf.push({ transform: `translate(${-330 + 110 * i}px, ${i % 2 ? 20 : -20}px) rotate(${i % 2 ? 12 : 4}deg)`, offset: i / 6 * .8 });
      kf.push({ transform: 'translate(-330px,-20px) rotate(4deg)', offset: 1 });
      an.push(ch.body.animate(kf, { duration: P, iterations: Infinity, easing: EASE.inOut }));
      an.push(...blink(ch, [1900], P));
      return an;
    }
  };

  A.persoDort = {
    label: 'Je dors', use: 'Page introuvable (404), site en maintenance, rappel « on reprend quand vous voulez »',
    duration: 4000, loop: true, vb: '880 -260 1150 1160', group: 'perso',
    build(svg, c) {
      const ch = character(svg, c);
      const P = 4000, an = [];
      an.push(...swapEyes(ch, 'shut', [[0, 1], [1, 1]], { duration: P, iterations: Infinity }));
      ch.eyes.forEach(e => e.shut.setAttribute('d', 'M-24,0 Q0,16 24,0'));
      an.push(ch.body.animate([
        { transform: 'rotate(14deg) scale(1)' }, { transform: 'rotate(14deg) scale(1.04,.97)', offset: .5 }, { transform: 'rotate(14deg) scale(1)' }
      ], { duration: P, iterations: Infinity, easing: EASE.inOut }));
      ['z', 'z', 'Z'].forEach((t, i) => {
        const tx = el('text', { x: 1640, y: 190, 'font-family': 'Georgia, "Times New Roman", serif', 'font-size': 120 + i * 40, 'font-style': 'italic', fill: ch.ink === '#16213A' ? '#FFFFFF' : '#141412' }, svg);
        tx.textContent = t;
        an.push(tx.animate([
          { opacity: 0, transform: 'translate(0,0)' }, { opacity: .8, transform: 'translate(40px,-80px)', offset: .3 },
          { opacity: 0, transform: 'translate(130px,-260px)' }
        ], { duration: 3000, delay: i * 1000 - 3000, iterations: Infinity, easing: EASE.outQuart }));
      });
      return an;
    }
  };

  A.persoFete = {
    label: 'Bravo', use: 'Commande confirmée, livre terminé, premier appel réussi',
    duration: 2200, loop: true, vb: '780 -420 1130 1400', group: 'perso',
    build(svg, c) {
      const ch = character(svg, c);
      const P = 2200, an = [];
      an.push(...swapEyes(ch, 'happy', [[0, 1], [1, 1]], { duration: P, iterations: Infinity }));
      an.push(ch.body.animate([
        { transform: 'translateY(0) scale(1,1) rotate(0)', offset: 0 },
        { transform: 'translateY(0) scale(1.12,.86) rotate(0)', offset: .12 },
        { transform: 'translateY(-260px) scale(.92,1.1) rotate(180deg)', offset: .32 },
        { transform: 'translateY(-300px) scale(1,1) rotate(330deg)', offset: .42 },
        { transform: 'translateY(0) scale(1.1,.9) rotate(360deg)', offset: .58 },
        { transform: 'translateY(0) scale(1,1) rotate(360deg)', offset: .68 },
        { transform: 'translateY(0) scale(1,1) rotate(360deg)', offset: 1 }
      ], { duration: P, iterations: Infinity, easing: EASE.inOut }));
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i - 4.5) * .32;
        const d = 380 + (i % 3) * 90;
        const dot = el('circle', { cx: C.x, cy: C.y - 200, r: i % 2 ? 16 : 24, fill: i % 3 === 0 ? ch.ink : c.star }, svg);
        an.push(dot.animate([
          { transform: 'translate(0,0) scale(0)', opacity: 0, offset: 0 },
          { transform: 'translate(0,0) scale(0)', opacity: 0, offset: .38 },
          { transform: `translate(${Math.cos(a) * d * .6}px,${Math.sin(a) * d * .6}px) scale(1)`, opacity: 1, offset: .5 },
          { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 160}px) scale(.4)`, opacity: 0, offset: .85 },
          { transform: 'scale(0)', opacity: 0, offset: 1 }
        ], { duration: P, iterations: Infinity, easing: EASE.outQuart }));
      }
      return an;
    }
  };

  // groupes pour la page du kit
  ['revelation', 'fil', 'monogramme', 'scintille'].forEach(k => A[k].group = A[k].group || 'pub');
  ['morph', 'survol', 'ecrit', 'ecoute', 'pret'].forEach(k => A[k].group = 'site');
  A.revelation.group = 'pub'; A.fil.group = 'pub'; A.monogramme.group = 'pub'; A.scintille.group = 'site';
})();

export {};
