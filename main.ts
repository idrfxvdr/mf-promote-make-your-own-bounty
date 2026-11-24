import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR || "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const MAX_BYTES = 16384;
const URL_RE =
  /^https:\/\/(?:(?:www|mobile)\.)?(?:x|twitter)\.com\/(?:[A-Za-z0-9_]+|i\/web)\/status\/\d+\/?(?:[?#].*)?$/;

function fail(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

try {
  const raw = readFileSync(join(botDir, "POST.json"));
  if (raw.length > MAX_BYTES) fail(`POST.json is larger than ${MAX_BYTES} bytes`);
  let data: unknown;
  try {
    data = JSON.parse(raw.toString("utf8"));
  } catch {
    fail("POST.json is not valid JSON");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    fail("POST.json must be a JSON object");
  }
  const url = (data as Record<string, unknown>).url;
  if (typeof url !== "string" || !URL_RE.test(url)) {
    fail("POST.json url must look like https://x.com/<handle>/status/<digits> (or /i/web/status/<digits>)");
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "POST.json"), raw);
  console.log(`copied POST.json to ${outDir}`);
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
