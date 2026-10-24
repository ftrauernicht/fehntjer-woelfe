# 0006 – SPF über Stratos Standardregel

Akzeptiert · 24.10.2026

## Kontext

Beim Einrichten der Domain fiel eine Kombination auf, die Mailversand
zuverlässig verhindert:

| Eintrag | Zustand |
|---|---|
| DMARC | `v=DMARC1;p=reject;` – schärfste Stufe, aktiv |
| SPF | gar nicht vorhanden |
| DKIM | unter den üblichen Selektoren nicht auffindbar |

`p=reject` weist empfangende Server an, nicht authentifizierte Mails
**abzulehnen**. Ohne SPF und ohne DKIM betrifft das jede Mail der Domain.

Die DMARC-Regel stammt aus Stratos Standardeinstellung; die SPF-Regel stand
dort auf „Keine".

## Entscheidung

Im Strato-Kundenbereich unter **DNS → TXT- und CNAME-Records → STRATO
SPF-Regel** die Option **„Standard STRATO Mailserver"** gewählt. Das erzeugt:

```
fehntjer-woelfe.de   TXT   v=spf1 redirect=_spf.strato.com
```

Die Kette löst vollständig auf (geprüft):

```
_spf.strato.com → ip4:81.169.146.128/25 ip4:85.215.255.0/24
                  ip6:2a01:238:20a:202::0/64 ip6:2a01:238:400::0/48
                  ip4:81.169.144.153 ip6:2a01:238:20a:202:50ff::153 -all
```

Seit dem Nameserver-Umzug ([0005](0005-nameserver-bei-vercel.md)) steht
derselbe Wert in der Vercel-Zone.

## Alternativen

- **„FAIL – Mailserver laut MX"** und **„SOFTFAIL – Mailserver laut MX"**:
  verworfen. Der MX (`smtpin.rzone.de`) ist der *Eingangs*server; ausgehende
  Mail läuft über andere Systeme. `v=spf1 mx` hätte genau die falschen Server
  autorisiert.
- **DMARC entschärfen statt SPF setzen:** verworfen. `p=reject` ist die
  bessere Einstellung, sobald SPF stimmt.
- **DKIM ergänzen:** nicht möglich. Das Paket „Mail Starter" bietet keine
  kundeneigene DKIM-Einrichtung.

## Konsequenzen

- Die DMARC-Ausrichtung trägt **allein SPF**. Fällt der Eintrag weg, wird
  sofort jede Mail abgelehnt.
- Wer künftig über einen anderen Dienst versendet – Newsletter-Tool,
  Vereinssoftware, Kontaktformular –, muss dessen Server **vorher** in den
  SPF-Eintrag aufnehmen.
- Es darf nur einen SPF-Eintrag pro Domain geben. Ein zweiter macht beide
  ungültig.
