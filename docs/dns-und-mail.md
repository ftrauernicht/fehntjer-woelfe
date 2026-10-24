# DNS und E-Mail

Betriebsanleitung. **Warum** die Einrichtung so aussieht, steht in
[ADR 0005](adr/0005-nameserver-bei-vercel.md) und
[ADR 0006](adr/0006-spf-ueber-strato-regel.md).

## Zuständigkeiten

| | |
|---|---|
| Registrar | STRATO |
| Autoritatives DNS | **Vercel** (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) |
| Website | Vercel, Projekt `fehntjer-woelfe` |
| Postfach und Versand | STRATO |

Die Domain ist bei Strato registriert, delegiert aber an Vercel. Alle
DNS-Einträge – auch die für Mail – werden deshalb **bei Vercel** gepflegt.
Strato kann sie nicht mehr automatisch setzen.

## Die Zone

Im Vercel-Dashboard unter **Domains → fehntjer-woelfe.de → DNS**, oder:

```bash
vercel dns ls fehntjer-woelfe.de
```

| Typ | Name | Wert | Wofür |
|---|---|---|---|
| ALIAS | `@` | Vercel | Website. `ALIAS` auf dem Apex, deshalb kein AAAA |
| ALIAS | `*` | Vercel | Subdomains |
| MX | `@` | `smtpin.rzone.de`, Priorität 5 | Posteingang bei Strato |
| TXT | `@` | `v=spf1 redirect=_spf.strato.com` | SPF |
| TXT | `_dmarc` | `v=DMARC1;p=reject;` | DMARC |
| CNAME | `autoconfig` | `autoconfigure.strato.de` | Einrichtung in Mailprogrammen |
| CAA | `@` | pki.goog, sectigo.com, letsencrypt.org | erlaubte Zertifikatsaussteller |

Einen Eintrag ändern:

```bash
vercel dns ls  fehntjer-woelfe.de          # Kennung ablesen
vercel dns rm  <kennung>
vercel dns add fehntjer-woelfe.de @ TXT "…"
```

## Mail-Authentifizierung

Die DMARC-Regel steht auf `p=reject`. Empfangende Server **lehnen** damit
jede Mail ab, die weder per SPF noch per DKIM authentifiziert ist.

DKIM gibt es nicht: Das Paket „Mail Starter" bietet keine kundeneigene
Einrichtung. **Die Ausrichtung trägt allein SPF.**

Daraus folgt dreierlei:

1. **Fällt der SPF-Eintrag weg, kommt keine Post mehr an.** Nicht im
   Spam-Ordner – abgelehnt.
2. **Ein neuer Versandweg muss vorher in den SPF.** Newsletter-Tool,
   Vereinssoftware, Kontaktformular: erst den Server eintragen, dann
   versenden.
3. **Nur ein SPF-Eintrag pro Domain.** Ein zweiter macht beide ungültig. Neue
   Absender werden als weiterer `include:` in den bestehenden Eintrag
   aufgenommen.

Kommt später ein Paket mit DKIM dazu, muss der `_domainkey`-Eintrag von Hand
in die Vercel-Zone übernommen werden.

## Website-Indexierung freigeben

In Vercel unter **Settings → Environment Variables**:

```
NEXT_PUBLIC_SITE_URL = https://fehntjer-woelfe.de
```

Danach einmal neu deployen. Erst damit gibt die Seite Canonicals, Sitemap und
`robots.txt` auf die echte Domain aus – und erlaubt die Indexierung. Siehe
[ADR 0001](adr/0001-indexierungssperre.md).

## Gesundheitsprüfung

Braucht keinen Zugang:

```bash
# Zeigt die Domain auf Vercel, und ist kein AAAA gesetzt?
nslookup -type=A    fehntjer-woelfe.de 8.8.8.8
nslookup -type=AAAA fehntjer-woelfe.de 8.8.8.8     # muss leer sein

# Delegierung angekommen?
nslookup -type=NS   fehntjer-woelfe.de 8.8.8.8     # ns1/ns2.vercel-dns.com

# Kommt Post an?
nslookup -type=MX   fehntjer-woelfe.de 8.8.8.8     # smtpin.rzone.de

# SPF und DMARC gesetzt?
nslookup -type=TXT  fehntjer-woelfe.de 8.8.8.8
nslookup -type=TXT  _dmarc.fehntjer-woelfe.de 8.8.8.8

# Seite erreichbar, Indexierung freigegeben?
curl -sI https://fehntjer-woelfe.de/ | head -1
curl -s  https://fehntjer-woelfe.de/robots.txt
```

Steht in `robots.txt` ein `Disallow: /`, fehlt `NEXT_PUBLIC_SITE_URL` oder das
Impressum ist unvollständig. Beides Absicht, kein Fehler.

## Wenn etwas klemmt

| Symptom | Wahrscheinliche Ursache |
|---|---|
| HTTPS antwortet nicht, HTTP schon | Zertifikat noch nicht ausgestellt. Im Vercel-Dashboard unter Domains nach Konflikten sehen |
| Seite über Mobilfunk anders als über WLAN | IPv6 gegen IPv4. Prüfen, ob irgendwo doch ein AAAA-Eintrag steht |
| Mails kommen nicht an | MX prüfen. Er muss auf `smtpin.rzone.de` zeigen |
| Mails werden abgelehnt | SPF prüfen. Mit `p=reject` ist ein fehlender SPF sofort fatal |
| Änderung wirkt nicht | DNS braucht bis zu 24 Stunden. Autoritativ gegenprüfen statt über einen Resolver |

Autoritativ fragen:

```bash
nslookup -type=TXT fehntjer-woelfe.de ns1.vercel-dns.com
```
