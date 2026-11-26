# VLAN: dallo switch al router-on-a-stick

Presentazione interattiva per Sistemi e Reti sull'argomento VLAN, pensata per preparare il laboratorio in Cisco Packet Tracer.

**Sito:** https://ghiacciodevelopments.github.io/vlan-routing/

## Moduli

| # | Argomento | Slide |
|---|-----------|-------|
| 1 | VLAN: le basi | [slide](https://ghiacciodevelopments.github.io/vlan-routing/modulo-1-vlan-base/slide.html) |
| 2 | Più switch: il trunk 802.1Q | [slide](https://ghiacciodevelopments.github.io/vlan-routing/modulo-2-trunk/slide.html) |
| 3 | Inter-VLAN routing (router-on-a-stick) | [slide](https://ghiacciodevelopments.github.io/vlan-routing/modulo-3-inter-vlan-routing/slide.html) |
| 4 | Laboratorio in Packet Tracer | [slide](https://ghiacciodevelopments.github.io/vlan-routing/modulo-4-laboratorio/slide.html) |

## Attività

- [Allenatore CLI](https://ghiacciodevelopments.github.io/vlan-routing/laboratorio/allenatore-cli.html): terminale Cisco simulato con quattro missioni.
- [Scheda di laboratorio](https://ghiacciodevelopments.github.io/vlan-routing/laboratorio/scheda.html): stampabile, con lista di controllo e soluzione.
- [Quiz](https://ghiacciodevelopments.github.io/vlan-routing/quiz/quiz.html): domande per modulo e verifica finale.
- [Dispensa sul router-on-a-stick](https://ghiacciodevelopments.github.io/vlan-routing/dispensa/router-on-a-stick.html).

## Comandi delle slide

Frecce o spazio per avanzare · Home/End · **N** appunti · **I** elenco delle slide · **F** schermo intero.
I terminali con i comandi avanzano una riga alla volta prima di cambiare slide.

## Come è fatto

Pagine HTML autonome, senza build: React, ReactDOM e Babel arrivano da jsDelivr con versioni fisse.
Le parti in comune stanno in `assets/`: `deck.js` è il guscio delle slide con i componenti (terminale, schema di rete, percorso a passi, quiz), `style.css` lo stile, `print.css` il tema chiaro per le schede.

Per provarlo in locale:

```bash
python -m http.server 8000
```

## Fonti e crediti

- Contenuti: serie di video «VLAN base», «VLAN trunking» e «VLAN routing» di Sophia Danesino (Cisco Packet Tracer).
- Struttura e metodo di lavoro ispirati alle presentazioni interattive del prof. Thomas Casali (per esempio `presentazione-des-rsa`). Il codice di questo repository è scritto da zero.
