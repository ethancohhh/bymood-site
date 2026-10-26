import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = 'https://github.com/ethancohhh/bymood-site.git';
const siteUrl = 'https://ethancohhh.github.io/bymood-site/';

function run(command, args, cwd = source, options = {}) {
  const result = spawnSync(command, args, {
    cwd, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')}\n${result.stderr || result.stdout}`);
  return result.stdout;
}

if (run('git', ['status', '--porcelain']).trim()) {
  throw new Error('Enregistrer les modifications dans un commit avant publication.');
}

// Export only committed website files, with no private repository history.
const archive = run('git', ['archive', '--format=tar', 'HEAD'], source, { encoding: 'buffer' });
const staging = await mkdtemp(join(tmpdir(), 'bymood-public-'));
run('tar', ['-xf', '-'], staging, { input: archive });
await writeFile(join(staging, 'README.md'), `# bymood.\n\nMaquette de site Architecture intérieure · Design · Rénovation.\n\nSite : ${siteUrl}\n\nLes photographies avant/après présentent des prestations réalisées. Les inspirations d’aménagement et les études 3D conservent leurs statuts et attributions. Les informations d’entreprise d’exemple restent à adapter. Le formulaire prépare un récapitulatif local sans transmission.\n\n## Développement\n\nNode.js 22 ou supérieur.\n\n\`\`\`sh\nnpm ci\nnpm run dev\nnpm run build\n\`\`\`\n\n## Publication\n\nGitHub Actions construit et publie automatiquement le site sur GitHub Pages à chaque push sur main. L’URL et le sous-dossier sont fournis par GitHub Pages au build.\n`);

run('git', ['init', '--initial-branch=main'], staging);
run('git', ['remote', 'add', 'origin', repository], staging);
for (const key of ['user.name', 'user.email']) {
  run('git', ['config', key, run('git', ['config', key]).trim()], staging);
}
const refs = run('git', ['ls-remote', 'origin', 'refs/heads/main'], staging).trim();
if (refs) {
  run('git', ['fetch', '--no-tags', 'origin', 'main'], staging);
  run('git', ['update-ref', 'refs/heads/main', 'FETCH_HEAD'], staging);
}
run('git', ['add', '--all'], staging);
const tree = run('git', ['write-tree'], staging).trim();
const previousTree = refs ? run('git', ['rev-parse', 'HEAD^{tree}'], staging).trim() : '';
if (tree === previousTree) {
  console.log('Le dépôt public contient déjà cette version.');
} else {
  run('git', ['commit', '-m', 'Update bymood website'], staging);
  run('git', ['push', 'origin', 'main'], staging);
  console.log(`Version publique : ${run('git', ['rev-parse', 'HEAD'], staging).trim()}`);
}
await rm(staging, { recursive: true, force: true });
console.log(`Dépôt : ${repository}\nLe workflow GitHub Actions assure la publication : ${siteUrl}`);
