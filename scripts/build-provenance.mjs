/**
 * Builds app/data/provenance.json: a content-addressed manifest of the work
 * this site claims, so that a later copy can be distinguished from the original.
 *
 * What this establishes: that this exact content existed by a given date.
 * What it cannot establish: that nobody had the idea earlier in private. No
 * technical scheme can. The value is that anything copied *after* the timestamp
 * is provably later.
 *
 * Two kinds of entry:
 *  - public artifacts, hashed directly (SHA-256 of the file bytes)
 *  - private-repository commits, referenced by commit SHA only. A git commit
 *    SHA is itself a hash over the whole tree and history, so publishing it
 *    commits to that exact content without revealing any of it. Reveal the
 *    repository later and anyone can check the SHA matches.
 *
 * The manifest root is a SHA-256 over the sorted entries. Anchor it with
 * OpenTimestamps (https://opentimestamps.org), which writes the hash into the
 * Bitcoin blockchain and needs no trust in this site, its host, or GitHub:
 *
 *     ots stamp app/data/provenance.json
 *     ots verify app/data/provenance.json.ots
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

const PUBLIC_ARTIFACTS = [
  ['Dense Ordinal Replica Loss — browser implementation', 'app/utils/replica-loss.ts'],
  ['Weng-Lin models — browser implementation', 'app/utils/openskill.ts'],
  ['ARC solver architecture survey', 'app/data/arc-architectures.json'],
  ['Replica loss reference vectors', 'scripts/replica-reference.json'],
  ['OpenSkill reference vectors', 'scripts/openskill-reference.json'],
  ['Replica loss reference generator', 'scripts/gen-replica-reference.py'],
  ['Dense Ordinal Replica Loss — page', 'app/pages/ordinal-replica.vue'],
  ['ARC-AGI — page', 'app/pages/arc.vue']
]

/**
 * Commits in private repositories. The SHA is the commitment; nothing about
 * the contents is disclosed here.
 */
const PRIVATE_COMMITS = [
  { repo: 'Opinion', ref: '3773f4e81ac3054b698982e1e69c408ce83fa834', date: '2025-10-26',
    claim: 'DenseOrdinalReplicaLoss — hybrid ordinal/Hamming distance over replica classes' },
  { repo: 'Opinion', ref: '6b31ec29e072a7ba6f0518593451ce86b12bb8ec', date: '2025-11-14',
    claim: 'CircularReplicaLoss — circular colour topology with inverse-distance spillover' },
  { repo: 'Opinion', ref: '5ece35a70c1a8620ded626e67c5917d2034e1e31', date: '2025-10-06',
    claim: 'Combinator/SKI grammar-constrained solver' },
  { repo: 'Opinion', ref: '70d13987238f4a9720c5a160235f19e38ba5384e', date: '2026-04-24',
    claim: 'Relational architecture with coupled loss and D4 augmentation' },
  { repo: 'Opinion', ref: '555f4fb9575c8253e7f2e0510630d7a85217f75b', date: '2026-03-23',
    claim: 'Variational ARC solver, FiLM-conditioned delta decoder, coupled ELBO' },
  { repo: 'OpinionAI', ref: 'edc373edc8b52687ce1106c510bb125cbc46bc5a', date: '2025-06-06',
    claim: 'SAT/hypergraph constraint formulation' },
  { repo: 'OpinionAI', ref: '919b0b0a7af41b0cf3df0e5c5487fc7cf07359d3', date: '2025-06-10',
    claim: 'Hypergraph GNN with meta-learning outer loop' }
]

const artifacts = PUBLIC_ARTIFACTS.filter(([, p]) => existsSync(p)).map(([label, path]) => {
  const bytes = readFileSync(path)
  let lastCommit = null
  try {
    lastCommit = execSync(`git log -1 --format=%H:%cI -- ${path}`, { encoding: 'utf8' }).trim() || null
  } catch {
    /* not committed yet */
  }
  const [commit, committed] = lastCommit ? lastCommit.split(':') : [null, null]
  return { label, path, sha256: sha256(bytes), bytes: bytes.length, commit, committed }
})

// Root over sorted entries, so the manifest order cannot change the root.
const leaves = [
  ...artifacts.map((a) => `${a.path}:${a.sha256}`),
  ...PRIVATE_COMMITS.map((c) => `${c.repo}@${c.ref}`)
].sort()
const root = sha256(leaves.join('\n'))

const manifest = {
  $schema: 'https://vivekjoshy.com/provenance.schema.json',
  generated: new Date().toISOString().slice(0, 10),
  root,
  algorithm: 'sha256',
  rootPreimage: 'sha256 over newline-joined, lexicographically sorted "path:sha256" and "repo@commit" entries',
  artifacts,
  privateCommits: PRIVATE_COMMITS,
  verify: {
    artifact: 'shasum -a 256 <path>  # compare with the sha256 field',
    root: 'node scripts/build-provenance.mjs  # recomputes; root must match',
    timestamp: 'ots verify app/data/provenance.json.ots  # anchors the root in Bitcoin',
    privateCommit: 'git cat-file -t <ref> inside the repository once it is public'
  }
}

writeFileSync('app/data/provenance.json', JSON.stringify(manifest, null, 2) + '\n')

// The root is stamped, not the manifest. The manifest embeds per-artifact
// commit metadata, so its bytes move on every commit even when no artifact
// changed — a stamp against it would go stale for no substantive reason. The
// root is a pure function of content, so it only moves when the work moves.
writeFileSync('public/provenance-root.txt', root + '\n')
console.log(`✔ provenance: ${artifacts.length} artifacts, ${PRIVATE_COMMITS.length} private commits`)
console.log(`  root ${root}`)
