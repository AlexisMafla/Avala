import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Load `.env` into process.env (does not override existing vars). */
export function loadDotEnv(cwd = process.cwd()): void {
  const path = resolve(cwd, ".env");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}
