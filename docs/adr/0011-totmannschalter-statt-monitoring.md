# 0011 – Totmannschalter statt eigener Überwachung

Akzeptiert · 25.10.2026

## Kontext

[ADR 0009](0009-betrieb-ohne-nachsehen.md) hat den Wachhund eingeführt: ein
täglicher Lauf, der die veröffentlichte Seite von außen prüft. Schlägt eine
Prüfung an, wird der Lauf rot und GitHub schickt eine Mail.

Dieser Aufbau hat eine Lücke, und sie ist grundsätzlicher Art: **Ein Wächter,
dessen Schweigen „alles in Ordnung" bedeutet, kann seinen eigenen Tod nicht
melden.** Ein Lauf, der nie startet, sieht genauso aus wie ein grüner Tag.
Mindestens drei Wege führen dahin:

- GitHub schaltet geplante Läufe nach 60 Tagen ohne Aktivität im Repository
  ab. Die Dependabot-Zusammenführungen halten den Zeitplan zwar wach, aber
  das ist eine Kette von Annahmen, nicht eine Zusage.
- Eine Störung bei GitHub Actions. Am 25.10.2026 lief der für 06:30 UTC
  geplante Lauf erst um 11:53 UTC – geplante Läufe stehen in einer Warte­
  schlange und haben keine Zusage über die Startzeit.
- Jemand entfernt oder deaktiviert den Workflow, ohne die Folge zu bedenken.

Dazu kommt, dass der einzige Meldeweg heute durch GitHub führt. Wer dessen
Mails in einen Ordner filtert, hat keinen Kanal mehr.

In anderen Projekten des Betreibers werden Dienste mit Icinga und mit
healthchecks.io überwacht. Die Frage war, ob das hier ebenfalls angebracht
ist.

## Entscheidung

**1. Der Wachhund meldet sich nach jedem Lauf nach außen (Totmannschalter).**
Der letzte Schritt in `wachhund.yml` ruft die Ping-Adresse eines Checks bei
healthchecks.io auf: bei bestandener Prüfung die Adresse selbst, bei
angeschlagener Prüfung `…/fail`. Bleibt der Ping aus, schlägt healthchecks.io
von allein Alarm – auf einem Weg, der nicht durch GitHub führt.

Die Adresse steht im Repository-Secret `LEBENSZEICHEN_URL`. Ist es nicht
gesetzt, bleibt die Variable leer und der Schritt überspringt sich; der
Wachhund läuft unverändert weiter. Der Ping kann den Lauf nicht rot machen –
eine Störung bei healthchecks.io ist kein Problem dieser Seite, und ein
dauerhaft ausbleibender Ping wird ohnehin dort gemeldet.

Einstellung des Checks: Zeitplan `30 6 * * *` in UTC, Toleranz **6 Stunden**.
Die sechs Stunden sind kein Bauchgefühl, sondern der gemessene Verzug vom
25.10.2026 plus Luft.

**2. Kein Icinga, und auch kein zweiter, abfragender Überwachungsdienst.**
Begründung in den Alternativen.

## Alternativen

**Eine eigene Icinga-Instanz.** Verworfen. Icinga braucht einen Rechner, der
rund um die Uhr läuft, dazu Updates, Benachrichtigungswege und – weil auch
Icinga ausfallen kann – eine Überwachung der Überwachung. Für eine statische
Seite, die ein Rechenzentrumsnetz ausliefert, wäre der Wächter damit das
anfälligste Stück der ganzen Anlage und zugleich das einzige, das Handarbeit
verlangt. Das ist das Gegenteil des Ziels aus ADR 0009.

**Eine bereits vorhandene Icinga-Instanz mitbenutzen.** Verworfen, obwohl
billig. Es würde dieses privat betriebene Projekt an eine fremde
Betriebsumgebung binden: deren Alarmwege, deren Zuständigkeiten, deren
Lebensdauer. Wer die Seite später übernimmt, bekommt das Repository – aber
nicht den Zugang zu dieser Instanz, und merkt erst im Störungsfall, dass die
Überwachung ihm nie gehörte. Der Totmannschalter dagegen hängt an einem
Secret, das sichtbar im README steht und in zwei Minuten neu gesetzt ist.

**Ein abfragender Dienst (Uptime-Prüfung alle fünf Minuten).** Verworfen,
nicht wegen der Kosten, sondern wegen der Schlussfolgerung daraus: Niemand
hat Bereitschaft. Eine Meldung um 03:00 Uhr über eine Seite, die am nächsten
Vormittag gelesen wird, erzeugt nur Gewöhnung an Alarme. Eine Prüfung pro Tag
entspricht der Geschwindigkeit, mit der hier tatsächlich reagiert wird.

**Alles so lassen.** Verworfen. Eine Überwachung, die unbemerkt aufhört, ist
schlechter als keine: sie erzeugt Vertrauen, das nicht mehr gedeckt ist.
Genau dieses Vertrauen war der Zweck von ADR 0009.

## Konsequenzen

- Der Betrieb hängt an einem weiteren fremden Dienst. Er ist bewusst klein
  gewählt: Fällt healthchecks.io aus, ist die Folge ein falscher Alarm, nicht
  eine blinde Seite. Umgekehrt gilt das nicht.
- Was der Totmannschalter **nicht** leistet: eine Störung, die nach einer
  Prüfung beginnt und vor der nächsten endet, bleibt unentdeckt. Das ist
  hingenommen, siehe die verworfene Uptime-Prüfung.
- Der Alarm endet im Postfach des Betreibers. Wechselt die Zuständigkeit,
  muss dort umgestellt werden – das Repository kann das nicht wissen. Darum
  ist der Name des Secrets im README genannt und nicht nur im Workflow.
- Die Ping-Adresse ist ein Geheimnis: Wer sie kennt, kann ein Lebenszeichen
  fälschen und den Alarm damit unterdrücken. Sie gehört deshalb in die
  Secrets und nicht in die Workflow-Datei.
