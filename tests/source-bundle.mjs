// SPDX-License-Identifier: MIT
// Restore only the exact pinned historical ZIP from the offline source transport.
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export function ensureSourceArchive(root = new URL('../', import.meta.url)) {
  const directory = path.resolve(root instanceof URL ? fileURLToPath(root) : root);
  const decoder = fileURLToPath(new URL('../source-bundle.py', import.meta.url));
  const code = 'import runpy,sys;from pathlib import Path;runpy.run_path(sys.argv[1])["ensure_source_archive"](Path(sys.argv[2]))';
  const run = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', code, decoder, directory],
    {encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024});
  assert.equal(run.status, 0, run.error?.message || run.stderr || run.stdout || 'Historical source bootstrap failed');
}
