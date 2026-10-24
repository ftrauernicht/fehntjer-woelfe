# 0008 – Was öffentlich dokumentiert wird

Akzeptiert · 24.10.2026

## Kontext

Das Repository ist öffentlich und soll einem Nachfolger erlauben, den Betrieb
zu übernehmen. Dafür muss dokumentiert sein, was wo läuft. Gleichzeitig darf
nichts hinein, was Angreifern die Arbeit erleichtert.

## Entscheidung

Die Grenze verläuft entlang der Frage: **Ist das ohnehin öffentlich
abfragbar?**

**Hinein** – steht im DNS, in HTTP-Headern oder im Repository selbst:

- Nameserver, MX-Host, SPF- und DMARC-Werte
- Hoster, Projektname, Domain, CI-Konfiguration

**Draußen:**

| Was | Warum |
|---|---|
| Passwörter, Tokens, Schlüssel | offensichtlich |
| Kunden- und Auftragsnummern | identifizieren das Konto gegenüber dem Support; Material für Social Engineering |
| Postfach- und Aliasstruktur | verrät, welche Adressen existieren |
| Wiederherstellungswege, 2FA | — |

Ebenfalls draußen: Schwachstellen von Anbietern. Was in der Dokumentation als
„Grenze" beschrieben ist, ist dokumentiertes Produktverhalten. Eigene
Fehlkonfigurationen werden erst beschrieben, **nachdem** sie behoben sind.

## Alternativen

- **Gar nichts dokumentieren:** verworfen. Schützt nichts, weil die Angaben
  per `dig` in Sekunden zu holen sind, erschwert aber jede Übergabe.
- **Alles dokumentieren, auch Kundennummern:** verworfen, siehe Tabelle.
- **Dokumentation in ein privates Repository:** verworfen. Dann findet sie
  niemand, der sie braucht – und genau das war der Zweck.

## Konsequenzen

- `docs/infrastruktur.md` nennt Anbieter und Konsolen, aber keine Konten.
- Eine Übergabe läuft über den Betreiber laut Impressum, nicht über das
  Repository.
- `SECURITY.md` beschreibt den Meldeweg für Funde.
