# Markenleitfaden Fehntjer Wölfe

**Dieses Dokument richtet sich an Menschen und an KI-Modelle.** Es enthält die
harten Fakten, die man nicht raten soll: gemessene Farbwerte, verbindliche
Schreibweisen, die festen Beschreibungen der beiden Maskottchen und die Regeln,
an denen schon etwas schiefgegangen ist.

Wer hier etwas ändert, ändert es für alle künftigen Bilder, Texte und Logos.

Stand: 24.10.2026

---

## 1. Wer die Wölfe sind

Die **Fehntjer Wölfe** sind eine Nachwuchsmannschaft des **SV Grossefehn e.V.**
in Großefehn, Ostfriesland, Niedersachsen. Zurzeit spielen sie in der
**F-Jugend**.

### Drei Dinge, die man nicht behaupten darf

1. **Nicht „die jüngste Mannschaft des Vereins".** Unter der F-Jugend gibt es
   noch die G-Jugend. Diese Behauptung stand einmal im Seitentext und war
   falsch.
2. **Die Altersklasse ist nicht fest.** Ein Jahrgang rückt jedes Jahr auf: aus
   der F-Jugend wird die E-Jugend. Wer „F-Jugend" in einen Text schreibt, baut
   ein Verfallsdatum ein. Besser: „Nachwuchsmannschaft", und die Altersklasse
   nur dort nennen, wo sie leicht zu aktualisieren ist. In der Website steht
   sie als einzelne Konstante `ageGroup` in `src/content/site.ts`.
3. **Die Website ist privat betrieben**, kein offizielles Vereinsangebot. Sie
   darf nicht so auftreten, als spräche sie für den Gesamtverein.

### Schreibweisen – beide sind richtig

| | Variante A | Variante B |
|---|---|---|
| Mannschaft | Fehntjer **Wölfe** | Fehntjer **Woelfe** (so in der Domain) |
| Verein | SV **Großefehn** (Landkarte, Duden) | SV **Grossefehn** (so auf dem Vereinswappen) |

Das Vereinswappen selbst schreibt „GROSSEFEHN" ohne ß. Beide Formen sollen in
längeren Texten natürlich vorkommen, damit die Seite unter beiden gefunden
wird – **in ganzen Sätzen, nie als Stichwortliste.**

Instagram: [@fehntjer_woelfe](https://www.instagram.com/fehntjer_woelfe/)
E-Mail: mail@fehntjer-woelfe.de

---

## 2. Farben

**Alle Werte sind gemessen, nicht geschätzt.** Das Vereinsrot stammt aus der
offiziellen Druckdatei `Fehntjer Wölfe Logo.png`: Mittelwert über 172.186 Pixel
der gesättigten Rotfläche.

| Rolle | Hex | RGB | Verwendung |
|---|---|---|---|
| **Vereinsrot** | `#BF0B02` | 191, 11, 2 | Flächen, Trikot, Hero, Buttons |
| Vereinsrot dunkel | `#8F0801` | 143, 8, 1 | Hover, Schatten |
| Wolfsgrau | `#8A9099` | 138, 144, 153 | Fell der Maskottchen |
| Tiefschwarz | `#18181B` | 24, 24, 27 | Konturen, Text |
| Weiß | `#FFFFFF` | 255, 255, 255 | Trikotpartien, Text auf Rot |

**Das Rot ist ein reines, warmes Rot** – kein Karmesin, kein Blaustich. Eine
frühere Fassung dieser Seite nutzte `#C8102E`; das war deutlich zu bläulich und
ist korrigiert.

### Kontraste

Geprüft nach WCAG 2.1:

| Kombination | Verhältnis | |
|---|---|---|
| Weiß auf `#BF0B02` | 6,43 : 1 | AA bestanden |
| `#BF0B02` auf Weiß | 6,43 : 1 | AA bestanden |
| `#8F0801` auf Weiß | 9,53 : 1 | AA bestanden |

Wer eine neue Farbkombination einführt, rechnet den Kontrast nach. 4,5 : 1 ist
das Minimum für normalen Text.

### Sponsorenfarben (nicht Vereinsfarben)

Auf den Trikots stehen fremde Marken. Ihre Farben sind **nicht** Teil der
Vereinsidentität und dürfen nicht in eigene Gestaltung übernommen werden:

- **ELSCO Haustechnik**: Orange `#EC6608`, dazu Graustufen
- **VO Immobilien**, **Ostfriesische Brandkasse**: eigene Dateien, siehe unten

---

## 3. Logos

### Welche Datei wofür

| Datei | Inhalt | Einsatz |
|---|---|---|
| `Fehntjer Wölfe Logo.png` | Mannschaftswappen, 1254², weißer Hintergrund | **Die maßgebliche Fassung.** Website, Social Media, Druck |
| `svg-vereinswappen.png` | Vereinswappen SVG, 512², transparent | wo die Zugehörigkeit zum Verein gezeigt wird |

Die Originale liegen beim Verein beziehungsweise im Referenzordner des
Bildprojekts – **nicht** in diesem Repository. Eingecheckt sind nur die
verkleinerten Web-Fassungen unter `public/logo/`, erzeugt von
`scripts/optimize-images.mjs`.

### Regeln

1. **Das Wappen wird nie nachgezeichnet, nachgebaut oder „neu interpretiert".**
   Es wird verwendet, wie es ist. Ein KI-generiertes Wappen sieht fast richtig
   aus – und genau das ist das Problem.
2. **Nie verzerren.** Seitenverhältnis bleibt.
3. **Nicht auf Rot stellen.** Beide Wappen sind selbst rot-weiß. Auf rotem
   Grund gehören sie auf eine weiße Fläche – wie ein aufgeklebter Aufnäher.
4. **Das Vereinswappen ist eine fremde Marke.** Die Verwendung auf einer
   privaten Mannschaftsseite ist üblich, sollte aber mit dem Verein abgestimmt
   sein.
5. **Sponsorenlogos nie generieren.** Dafür gibt es Druckdateien (SVG, AI, EPS,
   PDF) vom Verein, in den Varianten Brust/Rücken und farbig/schwarz. Ein
   nachgebautes Sponsorenlogo ist ein Vertragsproblem, kein Designfehler.

---

## 4. Die beiden Maskottchen

Es gibt **zwei** Wölfe, nicht einen. Sie müssen auf jedem Bild unterscheidbar
sein.

| | **Spieler-Wolf** (jung) | **Trainer-Wolf** (älter) |
|---|---|---|
| Fell | helleres Silbergrau, glatt | dunkleres Stahlgrau, struppiger |
| Augenbrauen | keine | zwei kräftige dunkle Brauen – sein Erkennungsmerkmal |
| Augen | weit offen, rund, **blau** | schmaler, aber **gleiches Blau** |
| Mund | offenes Grinsen, Zunge sichtbar | geschlossenes, wissendes Schmunzeln |
| Haltung | rennt, springt, jubelt | zeigt, erklärt, Pfote am Kinn |
| Kleidung | Trikot | schwarze Trainerjacke |

**Beide haben blaue Augen.** Das ist die häufigste Abweichung: Modelle geben
dem älteren Wolf gern braune Augen. Ebenso häufig: schwere Lider, die ihn
arrogant statt souverän wirken lassen.

Die wörtlichen, englischen Prompt-Bausteine stehen in
`prompts/woelfe-charakter.md` des Bildprojekts, in den Abschnitten `BASIS`,
`SPIELER`, `TRAINER`, `DUO`, `STYLE` und `NEGATIVE`. **Diese Blöcke gehen
unverändert in jeden Prompt.** Jede Umformulierung kostet Konsistenz über die
Bildserie hinweg.

### Zwei Stilregister – eines auswählen

Das vorhandene Material ist nicht einheitlich:

| | **Wappen** | **Duo-Sticker** (Protokollfolien, Elternbriefe) |
|---|---|---|
| Kopfanteil | etwa ¼ der Figur | etwa **⅖**, groß und rund |
| Register | Sport-Logo, dynamisch, kantig | Kinder-Sticker, weich, knuffig |
| Augen | mittelgroß | groß, rund, eng beieinander |

**Für neue Motive gilt das Duo-Sticker-Register.** Das Wappen bleibt Wappen und
wird nicht nachgebaut. Ein Steckbrief, der zwischen beiden liegt, erzeugt
schlanke Huskys statt Maskottchen – das ist einmal passiert.

---

## 5. Regeln für Bildgenerierung

### Keine Schrift im generierten Bild

Bildmodelle setzen Text nicht zuverlässig. Auf einem früheren Motiv war aus
„jetzt geht's los!" ein verrutschter Buchstabensalat geworden. Bei einem
Vereinsnamen fällt jeder Fehler sofort auf.

**Also:** Trikots bleiben im Prompt blank – rot-weiß, ohne Aufdruck, ohne
Nummern, ohne Brustmarke. Schrift, Wappen und Sponsorenleiste kommen
**nachträglich** in Canva, PowerPoint oder GIMP dazu. Das dauert zwei Minuten
und sieht immer richtig aus.

### Das Vereinswappen im Bild

Getestet: Bei **einem** Wolf gelingt eine runde rot-weiße Scheibe mit
Kreuz-Stern, ohne Schrift, als Marke erkennbar. Bei **zwei** Wölfen wurde
daraus ein Wappenschild mit Blümchen-Emblem.

**Regel:** Das generierte Wappen ist eine *Andeutung*, keine Marke. Für alles
Öffentliche das echte Wappen hinterher auflegen.

### Maßstab

Die Wölfe sind eine **Nachwuchsmannschaft im Kleinfeld**: Mini-Tore, ein paar
Eltern am Zaun, ein kleiner Turnierpokal. **Kein Stadion, kein tosendes
Publikum, kein Riesenpokal, kein Konfettiregen.**

Das steht im NEGATIVE-Block des Steckbriefs, nicht in einzelnen Szenen –
Stadion, Tribünen, Flutlichtmasten, Publikum und Bandenwerbung sind generell
verboten. Der Grund: Zwei Bilder hatten ein Stadion **von sich aus**
dazuerfunden, obwohl keine Szene es nannte. Eine Regel pro Szene reicht dafür
nicht.

### Formate

| Kanal | Seitenverhältnis |
|---|---|
| Instagram-Beitrag | 4:5 |
| Sticker, Profilbild | 1:1 |
| Protokollfolien, Elternbrief | 16:9 |

### Prüfpflicht

**Jedes generierte Bild wird vor der Veröffentlichung einzeln und
vergrößert angesehen.**

Das Wort *vergrößert* steht hier, weil es einmal gefehlt hat: Ein Wolf hatte
nur einen Arm – der zweite endete an der Schulter. Auf einem Kontaktbogen mit
900 Pixel Kachelbreite war das nicht zu sehen, und das Bild ging so online.
Prüfen heißt: jede Figur so groß, dass man **Arme, Pfoten, Ohren, Schwänze und
Finger zählen kann**. Ein Kontaktbogen taugt für die Auswahl, nicht für die
Abnahme.
Die Quote ist kein Zufall: Bei einem Durchlauf von fünfzehn Motiven waren vier
unbrauchbar, bei einem späteren von zehn immerhin noch drei.

Was aufgetreten ist:

- ein Bild zeigte **zwei** Wölfe, obwohl die Szene auf einen gestellt war
- Bilder mit **braunen statt blauen** Augen
- ein Wappen, das zu einem Schild mit Blumenmuster geworden war
- **erfundene Stadien** in Szenen, die keines nannten
- ein **fehlender Arm**, der auf dem Kontaktbogen nicht auffiel
- **zwei Schwänze** an einer Figur
- **zwei Bälle**, obwohl die Szene einen nannte

### Drei Kniffe, die gegen diese Fehler helfen

Erprobt, nicht vermutet – jeder hat einen konkreten Fehler behoben.

**Denselben Prompt neu zu würfeln hilft meistens nicht, es tauscht den Fehler
nur aus.** Bei einem Motiv fehlte im ersten Lauf ein Arm, im zweiten waren die
Augen braun, im dritten fehlte der Arm am anderen Wolf. Erst der präzisere
Prompt saß. Vier Bildläufe für ein Motiv sind ein Zeichen dafür, dass die
Szenenzeile ungenau ist – nicht dafür, dass man Pech hat.

| Fehler | Was hilft |
|---|---|
| Ein Körperteil fehlt | **Benennen, was es tut.** „both standing side by side" lässt die äußeren Arme verschwinden. „the younger wolf rests his free paw flat against his own thigh, the older wolf rests his free paw on his hip" nicht. |
| Etwas ist doppelt | **Die Anzahl ausschreiben.** „exactly one tail in the whole picture and no second tail near his head", „exactly one football, none lying on the grass". |
| Ein Merkmal driftet trotz Steckbrief | **In die Szenenzeile ziehen.** Die Augenfarbe stand im NEGATIVE-Block und kippte trotzdem auf Braun. Erst in der Szene formuliert – „the older wolf's irises are sky-blue too, not brown and not grey" – hielt sie. |

Der Steckbrief trägt das Aussehen, die Szenenzeile trägt das, was im **konkreten
Bild** schiefgehen kann. Wer einen wiederkehrenden Fehler nur im Steckbrief
bekämpft, kämpft an der falschen Stelle.

Weitere typische Fehler: drei Ohren, zwei Schwänze, zwei identische Wölfe,
Textfetzen im Hintergrund, abgeschnittene Füße.

### Offenlegung

Dass ein Bild KI-generiert ist, gehört sichtbar auf die Seite – nicht ins
Kleingedruckte. Auf `/bilder` steht es über der Galerie, im Impressum
ebenfalls.

---

## 6. Tonfall und Mottos

### Wie die Wölfe sprechen

Der Instagram-Account gibt den Ton vor: **„Moin! Wir sind die F-Jugend des SV
Grossefehn."** Dazu kurze, flapsige Bildunterschriften wie *„Top-Lage, perfekte
Aussicht… direkt ins Netz!"*

Daraus abgeleitet:

- **„Moin" statt „Herzlich willkommen".** Ostfriesland, nicht Werbeagentur.
- **Kurze Sätze.** Eltern lesen das am Handy zwischen zwei Terminen.
- **Augenzwinkern erlaubt**, Pathos nicht. Es ist Kinderfußball, keine
  Champions League.
- **Wir-Form.** Die Mannschaft spricht, nicht eine Abteilung.
- **Keine Superlative.** Nicht „die beste Jugend", nicht „einzigartig". Siehe
  auch Abschnitt 1: keine Behauptung ohne Deckung.

### Mottos – was passt

Gut, weil kurz, regional und ohne Angeberei:

> Moin, wir sind die Wölfe.
> Klein, aber laut.
> Erst Rudel, dann Tor.
> Kleinfeld, großes Herz.
> Wir laufen, bis die Socken rutschen.

Was **nicht** passt: alles mit „Champions", „Elite", „Legende", „unbesiegbar".
Und alles, was eine sportliche Behauptung aufstellt, die nächste Woche
überprüfbar falsch sein kann.

### Umgang mit „Wölfe"-Bildsprache

Rudel, Spuren, Heulen, zusammenhalten – das trägt. **Nicht** tragen: Reißzähne,
Beute, Jagd, Angriff. Es geht um Kinder; ein Maskottchen mit gefletschten
Zähnen wäre aus demselben Grund falsch wie ein Motto über Beute.

---

## 7. Checkliste vor der Veröffentlichung

- [ ] Steht eine Altersklasse im Text? Dann ist sie noch aktuell?
- [ ] Keine Behauptung über „die jüngste" oder „die beste" Mannschaft?
- [ ] Beide Wölfe unterscheidbar, beide mit blauen Augen?
- [ ] Keine Schrift im generierten Bild?
- [ ] Keine nachgebauten Sponsorenlogos?
- [ ] Wappen unverzerrt, auf weißem Grund?
- [ ] Rot ist `#BF0B02`?
- [ ] Bei KI-Bildern: Hinweis sichtbar?
- [ ] Bild einzeln angesehen – Ohren, Schwänze, Finger, Bildränder?

---

## 8. Wo was liegt

| Was | Wo |
|---|---|
| Website, Quelltext | dieses Repository |
| Texte und Stammdaten | `src/content/site.ts` |
| Bildliste der Galerie | `src/content/gallery.json` |
| Web-Fassungen der Bilder | `public/bilder/`, `public/logo/` |
| Bildskript | `scripts/optimize-images.mjs` |
| DNS und E-Mail | [`docs/dns-und-mail.md`](dns-und-mail.md) |
| Charakter-Steckbrief, Szenen | Bildprojekt, `prompts/` |
| Originalbilder, Druckdateien | Bildprojekt, `referenz/` – **nicht** im Repo |
