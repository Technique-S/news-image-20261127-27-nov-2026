// News-image-20261127 entry: emit the committed image to /output/entry.png.
// Validate the PNG and read it back so the emitted bytes are the reviewed bytes.
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const MAX_BYTES = 1048576;

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'entry.png'));

if (!source.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG');
}
if (source.length > MAX_BYTES) {
  throw new Error(`entry.png is ${source.length} bytes, over the 1 MiB cap`);
}
const width = source.readUInt32BE(16);
const height = source.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');
mkdirSync(outDir, { recursive: true });
writeFileSync(target, source);

const written = readFileSync(target);
if (statSync(target).size !== source.length || !written.equals(source)) {
  throw new Error('read-back of the emitted image does not match the source');
}
process.stdout.write(`wrote and verified ${source.length} bytes (${width}x${height}) to ${target}\n`);
