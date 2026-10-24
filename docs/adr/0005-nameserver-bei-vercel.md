# 0005 – Nameserver bei Vercel statt bei Strato

Akzeptiert · 24.10.2026

## Kontext

Die Domain liegt bei Strato, das Postfach ebenfalls. Die Website läuft auf
Vercel. Zunächst blieb das DNS bei Strato, und nur A- und CNAME-Einträge
zeigten auf Vercel.

Das scheiterte an einem Detail: Strato hält auf der Hauptdomain einen
AAAA-Eintrag auf die eigene IPv6-Adresse. Vercel unterstützt bei fremdem DNS
kein IPv6, meldete den Eintrag als Konflikt und stellte **kein Zertifikat**
aus. Über IPv4 antwortete die Domain, über HTTPS gar nicht – und Besucher mit
IPv6, in Deutschland die Mehrheit, landeten weiter auf der Strato-Parkseite.

## Entscheidung

Die Nameserver wurden auf `ns1.vercel-dns.com` und `ns2.vercel-dns.com`
umgestellt. Vercels DNS beherrscht `ALIAS` auf dem Apex; damit entfällt der
AAAA-Eintrag ersatzlos.

Vorgehen ohne Ausfallfenster: erst alle Mail-Einträge in der Vercel-Zone
anlegen (MX, SPF, DMARC, `autoconfig`), dann die Nameserver umstellen.

## Alternativen

| Weg | Warum verworfen |
|---|---|
| AAAA bei Strato löschen | Die Oberfläche bietet nur „STRATO Standard" oder „eigene IP", kein Löschen. Stratos FAQ-Artikel 539 kennt ebenfalls nur das Setzen. |
| AAAA auf eine Vercel-IPv6 zeigen | Vercel hat keine. Weder `cname.vercel-dns.com` noch das projekteigene CNAME-Ziel führen einen AAAA-Eintrag – nachgeprüft. |
| `www` als kanonische Adresse, Apex liegen lassen | Technisch möglich, aber die Hauptdomain hätte IPv6-Besuchern weiter die Parkseite gezeigt. |
| Strato-Support um Löschung bitten | Hätte funktionieren können, dauert aber und war unsicher. Blieb als Rückfallebene. |

### Zur Warnung von Strato

Beim Umstellen blendet Strato ein: „Bei der Verwendung eigener Nameserver
stehen STRATO E-Mail-Funktionen für diese Domain nicht zur Verfügung."

Das wurde zunächst als Abschaltung des Postfachs gelesen und die Entscheidung
deshalb einmal zurückgenommen. **Das war falsch.** Stratos eigene
Dokumentation stellt klar: Mit eigenen Nameservern pflegt Strato die Einträge
nicht mehr automatisch; das Postfach läuft weiter, solange der MX auf Strato
zeigt.

## Konsequenzen

- **Alle DNS-Einträge werden jetzt bei Vercel gepflegt**, auch die für Mail.
  Strato kann das nicht mehr automatisch.
- Käme später DKIM dazu, muss der `_domainkey`-Eintrag von Hand in die
  Vercel-Zone übernommen werden.
- Die Domain bleibt bei Strato registriert; nur die Delegierung wandert.
- Registry-Änderungen brauchen bis zu 24 Stunden.
