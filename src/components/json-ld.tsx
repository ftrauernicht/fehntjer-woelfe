import { headers } from "next/headers";
import type { JsonLd } from "@/lib/schema";

/**
 * Gibt strukturierte Daten als JSON-LD aus.
 *
 * Der Nonce aus `proxy.ts` wird mitgegeben: Next.js setzt ihn automatisch auf
 * seine eigenen Skripte, aber nicht auf fremde `<script>`-Elemente. Ohne ihn
 * würde dieser Block unter der strikten CSP in manchen Browsern wegfallen.
 *
 * `JSON.stringify` wird zusätzlich entschärft: ein `<` im Inhalt könnte sonst
 * `</script>` erzeugen und aus den Daten ausbrechen.
 */
export async function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
