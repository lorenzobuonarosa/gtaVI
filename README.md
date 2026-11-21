# GTA VI – dataviz Radar – QN

Cinque dataviz per il pezzo sui primi giorni di Grand Theft Auto VI. Pagine statiche (D3 v7 + `assets/radar.*`), ogni pagina legge il proprio CSV da `data/`: per aggiornare basta cambiare il CSV.

| Cartella | Dataviz | CSV | Fonte | Stato |
|---|---|---|---|---|
| `gta-cloudflare/` | Ridgeline: lo sblocco fuso per fuso | `cloudflare-picchi.csv`, `cloudflare-orario.csv` | Cloudflare Radar | curve ricavate in bozza: `gta-cloudflare/riferimento/cloudflare-orario-bozza.csv`, da approvare con `controllo.png` e poi copiare in `data/cloudflare-orario.csv` |
| `gta-timeline/` | Timeline della serie con gli screen | `timeline.csv` | Rockstar Games | pronta; screen ritagliati 16:9 in WebP animato (originali in `originali/gta-timeline/`) |
| `gta-minuti/` | Minuti giocati al giorno | `minuti.csv` | Circana | pronta |
| `gta-streaming/` | Ore guardate in streaming | `streaming.csv` | Streams Charts | pronta; dato GTA VI preliminare (2 giorni) |
| `gta-musica/` | Ascolti Spotify dell'album | `musica.csv` | Kworb | pronta; riaggiornare il CSV prima di pubblicare |

`assets/hbar.js` è l'helper comune delle barre orizzontali (minuti, streaming, musica).

## Calcoli fatti dalle pagine
- Streaming: righe ordinate per valore; parentesi "(periodo)" accanto a GTA VI solo se `periodo` ≠ "prima settimana"; somma Elden Ring + Hogwarts Legacy + Cyberpunk 2077 calcolata dal CSV. Con il dato settimanale il titolo diventa provvisorio (calcolato): da sostituire.
- Musica: ascolti divisi per un milione, ordinati; titolo "corrido messicano" solo se il primo brano è Suzuki; data del sottotitolo = data di aggiornamento più recente del CSV.
- Minuti: "≈" sui valori con `approssimato` = sì; conversione in ore e minuti nel tooltip.
- Cloudflare: ore mancanti in `cloudflare-orario.csv` interpolate linearmente e disegnate con linea punteggiata (chiave sotto il grafico); valore del tooltip = percentuale del picco della riga.

## Snippet CMS
Vedi `index.html` (https://lorenzobuonarosa.github.io/gtaVI/): anteprime desktop/mobile e pulsante "Copia".
