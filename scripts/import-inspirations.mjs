// Importe les univers du catalogue client (../catalogue, généré par son `npm run images`)
// dans la section Inspirations : images 800/1600 px et src/inspirations.json.
// Usage : npm run inspirations
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const catalogue = path.resolve(root, '../catalogue');
const outImages = path.join(root, 'public/images/inspirations');
const WIDTHS = [800, 1600];

const source = fs.readFileSync(path.join(catalogue, 'data.js'), 'utf8');
const universes = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));

const image = item => ({ id: item.id, legende: item.legende, ratio: item.ratio, largeurSource: item.largeurSource });
fs.rmSync(outImages, { recursive: true, force: true });
for (const universe of universes) {
  const dir = path.join(outImages, universe.slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const variant of universe.variantes) {
    for (const width of WIDTHS) fs.copyFileSync(path.join(catalogue, `${variant.src}-${width}.webp`), path.join(dir, `${variant.id}-${width}.webp`));
  }
  if (universe.couverture && !universe.variantes.some(variant => variant.id === universe.couverture.id)) {
    for (const width of WIDTHS) fs.copyFileSync(path.join(catalogue, `${universe.couverture.src}-${width}.webp`), path.join(dir, `${universe.couverture.id}-${width}.webp`));
  }
}

const data = universes.map(universe => ({
  slug: universe.slug, titre: universe.titre, accroche: universe.accroche,
  couverture: universe.couverture ? image(universe.couverture) : null,
  variantes: universe.variantes.map(image),
}));
fs.writeFileSync(path.join(root, 'src/inspirations.json'), JSON.stringify(data, null, 2) + '\n');
console.log(universes.map(universe => `${universe.titre.padEnd(16)} ${universe.variantes.length} variante(s)`).join('\n'));
