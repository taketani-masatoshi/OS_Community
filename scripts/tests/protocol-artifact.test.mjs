import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { captureProtocol, verifyProtocol, restoreProtocol } from '../protocol-artifact.mjs';

const names = ['community-readiness.json', 'community-sla.json', 'trusted-operators.yaml', 'wire-node-governance.yaml', 'community-wire-node-api.json', 'community-tenant-mail-api.json'];
const sha = 'a'.repeat(40), core = 'b'.repeat(40);
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'protocol-handoff-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'source'), artifact = join(root, 'artifact'), destination = join(root, 'publish');
  mkdirSync(source); mkdirSync(destination);
  for (const name of names) writeFileSync(join(source, name), 'synthetic-export');
  return { root, source, artifact, destination };
}
test('restores the exact E2E exports over a separate publish checkout', t => {
  const f = fixture(t);
  writeFileSync(join(f.destination, names[0]), 'stale');
  writeFileSync(join(f.destination, 'obsolete.json'), 'old');
  captureProtocol(f.source, f.artifact, sha, core);
  restoreProtocol(f.artifact, f.destination, sha);
  assert.deepEqual(verifyProtocol(f.artifact, sha, f.destination).files, verifyProtocol(f.artifact, sha, f.source).files);
  assert.equal(readFileSync(join(f.destination, names[0]), 'utf8'), 'synthetic-export');
});
test('rejects changed contents, mismatched checkout, and post-E2E source changes', t => {
  const f = fixture(t); captureProtocol(f.source, f.artifact, sha, core);
  assert.throws(() => restoreProtocol(f.artifact, f.destination, core), /source mismatch/);
  writeFileSync(join(f.source, names[0]), 'changed');
  assert.throws(() => verifyProtocol(f.artifact, sha, f.source), /changed after capture/);
  writeFileSync(join(f.artifact, 'mirror', names[0]), 'changed');
  assert.throws(() => restoreProtocol(f.artifact, f.destination, sha), /content mismatch/);
});
test('rejects incomplete, empty, and unexpected exports', t => {
  const f = fixture(t); rmSync(join(f.source, names[0]));
  assert.throws(() => captureProtocol(f.source, f.artifact, sha, core), /Missing/);
  writeFileSync(join(f.source, names[0]), '');
  assert.throws(() => captureProtocol(f.source, f.artifact, sha, core), /Empty/);
  writeFileSync(join(f.source, names[0]), 'synthetic'); writeFileSync(join(f.source, 'private.txt'), 'synthetic');
  assert.throws(() => captureProtocol(f.source, f.artifact, sha, core), /Unexpected/);
});
test('rejects symlink exports and unpinned source revisions', t => {
  const f = fixture(t); rmSync(join(f.source, names[0])); symlinkSync(join(f.source, names[1]), join(f.source, names[0]));
  assert.throws(() => captureProtocol(f.source, f.artifact, sha, core), /regular files/);
  assert.throws(() => captureProtocol(f.source, f.artifact, sha, 'main'), /full source commit/);
});
