# DNS, Domain und E-Mail

Stand der Prüfung: **24.10.2026**. Alle Werte unten sind an diesem Tag
nachgemessen, nicht aus einer Anleitung abgeschrieben.

## Ist-Zustand

```
$ nslookup -type=NS fehntjer-woelfe.de
  docks07.rzone.de, shades04.rzone.de     → Strato

$ nslookup -type=MX fehntjer-woelfe.de
  5  smtpin.rzone.de                       → Strato-Postfach, bereits aktiv

$ nslookup -type=A fehntjer-woelfe.de
  217.160.0.41                             → Strato-Parkseite

$ nslookup -type=TXT fehntjer-woelfe.de
  (kein SPF-Eintrag)
```

Zwei Dinge fallen auf:

1. **Das Postfach ist schon verdrahtet.** Der MX zeigt auf Strato. An dieser
   Stelle ist nichts zu tun.
2. **Es fehlt ein SPF-Eintrag.** Ohne SPF landen ausgehende Mails von
   `mail@fehntjer-woelfe.de` häufiger im Spam-Ordner.

## Entscheidung: DNS bleibt bei Strato

Vercel kann die Nameserver übernehmen. **Machen wir nicht.**

Begründung: Strato richtet die Mail-Einträge (MX, Autodiscover, später DKIM)
beim Anlegen des Postfachs automatisch ein. Zieht man die Nameserver zu Vercel
um, müssen all diese Einträge von Hand nachgebaut werden – und ein Tippfehler
bedeutet, dass die Vereinsadresse keine Mails mehr empfängt. Der Gewinn wäre
gering: Vercel funktioniert mit fremdem DNS genauso gut.

Also: **DNS bei Strato, nur zwei Einträge zeigen auf Vercel.**

## Umstellung auf die echte Domain

Die Seite läuft zunächst unter einer `*.vercel.app`-Adresse. Solange das so
ist, hält sie sich selbst aus dem Suchindex (siehe `src/app/robots.ts`).

### Schritt 1 – Domain in Vercel eintragen

**Erledigt am 24.10.2026.** `fehntjer-woelfe.de` und `www.fehntjer-woelfe.de`
sind dem Projekt zugeordnet.

### Schritt 2 – Einträge bei Strato setzen

Die folgenden Werte sind am 24.10.2026 mit `vercel domains verify` aus **diesem
Projekt** ausgelesen. Sie gelten nicht allgemein für Vercel – ältere Anleitungen
nennen andere Adressen.

Im Strato-Kundenbereich unter **Domainverwaltung → DNS-Einstellungen**:

| Typ | Name | Wert | Aktion |
|---|---|---|---|
| A | `@` | `216.198.79.1` | ersetzt `217.160.0.41` |
| A | `@` | `64.29.17.1` | optional, nur falls mehrere A-Einträge möglich sind |
| CNAME | `www` | `41a9139b0b1649f1.vercel-dns-017.com.` | ersetzt den bisherigen Eintrag |
| AAAA | `@` | `2001:8d8:100f:f000::200` | **löschen** |
| AAAA | `www` | `2001:8d8:100f:f000::200` | **löschen** |
| MX | `@` | `smtpin.rzone.de` | **unverändert lassen** |

Drei Dinge, an denen es sonst scheitert:

1. **Ein A-Eintrag genügt.** Vercel nennt zwei Adressen, aber Strato lässt für
   die Hauptdomain nur einen zu. Das ist unkritisch: Vercel liefert über ein
   Anycast-Netz aus, die einzelne Adresse ist also bereits verteilt. Der zweite
   Eintrag wäre zusätzliche Ausfallsicherheit, keine Voraussetzung.
2. **Die AAAA-Einträge wirklich löschen.** Vercel unterstützt bei fremdem DNS
   kein IPv6. Bleibt ein AAAA stehen, erreichen Besucher mit IPv6 weiterhin die
   alte Strato-Seite – sporadisch und schwer zu diagnostizieren.
3. **Den MX nicht anfassen.** Sonst kommt keine Post mehr an
   `mail@fehntjer-woelfe.de` an.

### Schritt 3 – SPF eintragen

Den genauen `include:`-Wert gibt Strato im Kundenbereich vor. Er konnte am
24.10.2026 **nicht** aus öffentlicher Dokumentation bestätigt werden, deshalb
steht hier bewusst kein geratener Wert.

Vorgehen: Im Strato-Kundenbereich unter **E-Mail → Einstellungen** nach
„SPF" suchen. Strato bietet dort meist eine Schaltfläche, die den passenden
Eintrag selbst setzt. Nur falls es die nicht gibt, den von Strato genannten
Wert als TXT-Eintrag auf `@` eintragen.

**Wichtig:** Es darf nur *einen* SPF-Eintrag pro Domain geben. Ein zweiter
macht beide ungültig.

### Schritt 4 – Umgebungsvariable setzen

**Erst wenn die Domain tatsächlich auf Vercel zeigt.** Vorher richtet diese
Variable Schaden an: sie gibt die Indexierung frei und setzt alle Canonicals
auf `fehntjer-woelfe.de`. Zeigt die Domain zu diesem Zeitpunkt noch auf die
Strato-Parkseite, verweist die ausgelieferte Seite auf fremden Inhalt.

In Vercel unter **Settings → Environment Variables**:

```
NEXT_PUBLIC_SITE_URL = https://fehntjer-woelfe.de
```

Erst damit gibt die Seite Canonicals, Sitemap und robots.txt auf die echte
Domain aus – und erst damit erlaubt sie überhaupt die Indexierung. Nach dem
Setzen einmal neu deployen.

### Schritt 5 – Impressum

Erledigt: In `src/content/site.ts` stehen Name und Ort, keine Platzhalter mehr.
Die zweite Bedingung der Indexierungssperre ist damit erfüllt, es fehlt nur
noch `NEXT_PUBLIC_SITE_URL` aus Schritt 4.

Die Anschrift ist vollständig, inklusive Straße.

## Prüfen, ob es geklappt hat

```bash
# Zeigt die Domain auf Vercel?
nslookup -type=A fehntjer-woelfe.de 8.8.8.8

# Empfängt das Postfach weiterhin?
nslookup -type=MX fehntjer-woelfe.de 8.8.8.8     # muss smtpin.rzone.de bleiben

# Ist SPF gesetzt?
nslookup -type=TXT fehntjer-woelfe.de 8.8.8.8

# Erlaubt die Seite jetzt Indexierung?
curl -s https://fehntjer-woelfe.de/robots.txt
```

Die letzte Zeile muss `Allow: /` enthalten und auf die Sitemap zeigen. Steht
dort `Disallow: /`, fehlt `NEXT_PUBLIC_SITE_URL` – lokal mit gesetzter Variable
getestet und bestätigt.

DNS-Änderungen bei Strato brauchen erfahrungsgemäß bis zu 24 Stunden, bis sie
überall sichtbar sind.

## Was danach noch ansteht

- **DKIM und DMARC** für die Mailadresse. Beides erhöht die Zustellrate
  deutlich. Strato bietet DKIM im Kundenbereich an; DMARC kommt als
  TXT-Eintrag auf `_dmarc` und sollte mit `p=none` beginnen, damit man erst
  einmal Berichte sammelt, bevor man schärfer stellt.
- **Google Search Console** einrichten und die Sitemap einreichen. Das ist der
  schnellste Weg, überhaupt in den Index zu kommen.
- **Den Link ins Instagram-Profil setzen.** Das ist der einzige eingehende
  Link, über den der Verein selbst verfügt – und für eine neue Domain das
  stärkste Signal, das ohne fremdes Zutun zu haben ist.
