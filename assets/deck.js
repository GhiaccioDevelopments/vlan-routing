/* VLAN: guscio delle slide e componenti condivisi. JS puro (niente JSX), funziona anche da file://.
   window.Deck.mount(slides, {modulo, nome, indice})  ·  window.UI.* */
(function () {
  'use strict';
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect;

  /* Stepper interni che consumano le frecce prima del cambio slide. */
  var passi = null;
  function usaPassi(g) {
    useEffect(function () { passi = g; return function () { if (passi === g) passi = null; }; });
  }

  var UI = {};
  UI.salva = function (k, v) { try { localStorage.setItem('vlan:' + k, JSON.stringify(v)); } catch (e) {} };
  UI.carica = function (k, def) { try { var v = localStorage.getItem('vlan:' + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };

  UI.Box = function (p) {
    return h('div', { className: 'box box-' + (p.type || 'info') }, p.title && h('div', { className: 'box-title' }, p.title), h('div', null, p.children));
  };
  UI.Chip = function (p) { return h('span', { className: 'chip chip-' + (p.color || 'neutro') }, p.children); };
  UI.Grid = function (p) { return h('div', { className: 'grid ' + (p.stretch ? 'stretch ' : '') + (p.className || ''), style: { '--cols': p.cols || 2 } }, p.children); };
  UI.Card = function (p) { return h('div', { className: 'card ' + (p.tone || '') }, p.title && h('h3', null, p.title), p.children); };
  UI.Btn = function (p) {
    return h('button', { type: 'button', className: 'btn ' + (p.variant || '') + (p.small ? ' small' : '') + (p.attivo ? ' attivo' : ''), onClick: p.onClick, disabled: p.disabled }, p.children);
  };
  UI.Table = function (p) {
    return h('div', { className: 'scrollx' }, h('table', { className: 'tab' + (p.mono ? ' mono' : '') },
      p.head && h('thead', null, h('tr', null, p.head.map(function (c, k) { return h('th', { key: k }, c); }))),
      h('tbody', null, p.rows.map(function (r, k) {
        return h('tr', { key: k, className: p.hlRow === k ? 'hl' : '' }, r.map(function (c, j) { return h('td', { key: j }, c); }));
      }))));
  };

  /* Terminale. righe: stringa (output) oppure [prompt, comando, spiegazione].
     reveal: mostra un comando alla volta (frecce o pulsanti). */
  UI.Code = function (p) {
    var righe = p.righe, stop = [];
    righe.forEach(function (r, i) { if (Array.isArray(r)) stop.push(i); });
    var st = useState(p.reveal ? 0 : -1), n = st[0], setN = st[1];
    if (p.reveal) usaPassi({
      avanti: function () { if (n < stop.length - 1) { setN(n + 1); return true; } return false; },
      indietro: function () { if (n > 0) { setN(n - 1); return true; } return false; }
    });
    var fino = p.reveal ? (n + 1 < stop.length ? stop[n + 1] : righe.length) : righe.length;
    var sel = n >= 0 ? stop[n] : -1;
    var spiega = sel >= 0 && righe[sel][2];
    var haSpiega = righe.some(function (r) { return Array.isArray(r) && r[2]; });
    return h('div', { className: 'term' },
      p.title && h('div', { className: 'term-title' }, p.title),
      h('div', { className: 'term-body' }, righe.slice(0, fino).map(function (r, i) {
        if (!Array.isArray(r)) return h('span', { key: i, className: 'term-riga out' }, r || ' ');
        return h('span', { key: i, className: 'term-riga cmd' + (i === sel ? ' sel' : ''), onClick: function () { setN(stop.indexOf(i)); } },
          h('span', { className: 'pr' }, r[0] + ' '), h('span', { className: 'cm' }, r[1]));
      })),
      haSpiega && h('div', { className: 'term-spiega' }, spiega || 'Tocca un comando per leggere la spiegazione.'),
      p.reveal && h('div', { className: 'term-nav' },
        h(UI.Btn, { small: true, disabled: n <= 0, onClick: function () { setN(n - 1); } }, '‹ riga'),
        h(UI.Btn, { small: true, variant: 'primary', disabled: n >= stop.length - 1, onClick: function () { setN(n + 1); } }, 'riga ›'),
        h('span', null, 'comando ' + (n + 1) + ' di ' + stop.length)));
  };

  /* Schema di rete guidato dai dati.
     nodi: {id,x,y,tipo:'pc'|'switch'|'router',label,sub,colore,on,spento,onClick}
     link: {da,a,trunk,colore,label,pa,pb,on,off}   pacchetto: {at,testo,colore} */
  UI.Rete = function (p) {
    var W = p.w || 700, H = p.h || 340, by = {};
    p.nodi.forEach(function (n) { by[n.id] = n; });
    var pk = p.pacchetto, pos = pk && by[pk.at];
    return h('div', { className: 'rete scrollx' }, h('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': p.alt || 'Schema di rete' },
      (p.zone || []).map(function (z, k) {
        return h('g', { key: 'z' + k }, h('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 10, className: 'zona' }),
          h('text', { x: z.x + 8, y: z.y + 15, className: 'zona-l' }, z.label));
      }),
      p.link.map(function (l, k) {
        var a = by[l.da], b = by[l.a], dx = b.x - a.x, dy = b.y - a.y;
        return h('g', { key: 'l' + k },
          h('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, className: 'ln' + (l.trunk ? ' trunk' : '') + (l.on ? ' on' : '') + (l.off ? ' off' : ''), style: l.colore ? { stroke: 'var(--' + l.colore + ')' } : null }),
          l.label && h('text', { x: a.x + dx / 2 + (l.lx || 0), y: a.y + dy / 2 - 9 + (l.ly || 0), textAnchor: 'middle', className: 'ln-l' }, l.label),
          l.pa && h('text', { x: a.x + dx * .3, y: a.y + dy * .3 + 15, textAnchor: 'middle', className: 'port' }, l.pa),
          l.pb && h('text', { x: a.x + dx * .7, y: a.y + dy * .7 + 15, textAnchor: 'middle', className: 'port' }, l.pb));
      }),
      p.nodi.map(function (n) {
        var w = n.tipo === 'pc' ? 108 : 98, hh = n.sub ? 44 : 36;
        return h('g', { key: n.id, className: 'nodo ' + n.tipo + (n.on ? ' on' : '') + (n.spento ? ' spento' : ''), onClick: n.onClick, style: n.onClick ? { cursor: 'pointer' } : null },
          h('rect', { x: n.x - w / 2, y: n.y - hh / 2, width: w, height: hh, rx: n.tipo === 'router' ? 22 : 8,
            style: n.colore ? { stroke: 'var(--' + n.colore + ')', fill: 'color-mix(in srgb, var(--' + n.colore + ') 24%, var(--bg-card))' } : null }),
          h('text', { x: n.x, y: n.y + (n.sub ? -3 : 4.5), textAnchor: 'middle', className: 'nodo-l' }, n.label),
          n.sub && h('text', { x: n.x, y: n.y + 13, textAnchor: 'middle', className: 'nodo-s' }, n.sub));
      }),
      pos && h('g', { className: 'pkt', style: { transform: 'translate(' + pos.x + 'px,' + (pos.y - 37) + 'px)' } },
        h('rect', { x: -36, y: -11, width: 72, height: 22, rx: 5, style: { fill: 'var(--' + (pk.colore || 'accent') + ')' } }),
        h('text', { x: 0, y: 4, textAnchor: 'middle' }, pk.testo))));
  };

  /* Percorso a passi su uno schema di rete.
     passi: {titolo, testo, at, tag, colore, link:[indici], on:[id nodi]} */
  UI.Percorso = function (p) {
    var st = useState(0), i = st[0], setI = st[1], ps = p.passi, s = ps[i];
    usaPassi({
      avanti: function () { if (i < ps.length - 1) { setI(i + 1); return true; } return false; },
      indietro: function () { if (i > 0) { setI(i - 1); return true; } return false; }
    });
    var link = p.rete.link.map(function (l, k) { return Object.assign({}, l, { on: (s.link || []).indexOf(k) >= 0 }); });
    var nodi = p.rete.nodi.map(function (n) { return Object.assign({}, n, { on: (s.on || []).indexOf(n.id) >= 0 }); });
    return h('div', { className: 'stack' },
      h(UI.Rete, Object.assign({}, p.rete, { nodi: nodi, link: link, pacchetto: s.at ? { at: s.at, testo: s.tag || 'no tag', colore: s.colore } : null })),
      h('div', { className: 'row' },
        h(UI.Btn, { small: true, disabled: i === 0, onClick: function () { setI(i - 1); } }, '‹ Indietro'),
        h(UI.Btn, { small: true, variant: 'primary', disabled: i === ps.length - 1, onClick: function () { setI(i + 1); } }, 'Avanti ›'),
        h('span', { className: 'muted small mono' }, 'passo ' + (i + 1) + ' di ' + ps.length)),
      h('div', { className: 'passo', 'aria-live': 'polite' }, h('h4', null, s.titolo), h('div', null, s.testo)));
  };

  /* Quiz a risposta multipla. domande: {q, o:[...], a: indice, w: spiegazione} */
  UI.Quiz = function (p) {
    var st = useState({}), r = st[0], setR = st[1], d = p.domande;
    /* Le risposte si mescolano a ogni apertura. */
    var ord = useRef(null);
    if (!ord.current) ord.current = d.map(function (it) {
      var a = it.o.map(function (_, k) { return k; });
      for (var k = a.length - 1; k > 0; k--) { var x = Math.floor(Math.random() * (k + 1)), tmp = a[k]; a[k] = a[x]; a[x] = tmp; }
      return a;
    });
    var giuste = Object.keys(r).filter(function (k) { return r[k] === d[k].a; }).length;
    return h('div', { className: 'stack' },
      h('div', { className: 'row' }, h('strong', { className: 'mono' }, 'Punteggio: ' + giuste + ' / ' + d.length),
        h(UI.Btn, { small: true, onClick: function () { setR({}); } }, 'Ricomincia')),
      d.map(function (it, i) {
        var fatto = r[i] !== undefined;
        return h('div', { key: i, className: 'quiz-d' },
          h('div', { className: 'qt' }, (i + 1) + '. ' + it.q),
          h('div', { className: 'quiz-o' }, ord.current[i].map(function (j) {
            var t = it.o[j];
            var cls = fatto ? (j === it.a ? ' giusta' : (j === r[i] ? ' sbagliata' : '')) : '';
            return h('button', { key: j, type: 'button', className: 'btn' + cls, disabled: fatto, onClick: function () { var n = Object.assign({}, r); n[i] = j; setR(n); } },
              (fatto && j === it.a ? '✓ ' : fatto && j === r[i] ? '✗ ' : '') + t);
          })),
          fatto && h('div', { className: 'quiz-w' }, it.w));
      }));
  };

  /* Pagina attività (telefono). */
  UI.Pagina = function (p) {
    return h('div', null,
      h('div', { className: 'pagina-head' }, h('a', { href: p.indietro || '../index.html' }, '‹ ' + (p.indietroEtichetta || 'Indice')), h('h1', null, p.titolo)),
      h('div', { className: 'pagina-body' }, p.children));
  };
  UI.render = function (el) { ReactDOM.createRoot(document.getElementById('root')).render(el); };

  /* ---------- Deck ---------- */
  function daHash(n) { var v = parseInt(location.hash.slice(1), 10); return v >= 1 && v <= n ? v - 1 : 0; }

  function DeckApp(p) {
    var slides = p.slides, o = p.opts, tot = slides.length;
    var st = useState(daHash(tot)), i = st[0], setI = st[1];
    var sn = useState(false), note = sn[0], setNote = sn[1];
    var se = useState(false), elenco = se[0], setElenco = se[1];
    var ref = useRef(null), cur = useRef(i);
    cur.current = i;
    function vai(n) { n = Math.max(0, Math.min(tot - 1, n)); setI(n); setElenco(false); }
    function avanti() { if (passi && passi.avanti()) return; vai(cur.current + 1); }
    function indietro() { if (passi && passi.indietro()) return; vai(cur.current - 1); }

    useEffect(function () { try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {} }, [i]);
    useEffect(function () {
      function tasto(e) {
        var t = e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
        var k = e.key;
        if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && t !== 'BUTTON')) { e.preventDefault(); avanti(); }
        else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); indietro(); }
        else if (k === 'Home') vai(0);
        else if (k === 'End') vai(tot - 1);
        else if (k === 'n' || k === 'N') setNote(function (v) { return !v; });
        else if (k === 'i' || k === 'I') setElenco(function (v) { return !v; });
        else if (k === 'Escape') setElenco(false);
        else if (k === 'f' || k === 'F') { var d = document; if (d.fullscreenElement) d.exitFullscreen(); else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () {}); }
      }
      function hash() { setI(daHash(tot)); }
      var x0 = null;
      function ts(e) { x0 = e.touches[0].clientX; }
      function te(e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (e.target.closest && e.target.closest('.scrollx,.term-body,input')) return; if (dx < -70) avanti(); else if (dx > 70) indietro(); }
      window.addEventListener('keydown', tasto); window.addEventListener('hashchange', hash);
      window.addEventListener('touchstart', ts, { passive: true }); window.addEventListener('touchend', te, { passive: true });
      return function () { window.removeEventListener('keydown', tasto); window.removeEventListener('hashchange', hash); window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te); };
    }, []);

    /* Se la slide non entra, il carattere si riduce da solo. */
    useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      var occupato = false;
      function adatta() {
        if (occupato) return; occupato = true;
        el.style.fontSize = '';
        if (window.innerWidth > 900) { var s = 100; while (el.scrollHeight > el.clientHeight + 1 && s > 58) { s -= 3; el.style.fontSize = s + '%'; } }
        requestAnimationFrame(function () { requestAnimationFrame(function () { occupato = false; }); });
      }
      adatta();
      var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(adatta) : null;
      if (ro) Array.prototype.forEach.call(el.children, function (c) { ro.observe(c); });
      window.addEventListener('resize', adatta);
      return function () { if (ro) ro.disconnect(); window.removeEventListener('resize', adatta); };
    }, [i, note]);

    var s = slides[i];
    var note_ = s.note ? (Array.isArray(s.note) ? s.note : [s.note]) : [];
    return h('div', { className: 'deck' },
      h('div', { className: 'deck-head' },
        h('span', null, h('b', null, 'Modulo ' + o.modulo), ' · ' + o.nome + (s.sezione ? ' · ' + s.sezione : '')),
        h('a', { href: o.indice || '../index.html' }, 'Indice ›')),
      h('div', { className: 'slide' + (s.copertina ? ' copertina' : ''), ref: ref, key: i },
        s.copertina ? [h('div', { key: 'o', className: 'occhiello' }, 'Modulo ' + o.modulo + ' · Sistemi e Reti · Cisco Packet Tracer'), h('h1', { key: 't' }, s.titolo), h('div', { key: 'c', className: 'sotto' }, h(s.contenuto))]
          : [!s.senzaTitolo && h('h2', { key: 't' }, s.titolo), h('div', { key: 'c', className: 'slide-body' }, h(s.contenuto))]),
      note && h('div', { className: 'note' }, h('b', null, 'Appunti · '), note_.length ? note_.join(' ') : 'Nessun appunto per questa slide.'),
      h('div', { className: 'deck-foot' },
        h(UI.Btn, { small: true, onClick: indietro, disabled: i === 0 }, '‹'),
        h('span', { className: 'conta' }, (i + 1) + ' / ' + tot),
        h(UI.Btn, { small: true, variant: 'primary', onClick: avanti, disabled: i === tot - 1 && !passi }, '›'),
        h('div', { className: 'barra' }, h('i', { style: { width: ((i + 1) / tot * 100) + '%' } })),
        h(UI.Btn, { small: true, attivo: note, onClick: function () { setNote(!note); } }, 'Appunti (N)'),
        h(UI.Btn, { small: true, onClick: function () { setElenco(true); } }, 'Elenco (I)')),
      elenco && h('div', { className: 'elenco', onClick: function (e) { if (e.target === e.currentTarget) setElenco(false); } },
        h('div', { className: 'elenco-in' }, h('h3', null, 'Modulo ' + o.modulo + ' · ' + o.nome),
          slides.map(function (x, k) {
            var nuova = k === 0 || slides[k - 1].sezione !== x.sezione;
            return [nuova && x.sezione && h('div', { key: 's' + k, className: 'sez' }, x.sezione),
              h('button', { key: k, type: 'button', className: 'btn small' + (k === i ? ' attivo' : ''), onClick: function () { vai(k); } }, (k + 1) + '. ' + x.titolo)];
          }),
          h(UI.Btn, { onClick: function () { setElenco(false); } }, 'Chiudi'))));
  }

  window.UI = UI;
  window.Deck = {
    usaPassi: usaPassi,
    mount: function (slides, opts) { ReactDOM.createRoot(document.getElementById('root')).render(h(DeckApp, { slides: slides, opts: opts || {} })); }
  };
})();
