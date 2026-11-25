// Entry for post-x-promote-make-your-own-bounty-01 (Node 22, standard library only):
// it copies POST.json from the repository root to /output/POST.json, where the gate
// reads it. The entry is the post itself: one post of your own on X that quotes
// make.fun's make-your-own-bounty post (https://x.com/makefunai/status/2124915864336236646),
// a photo of its own attached, make.fun or the @makefunai tag and your play code in its
// text. POST.json names the post; the house reads its replies, reposts and quotes from X.
// Nothing this program writes about the post is scored.
//
// Before copying, it checks POST.json really names an X status URL, so a placeholder
// or a wrong link fails loudly here instead of passing a refused entry to the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_URL_RE = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+$/;

const post = JSON.parse(readFileSync(join(BOT_DIR, 'POST.json'), 'utf8'));
if (typeof post.url !== 'string' || !POST_URL_RE.test(post.url)) {
  console.error('POST.json does not name an X status URL');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate reads exactly what lands in /output, so prove the copy is byte for
// byte the file that was validated above: a silent partial write must fail here.
const written = readFileSync(join(OUTPUT_DIR, 'POST.json'));
const source = readFileSync(join(BOT_DIR, 'POST.json'));
if (!written.equals(source)) {
  console.error('POST.json in /output differs from the validated source');
  process.exit(1);
}
