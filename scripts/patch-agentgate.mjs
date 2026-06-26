import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Fix missing .js extensions in @tempo-agentgate ESM builds (Node production). */
function patchDir(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".js") || name.endsWith(".js.map")) continue;
    const file = join(dir, name);
    let src = readFileSync(file, "utf8");
    const next = src.replace(/from '\.\/([^']+)'/g, (match, spec) => {
      if (spec.endsWith(".js")) return match;
      return `from './${spec}.js'`;
    });
    if (next !== src) writeFileSync(file, next);
  }
}

for (const pkg of ["@tempo-agentgate/core/dist", "@tempo-agentgate/middleware/dist"]) {
  patchDir(join("node_modules", pkg));
}

console.log("[avala] Patched @tempo-agentgate ESM imports");
