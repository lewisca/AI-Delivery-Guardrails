import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// An interpreted Node app has no compile step, so "build" here is a smoke check:
// it runs `node --check` over every source file to catch syntax errors before
// tests run. Swap this for your real build command on a compiled stack.

function collect(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(p));
    else if (entry.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = [...collect('src'), ...collect('scripts')];
let failed = false;

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed = true;
    console.error(`syntax error in ${file}`);
    console.error(err.stderr?.toString() ?? err.message);
  }
}

if (failed) process.exit(1);
console.log(`build check passed (${files.length} files)`);
