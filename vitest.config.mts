import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * `.mts`, damit Vite die Datei als ES-Modul lädt – als `.ts` warnt es, weil
 * die nächstgelegene package.json kein `"type": "module"` setzt.
 *
 * Die Pfad-Aliase aus der tsconfig (`@/*`) löst Vite inzwischen selbst auf;
 * das Plugin `vite-tsconfig-paths` ist dafür nicht mehr nötig.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Reine Darstellungs-Routen ohne Verzweigungen; sie werden gebaut und
        // im Build geprüft, brauchen aber keine Coverage-Schwelle.
        "src/app/**/opengraph-image.tsx",
        "src/app/**/icon.tsx",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
