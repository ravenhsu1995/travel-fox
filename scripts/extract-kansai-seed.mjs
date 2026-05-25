// Extracts the DAYS array from the original 2026關西行程.html and writes
// it as a 0003_seed_public_sample.sql migration.
//
// Run from the travel-app/ directory:
//   node scripts/extract-kansai-seed.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, "../../2026關西行程.html");
const OUT_PATH = resolve(
  __dirname,
  "../supabase/migrations/0003_seed_public_sample.sql",
);

const html = readFileSync(HTML_PATH, "utf8");

// Find `const DAYS = [` and balance brackets until the matching `]`.
const startMarker = "const DAYS = ";
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) throw new Error("Could not find `const DAYS =`");
const arrStart = html.indexOf("[", startIdx);
if (arrStart === -1) throw new Error("Could not find DAYS opening bracket");

let depth = 0;
let inString = false;
let stringChar = "";
let escape = false;
let i = arrStart;
for (; i < html.length; i++) {
  const c = html[i];
  if (escape) {
    escape = false;
    continue;
  }
  if (c === "\\") {
    escape = true;
    continue;
  }
  if (inString) {
    if (c === stringChar) inString = false;
    continue;
  }
  if (c === '"' || c === "'" || c === "`") {
    inString = true;
    stringChar = c;
    continue;
  }
  if (c === "[") depth++;
  else if (c === "]") {
    depth--;
    if (depth === 0) break;
  }
}
if (depth !== 0) throw new Error("Unbalanced DAYS array brackets");

const arrSrc = html.slice(arrStart, i + 1);
const DAYS = new Function(`return ${arrSrc};`)();

if (!Array.isArray(DAYS) || DAYS.length === 0) {
  throw new Error("DAYS did not parse into a non-empty array");
}

// Compute trip date span
const dates = DAYS.map((d) => d.date).sort();
const startDate = dates[0];
const endDate = dates[dates.length - 1];

// Companions are derived from union of `companions` across all days.
const companionsSet = new Set();
for (const d of DAYS) {
  for (const c of d.companions ?? []) companionsSet.add(c);
}
const companions = [...companionsSet];

const TRIP_ID = "00000000-0000-0000-0000-000000000001";

const sqlEsc = (s) => s.replace(/'/g, "''");
const arrLit = (arr) =>
  `ARRAY[${arr.map((s) => `'${sqlEsc(String(s))}'`).join(",")}]::text[]`;

const lines = [];
lines.push(
  "-- Seed: 2026 關西行 as the single public sample trip.",
  "-- Idempotent: re-running replaces the sample trip and its days.",
  "",
  `delete from days where trip_id = '${TRIP_ID}';`,
  `delete from expenses where trip_id = '${TRIP_ID}';`,
  `delete from trips where id = '${TRIP_ID}';`,
  "",
  "insert into trips (id, owner_id, title, subtitle, start_date, end_date, companions, cover_emoji, is_public_sample) values (",
  `  '${TRIP_ID}',`,
  "  null,",
  "  '2026 關西行',",
  "  '神戶 · 鳥取 · 岡山',",
  `  '${startDate}',`,
  `  '${endDate}',`,
  `  ${arrLit(companions)},`,
  "  '🗾',",
  "  true",
  ");",
  "",
);

DAYS.forEach((d, i) => {
  const dayJson = {
    timeline: d.timeline ?? [],
  };
  // Build timeline minus the keys we promote to columns
  const hotel = d.hotel ?? null;
  const risks = d.risks ?? [];
  lines.push(
    `insert into days (trip_id, date, day_label, theme, hotel, risks, timeline, sort_order) values (`,
    `  '${TRIP_ID}',`,
    `  '${d.date}',`,
    `  '${sqlEsc(d.label ?? "")}',`,
    `  '${sqlEsc(d.theme ?? "")}',`,
    hotel
      ? `  '${sqlEsc(JSON.stringify(hotel))}'::jsonb,`
      : "  null,",
    `  ${arrLit(risks)},`,
    `  '${sqlEsc(JSON.stringify(dayJson.timeline))}'::jsonb,`,
    `  ${i}`,
    ");",
    "",
  );
});

writeFileSync(OUT_PATH, lines.join("\n"));
console.log(
  `Wrote ${OUT_PATH} (${DAYS.length} days, dates ${startDate} → ${endDate}, companions: ${companions.join("/")})`,
);
