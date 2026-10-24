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

Im Vercel-Projekt unter **Settings → Domains** `fehntjer-woelfe.de` **und**
`www.fehntjer-woelfe.de` hinzufügen. Vercel zeigt daraufhin die konkreten
DNS-Werte an.

> **Die IP-Adresse nicht aus dieser Datei abschreiben.** Vercel vergibt
> unterschiedliche Adressen je Projekt und ändert sie gelegentlich. Es gilt
> ausschließlich der Wert, den das Vercel-Dashboard für *dieses* Projekt
> anzeigt. Ältere Anleitungen nennen `76.76.21.21`, neuere andere Werte –
> beides kann für dieses Projekt falsch sein.

### Schritt 2 – Einträge bei Strato setzen

Im Strato-Kundenbereich unter **Domainverwaltung → DNS-Einstellungen**:

| Typ | Name | Wert | Hinweis |
|---|---|---|---|
| A | `@` | *(IP aus dem Vercel-Dashboard)* | ersetzt `217.160.0.41` |
| CNAME | `www` | `cname.vercel-dns.com` | oder der von Vercel genannte Wert |
| MX | `@` | `smtpin.rzone.de`, Priorität 10 | **unverändert lassen** |
| TXT | `@` | `v=spf1 ...` | siehe unten |

**Alle vorhandenen AAAA-Einträge auf `@` löschen.** Vercel unterstützt bei
fremdem DNS kein IPv6; ein übriggebliebener AAAA-Eintrag führt zu sporadisch
nicht erreichbaren Seiten, die schwer zu diagnostizieren sind.

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

Die Anschrift enthält bewusst keine Straße. Falls das später anders gesehen
wird: eine Zeile in `impressum.addressLines` ergänzen, mehr ist es nicht.

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
