# Architekturentscheidungen (ADR)

Hier liegt, **warum** etwas so ist, wie es ist – samt der Alternativen, die
geprüft und verworfen wurden.

Das Haupt-README beschreibt dagegen nur den **Stand der Dinge**. Wer wissen
will, wie man die Seite startet, schaut dorthin. Wer wissen will, warum die
Content-Security-Policy dynamisches Rendering erzwingt, schaut hierher.

## Warum getrennt

Historie im README veraltet und verwirrt: Sie erzählt von Zuständen, die es
nicht mehr gibt, und drängt sich zwischen den Leser und die Information, die er
sucht. Gleichzeitig ist sie zu wertvoll zum Wegwerfen – ohne sie wiederholt
jemand eine Entscheidung, die schon einmal durchdacht war, oder dreht sie
ahnungslos zurück.

Ein ADR wird **nicht überschrieben**. Ändert sich eine Entscheidung, bekommt
sie einen Nachfolger, und der alte Eintrag wird auf `Abgelöst durch …`
gesetzt.

## Aufbau eines Eintrags

```
# NNNN – Titel
Status · Datum
## Kontext      Was war die Lage, welches Problem stand an
## Entscheidung Was wurde festgelegt
## Alternativen Was wurde geprüft und warum verworfen
## Konsequenzen Was folgt daraus, auch das Unangenehme
```

## Liste

| Nr. | Titel | Status |
|---|---|---|
| [0001](0001-indexierungssperre.md) | Die Seite sperrt sich selbst aus dem Suchindex | akzeptiert |
| [0002](0002-csp-mit-nonce.md) | CSP mit Nonce statt statischer Header | akzeptiert |
| [0003](0003-originalbilder-ausserhalb.md) | Originalbilder liegen nicht im Repository | akzeptiert |
| [0004](0004-tailwind-turbopack.md) | Tailwind als Turbopack-Loader in `next.config.ts` | akzeptiert |
| [0005](0005-nameserver-bei-vercel.md) | Nameserver bei Vercel statt bei Strato | akzeptiert |
| [0006](0006-spf-ueber-strato-regel.md) | SPF über Stratos Standardregel | akzeptiert |
| [0007](0007-typescript-6.md) | TypeScript 6 statt 7 | akzeptiert |
| [0008](0008-dokumentationsgrenze.md) | Was öffentlich dokumentiert wird | akzeptiert |
| [0009](0009-betrieb-ohne-nachsehen.md) | Betrieb ohne Nachsehen: Wachhund und automatische Zusammenführung | akzeptiert |
| [0010](0010-antwortmaschinen.md) | Vorbereitung auf Antwortmaschinen | akzeptiert |
| [0011](0011-totmannschalter-statt-monitoring.md) | Totmannschalter statt eigener Überwachung | akzeptiert |
