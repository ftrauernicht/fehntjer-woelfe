# 0009 – Betrieb ohne Nachsehen: Wachhund und automatische Zusammenführung

Akzeptiert · 24.10.2026

## Kontext

Die Seite wird privat betrieben, nebenbei, von einer Person. Laufende
Handarbeit ist der eigentliche Kostenfaktor – nicht Hosting, nicht Domain.
Alles, was regelmäßiges Nachsehen verlangt, wird irgendwann nicht mehr
nachgesehen.

In den ersten Tagen sind drei Fehler aufgetreten, die von außen unsichtbar
waren und die alle **ein Mensch** gefunden hat, nicht die Technik:

| Fehler | Wie er auffiel |
|---|---|
| Das Vereinswappen war aus dem Repository gelöscht (ein abgebrochener Bildlauf hatte `public/logo/` geleert) | dem Betreiber fiel die Fehlermeldung in der Webkonsole auf |
| Ein alter AAAA-Eintrag zeigte auf einen fremden Parkserver ohne Zertifikat | der Trainer bekam `SSL_PROTOCOL_ERROR` und sagte es |
| DMARC stand auf `p=reject`, ohne dass ein SPF-Eintrag existierte – jede ausgehende Mail wäre abgelehnt worden | beim Durchsehen entdeckt, kurz bevor das Postfach benutzt wurde |

Jeder dieser drei ist von außen in Sekunden prüfbar. Keiner davon war es
wert, von Hand gefunden zu werden.

Dazu kommt Dependabot: ein wöchentlicher Pull Request, der sonst liegen
bleibt. Ein liegengebliebenes Update ist schlechter als keines – es veraltet
weiter, und der Stapel wächst, bis ihn niemand mehr durchsieht.

## Entscheidung

**1. Ein Wachhund prüft täglich die veröffentlichte Seite von außen.**
`scripts/pruefe-live.mjs`, aufgerufen von `.github/workflows/wachhund.yml`,
prüft Erreichbarkeit, Indexierungsfreigabe in der `robots.txt`, Sitemap,
Vorschaubild, beide Wappen, jedes Galeriebild, A-Eintrag, Abwesenheit eines
AAAA-Eintrags, MX, SPF, DMARC und die Restlaufzeit des Zertifikats. Schlägt
etwas an, wird der Lauf rot und GitHub schickt eine Mail.

Das Skript hat keine Abhängigkeiten – `fetch`, `node:dns` und `node:tls`
genügen – und läuft mit `npm run pruefe:live` auch lokal.

**2. Dependabots Pull Requests führen sich nach grüner CI selbst zusammen.**
`.github/workflows/dependabot-zusammenfuehren.yml` übernimmt den gesammelten
`patch-und-minor`-Pull-Request und Versionssprünge der GitHub-Actions.
Major-Sprünge bei npm-Paketen bleiben offen.

Das Tor ist die vollständige CI: Lint, Typen, Tests mit Abdeckung,
Produktions-Build und `npm audit`. Was dort scheitert, wird nicht
zusammengeführt.

## Alternativen

**GitHubs eingebautes Auto-Merge.** Ohne geschützten Zweig führt es sofort
zusammen – also bevor die CI fertig ist, denn ohne Pflicht-Checks gibt es
nichts, worauf es warten könnte. Mit geschütztem Zweig und Pflicht-Checks
hätte es funktioniert, hätte aber auch die eigenen direkten Pushes auf `main`
blockiert. Die sind hier der Normalfall: ein Einzelbetreiber stellt keine
Pull Requests gegen sich selbst. Deshalb `workflow_run` – dort steht das
Ergebnis der CI schon fest.

**Ein externer Überwachungsdienst.** Prüft HTTP-Erreichbarkeit zuverlässig,
aber nicht die Semantik der `robots.txt`, nicht einzelne DNS-Felder und nicht
die Bildliste aus `gallery.json`. Dazu ein weiteres Konto mit Zugangsdaten,
das jemand übernehmen müsste.

**Auch Major-Sprünge automatisch zusammenführen.** Eine grüne CI belegt bei
einem Major-Sprung nicht, dass sich das Verhalten nicht ändert. Sie kommen
einzeln und selten; einmal im Quartal hinsehen ist vertretbar.

**Die Search-Console-API abfragen** statt nur HTTP und DNS. Das bräuchte
OAuth-Zugangsdaten als Secret im Repository. Der Nutzen – Indexierungszahlen,
die Google ohnehin per Mail meldet – rechtfertigt das Geheimnis nicht.

## Konsequenzen

- Ein Fehler **meldet sich**, statt entdeckt zu werden. Die drei Fehler aus
  dem Kontext wären alle aufgefallen.
- Der Wachhund sieht nur, was von außen sichtbar ist. Ob ein Text stimmt, ob
  ein Bild schön ist, ob ein Wolf zwei Schwänze hat – das sieht er nicht.
- **Geplante Läufe schaltet GitHub nach 60 Tagen ohne Aktivität im Repository
  ab** und warnt vorher per Mail. Die wöchentlichen Zusammenführungen gelten
  als Aktivität und halten den Wachhund wach. Versiegt Dependabot, muss der
  Lauf einmal von Hand wieder eingeschaltet werden.
- Ein falscher Alarm kostet mehr als eine fehlende Prüfung: wer dreimal
  umsonst nachsieht, sieht beim vierten Mal nicht mehr nach. Deshalb sind die
  beiden entscheidenden Funktionen des Skripts in `tests/wachhund.test.ts`
  geprüft, und die DNS-Abfragen behandeln „Eintrag fehlt" ausdrücklich als
  Normalfall statt als Fehler.
- Automatisch zusammengeführte Updates gehen ohne menschlichen Blick live.
  Vercel baut jeden Push; schlägt der Build fehl, bleibt die letzte
  funktionierende Fassung online.
- Der Wachhund braucht kein Geheimnis und keinen Zugang. Er prüft nur, was
  jeder von außen prüfen könnte – passend zur Grenze aus
  [ADR 0008](0008-dokumentationsgrenze.md).
