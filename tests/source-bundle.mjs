// SPDX-License-Identifier: MIT
// Restore/verify the exact current ZIP before its pinned historical comparator.
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export function ensureSourceArchive(root = new URL('../', import.meta.url)) {
  // Always invoke the supported bootstrap: an existing historical comparator
  // does not imply that the current ZIP has already been restored or verified.
  const directory = path.resolve(root instanceof URL ? fileURLToPath(root) : root);
  const decoder = fileURLToPath(new URL('../source-bundle.py', import.meta.url));
  const code = 'import runpy,sys;from pathlib import Path;runpy.run_path(sys.argv[1])["ensure_source_archive"](Path(sys.argv[2]))';
  const run = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', code, decoder, directory],
    {encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024});
  assert.equal(run.status, 0, run.error?.message || run.stderr || run.stdout || 'Historical source bootstrap failed');
}

export function ensureVasebreakerBaseline() {
  const directory = fileURLToPath(new URL('../', import.meta.url));
  const decoder = fileURLToPath(new URL('../source-bundle.py', import.meta.url));
  const run = spawnSync(process.platform === 'win32' ? 'python' : 'python3',
    [decoder, directory, '--with-vasebreaker-baseline'], {encoding: 'utf8', timeout: 120000});
  assert.equal(run.status, 0, run.error?.message || run.stderr || 'Vasebreaker baseline verification failed');
}
