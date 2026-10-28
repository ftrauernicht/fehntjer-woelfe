# 0012 – Der Totmannschalter misst den Abstand, nicht die Uhrzeit

Akzeptiert · 28.10.2026 · verfeinert [ADR 0011](0011-totmannschalter-statt-monitoring.md)

## Kontext

ADR 0011 hat den Check bei healthchecks.io auf den **Cron-Modus** gestellt:
erwartet wird ein Lebenszeichen zu `30 6 * * *` UTC, Toleranz sechs Stunden.
Diese sechs Stunden stammten aus **einer einzigen Messung** – dem Lauf vom
25.10.2026, der statt um 06:30 erst um 11:53 UTC startete.

Drei weitere Tage zeigen, dass das keine Ausnahme war, sondern der Normalfall:

| Tag | Start des Laufs (UTC) | Verzug | Ping |
|---|---|---|---|
| 25.10. | 11:53 | +5 h 23 | `OK` |
| 26.10. | 13:23 | +6 h 53 | `OK` |
| 27.10. | 12:30:56 | +6 h 00 | `OK` |

Geplante Läufe sind bei GitHub ausdrücklich „best effort" und stehen in einer
Warteschlange. Der Verzug liegt damit systematisch **auf der Toleranzkante**.
Folge: zwei Fehlalarme, der zweite 56 Sekunden über der Grenze – während jeder
dieser Läufe „15 von 15 Prüfungen bestanden" meldete und jeder Ping mit `OK`
quittiert wurde. Die Seite war nie weg.

Das ist der schlimmste Zustand für einen Wächter. Ein Alarm, der regelmäßig
ohne Anlass kommt, wird weggeklickt, und beim echten Anlass wird er auch
weggeklickt.

## Entscheidung

**Der Check misst den Abstand zwischen zwei Lebenszeichen, nicht die
Einhaltung einer Uhrzeit.** Modus `simple`, Abstand 1 Tag, Toleranz 8 Stunden –
Alarm also erst, wenn 32 Stunden nichts kam.

Der Grund ist, dass die gemessene Größe stabil ist, obwohl die Startzeit
schwankt: Zwischen den Pings lagen 25 h 30 und 23 h 07. Ein Verzug
verschiebt das nächste Fenster mit, statt die Toleranz aufzufressen.

Der Zeitplan im Workflow bleibt bei `30 6 * * *`. Er ist ein Wunsch, keine
Zusage – und der Alarm hängt nicht mehr daran.

## Alternativen

**Toleranz im Cron-Modus auf 12 Stunden.** Verworfen. Es würde heute
funktionieren und jagt doch nur eine Zahl, die GitHub bestimmt: ein einzelner
besonders späterer Lauf alarmiert weiter, und die Zahl müsste nach jedem
Fehlalarm erneut nachgezogen werden.

**Den Zeitplan in eine ruhigere Stunde legen.** Nicht belegt. Dass 06:30 UTC
ein stark belegter Zeitpunkt ist, liegt nahe – nachgewiesen ist es nicht, und
bei Abstandsmessung ändert es am Alarm ohnehin nichts. Bleibt als Möglichkeit,
falls die Mail über einen echten Defekt einmal früher am Tag kommen soll.

**Öfter laufen lassen.** Verworfen. Am Verzug der Warteschlange ändert eine
höhere Frequenz nichts, und die Lücke, die der Totmannschalter schließt, ist
nicht die Länge des Prüfabstands.

## Konsequenzen

- Ein wirklich toter Wachhund fällt spätestens nach 32 Stunden auf, nicht
  nach 12. Für die Fälle, um die es geht – abgeschalteter Zeitplan, gelöschter
  Workflow, Konto weg –, ist das ohne Belang: das sind Dauerzustände.
- Ein echter Defekt an der Seite meldet unverändert sofort, auf zwei Wegen:
  `/fail` an healthchecks.io und die rote Lauf-Mail von GitHub.
- Die Mail über einen echten Defekt kommt **um die Mittagszeit**, nicht
  morgens. Die frühere Aussage im Workflow-Kopf war falsch und ist korrigiert.
- Die Einstellung liegt außerhalb des Repositorys, in der Oberfläche von
  healthchecks.io. Sie steht deshalb im README – nicht nur hier.
