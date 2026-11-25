// One Line, One Laugh — entry runner.
//
// Reads the single joke line stored in entry.txt next to this file,
// checks it against the bounty gate (UTF-8 text, 1..200 characters,
// not only whitespace), then copies its exact bytes to the grader's
// output directory. Nothing is reformatted, trimmed or re-encoded:
// the file that leaves here is byte-identical to the file that came in.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;
const MIN_CHARS = 1;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const entryPath = join(scriptDir, "entry.txt");

const rawBytes = readFileSync(entryPath);
const text = rawBytes.toString("utf8");

// Count characters the way a reader counts them: one code point each,
// so an emoji or an accented letter is one character, not two bytes.
const charCount = [...text].length;

if (charCount < MIN_CHARS || charCount > MAX_CHARS) {
  console.error(
    `entry.txt must hold ${MIN_CHARS}..${MAX_CHARS} characters, got ${charCount}.`,
  );
  process.exit(1);
}

if (text.trim().length === 0) {
  console.error("entry.txt must not be only whitespace.");
  process.exit(1);
}

// The grader sets MAKEFUN_OUTPUT_DIR; a local run falls back to ./out
// inside this repository so the same command works in both places.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || join(scriptDir, "out");
mkdirSync(outputDir, { recursive: true });

const outPath = join(outputDir, "entry.txt");
writeFileSync(outPath, rawBytes);

// Read the copy back and compare bytes: if anything downstream ever
// re-encoded the text, this catches it here instead of at grading time.
const writtenBack = readFileSync(outPath);
if (!writtenBack.equals(rawBytes)) {
  console.error("output bytes differ from entry.txt; refusing to pass.");
  process.exit(1);
}

console.log(
  `wrote ${charCount} characters (${rawBytes.length} bytes) to ${outPath}`,
);
