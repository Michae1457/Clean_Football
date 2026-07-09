import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function isMainModule(importMetaUrl: string) {
  const entrypoint = process.argv[1] ? resolve(process.argv[1]) : "";
  return entrypoint === fileURLToPath(importMetaUrl);
}
