# 0010 – Vorbereitung auf Antwortmaschinen

Akzeptiert · 25.10.2026

## Kontext

Am 25.10.2026, einen Tag nach der Freigabe, war die Startseite im
Google-Index und stand bei der Suche nach „Fehntjer Wölfe" auf Platz 1 der
Webergebnisse. **Googles KI-Übersicht behauptete auf derselben Seite:**

> „Ein Verein oder eine Mannschaft mit dem exakten Namen ‚Fehntjer Wölfe' im
> Fußball existiert nicht."

Sie verwechselte die Mannschaft mit freilebenden Wölfen in den ostfriesischen
Fehngebieten und mit den „Fehntjer Fins", einem American-Football-Team.

Der klassische Index und die Antwortschicht sind also zwei verschiedene
Dinge. Was in den Index kommt, ist damit noch nicht in einer Antwort. Für
eine Mannschaft, deren Name mit drei anderen Bedeutungen kollidiert, ist das
keine Randfrage: wer nach ihr fragt, bekommt eine Verneinung.

Dazu kommt die Ausgangslage: die Seite ist die **einzige** Quelle über diese
Mannschaft. Es gibt keine zweite Seite, die sie erwähnt, und keinen
eingehenden Link.

## Entscheidung

**1. Die strukturierten Daten werden ein verbundener Graph.** Mannschaft und
Website bekommen feste Kennungen (`@id`), die Website verweist über `about`
auf die Mannschaft. Die Mannschaft trägt zusätzlich `description` – denselben
Satz, der als Meta-Beschreibung ausgeliefert wird und den Google als Snippet
zitiert –, dazu `logo`.

**2. Der Verein wird sichtbar verlinkt.** Der Vereinsabsatz verwies bisher auf
den Verein, ohne ihn zu verlinken. Jetzt steht dort ein Link auf
`sv-grossefehn.de`; damit darf auch `memberOf.url` in die strukturierten Daten.
Das ist das einzige Band zur Vereinsentität, das wir selbst setzen können.

**3. `/llms.txt` fasst die Seite maschinenlesbar zusammen**, erzeugt aus
`site.ts` und `gallery.json`. Enthalten ist auch die Abgrenzung: Fußball, nicht
Wolfsrudel; privat betrieben; Bilder KI-generiert.

**4. KI-Crawler bleiben zugelassen.** `User-Agent: *` schließt GPTBot,
ClaudeBot, PerplexityBot, OAI-SearchBot und Google-Extended ein. Das ist eine
inhaltliche Entscheidung und steht als solche im Kopf von `robots.ts`.

## Alternativen

**KI-Crawler aussperren.** Verbreitete Reaktion, hier aber sinnlos: eine
Mannschaft, die gefunden werden will, verliert dadurch nur einen Kanal. Es
gibt auf dieser Seite nichts zu schützen, was nicht ohnehin öffentlich ist.

**`FAQPage` mit erfundenen Fragen.** Hätte Platz in den Suchergebnissen
gebracht. Verlangt aber Fragen und Antworten, die auch sichtbar auf der Seite
stehen – sonst ist es ein Richtlinienverstoß. Dafür ist der Seiteninhalt zu
dünn, und erfundene Fragen hätte der Betreiber zu Recht wieder gestrichen.

**Mehr Text mit beiden Schreibweisen.** Die Versuchung bei dünnen Seiten. Der
Betreiber hat schon dreimal Absätze streichen lassen, die nichts sagten;
Füllabsätze für Suchmaschinen wären genau das – und Antwortmaschinen zitieren
sie ohnehin nicht.

**Nichts tun und warten.** Die Antwortschicht holt auf, sobald es mehr
Quellen gibt. Nur: die Quellen entstehen nicht von selbst, und die Maßnahmen
oben kosten fast nichts.

## Konsequenzen

- **Der Nutzen von `/llms.txt` ist nicht belegt.** Kein großer Anbieter hat
  zugesagt, die Datei zu lesen. Sie steht hier, weil sie sich selbst erzeugt
  und darum nicht veralten kann – nicht, weil ihre Wirkung erwiesen wäre. Der
  Wachhund prüft sie mit, damit ein stilles 404 auffällt.
- **Der wirksamste Hebel liegt außerhalb dieses Repositorys:** ein Link aus
  dem Instagram-Profil und einer von der Vereinsseite. Eine einzige Quelle
  ohne eingehende Links trägt keine Antwort. Daran ändert kein Markup etwas.
- Die Regel „nichts in strukturierten Daten, was nicht sichtbar auf der Seite
  steht" gilt weiter und hat hier den Weg bestimmt: der Vereinslink kam
  **zuerst** sichtbar auf die Seite, dann in die Daten.
- Der Vergleich ist nachprüfbar: heute sagt die KI-Übersicht, die Mannschaft
  existiere nicht. Wer das in einigen Wochen erneut sucht, sieht, ob die
  Maßnahmen gewirkt haben.
