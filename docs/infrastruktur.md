# Infrastruktur

Dieses Dokument richtet sich an die Person, die das hier einmal übernimmt.
Es beantwortet: **Was läuft wo, und wen muss ich fragen?**

Stand: 24.10.2026

---

## Was hier steht – und was bewusst nicht

**Hier steht nur, was ohnehin öffentlich abfragbar ist.** Nameserver, MX-Host,
SPF- und DMARC-Werte stehen im DNS und sind mit einem `dig` in Sekunden
auslesbar. Der Hoster steht in den HTTP-Headern. Das Repository ist öffentlich.
Diese Dinge zu verschweigen schützt niemanden, erschwert einem Nachfolger aber
alles.

**Nicht hier stehen:**

| Was | Warum nicht | Wo stattdessen |
|---|---|---|
| Passwörter, Tokens, API-Schlüssel | offensichtlich | Passwortmanager des Betreibers |
| Kunden- und Auftragsnummern | identifizieren das Konto gegenüber dem Support und sind damit Material für Social Engineering | Passwortmanager |
| Postfach- und Aliasstruktur | sagt Angreifern, welche Adressen existieren | Strato-Kundenbereich |
| Wiederherstellungswege, 2FA | — | Passwortmanager |

Auch nicht hier: Schwachstellen von Anbietern. Was in diesem Dokument als
„Grenze" beschrieben ist, ist dokumentiertes Produktverhalten, keine Lücke.
Fehlkonfigurationen der eigenen Domain werden nur beschrieben, **nachdem** sie
behoben sind.

---

## Überblick

| Ebene | Anbieter | Bemerkung |
|---|---|---|
| Domain-Registrar | STRATO | Vertrag „STRATO Mail Starter", enthält die Domain |
| DNS (autoritativ) | **Vercel** | seit 24.10.2026, vorher Strato |
| Website-Hosting | Vercel | Projekt `fehntjer-woelfe`, Hobby-Plan |
| Quelltext, CI | GitHub | [ftrauernicht/fehntjer-woelfe](https://github.com/ftrauernicht/fehntjer-woelfe), öffentlich |
| E-Mail | STRATO | Postfach bleibt bei Strato, auch nach dem DNS-Umzug |
| Bildgenerierung | Google Gemini API | separates Projekt, nicht Teil dieses Repos |

Der Betrieb ist **privat**, nicht durch den SV Grossefehn e.V. Siehe Impressum.

---

## DNS

Autoritativ sind seit dem 24.10.2026 `ns1.vercel-dns.com` und
`ns2.vercel-dns.com`. Verwaltet wird die Zone im Vercel-Dashboard unter
**Domains → fehntjer-woelfe.de → DNS**, oder mit der CLI:

```bash
vercel dns ls fehntjer-woelfe.de
```

Inhalt der Zone (alles öffentlich abfragbar):

| Typ | Name | Wert | Wofür |
|---|---|---|---|
| ALIAS | `@` | Vercel | Website, löst IPv4 auf – **kein AAAA**, siehe unten |
| ALIAS | `*` | Vercel | Platzhalter für Subdomains |
| MX | `@` | `smtpin.rzone.de` (Prio 5) | Posteingang bei Strato |
| TXT | `@` | `v=spf1 redirect=_spf.strato.com` | SPF |
| TXT | `_dmarc` | `v=DMARC1;p=reject;` | DMARC |
| CNAME | `autoconfig` | `autoconfigure.strato.de` | automatische Einrichtung in Mailprogrammen |
| CAA | `@` | pki.goog, sectigo.com, letsencrypt.org | erlaubte Zertifikatsaussteller |

### Warum die Nameserver umgezogen sind

Strato hielt auf der Hauptdomain einen AAAA-Eintrag auf die eigene
IPv6-Adresse und bietet in der Oberfläche **kein Löschen** an, nur Umsetzen.
Vercel unterstützt bei fremdem DNS kein IPv6 und stellte deshalb kein
Zertifikat aus; Besucher über IPv6 landeten weiter auf der Strato-Parkseite.

Vercels eigenes DNS kennt dagegen `ALIAS` auf dem Apex – damit entfällt der
AAAA-Eintrag ersatzlos. Der Umzug war die Lösung, nicht der Umweg.

Strato blendet beim Umstellen einen Hinweis ein, die E-Mail-Funktionen stünden
dann nicht zur Verfügung. Nach Stratos eigener Dokumentation bedeutet das:
Strato pflegt die Einträge nicht mehr automatisch – das Postfach läuft weiter,
solange der MX auf Strato zeigt. Genau so ist es eingerichtet.

---

## E-Mail

Postfach und Versand liegen bei Strato, verwaltet im Strato-Kundenbereich
unter **E-Mail → E-Mail-Verwaltung**.

Die Authentifizierungs-Einträge liegen seit dem DNS-Umzug bei Vercel und
müssen dort gepflegt werden – Strato kann das nicht mehr automatisch.

**DKIM:** Das Paket „Mail Starter" bietet keine kundeneigene DKIM-Einrichtung.
Die DMARC-Ausrichtung trägt deshalb allein SPF. Wer auf ein Paket mit DKIM
wechselt, muss den `_domainkey`-Eintrag von Hand in die Vercel-Zone übernehmen.

**Vorsicht bei `p=reject`:** Die DMARC-Regel steht auf der schärfsten Stufe.
Wer künftig über einen anderen Dienst versendet – Newsletter-Tool,
Vereinssoftware, Kontaktformular –, muss dessen Server **vorher** in den
SPF-Eintrag aufnehmen. Sonst werden diese Mails abgelehnt, nicht nur
markiert.

---

## Website

Next.js auf Vercel. Jeder Push auf `main` löst ein Deployment aus; die
GitHub-Verbindung ist eingerichtet.

Wichtige Umgebungsvariable:

| Name | Wert | Wirkung |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://fehntjer-woelfe.de` | gibt Indexierung frei und setzt alle Canonicals |

Ohne diese Variable hält sich die Seite selbst aus dem Suchindex. Das ist
Absicht, siehe README.

---

## Wen fragen

| Thema | Wo |
|---|---|
| Domain, Postfach, Rechnungen | STRATO-Kundenbereich, Hotline steht dort |
| Website, DNS-Zone, Deployments | Vercel-Dashboard |
| Quelltext, Fehler, Verbesserungen | GitHub-Issues des Repositories |
| Inhalte, Bilder, Vereinsfragen | der Verein beziehungsweise der Betreiber laut Impressum |

Zugänge zu Strato, Vercel und GitHub hat der Betreiber laut Impressum. Eine
Übergabe läuft über ihn, nicht über dieses Dokument.

---

## Ist alles gesund?

Diese Abfragen brauchen keinen Zugang und beantworten die häufigsten Fragen:

```bash
# Zeigt die Domain auf Vercel, und ist der AAAA-Eintrag wirklich weg?
nslookup -type=A    fehntjer-woelfe.de 8.8.8.8
nslookup -type=AAAA fehntjer-woelfe.de 8.8.8.8     # muss leer sein

# Kommt Post noch an?
nslookup -type=MX   fehntjer-woelfe.de 8.8.8.8     # smtpin.rzone.de

# Sind SPF und DMARC gesetzt?
nslookup -type=TXT  fehntjer-woelfe.de 8.8.8.8
nslookup -type=TXT  _dmarc.fehntjer-woelfe.de 8.8.8.8

# Läuft die Seite, und darf sie in den Index?
curl -sI https://fehntjer-woelfe.de/ | head -1
curl -s  https://fehntjer-woelfe.de/robots.txt
```

Steht in `robots.txt` noch `Disallow: /`, fehlt `NEXT_PUBLIC_SITE_URL` oder das
Impressum ist unvollständig – beides Absicht, beides im README erklärt.
