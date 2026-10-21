/** Empacota somente os documentos do mapa, separados do aplicativo e de suas credenciais. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'docs/mapa-arquitetura'),
  output = path.join(root, '.worker-build/architecture-site');
const allowed = new Set([
  'index.html',
  'GUIA-DE-ESTUDO.md',
  'CATALOGO-DE-ARQUIVOS.md',
  'DIAGRAMAS.md',
  'inventario.json',
]);
fs.mkdirSync(output, { recursive: true });
for (const name of allowed) fs.copyFileSync(path.join(source, name), path.join(output, name));
fs.writeFileSync(
  path.join(output, 'index.html'),
  fs
    .readFileSync(path.join(output, 'index.html'), 'utf8')
    .replace('<html lang="pt-BR">', '<html lang="pt-BR" data-hosted="true">'),
);
fs.mkdirSync(path.join(output, 'diagramas'), { recursive: true });
for (const name of fs.readdirSync(path.join(source, 'diagramas'))) {
  if (!/^[a-z0-9-]+\.(svg|mmd|json)$/.test(name))
    throw Error('Arquivo inesperado na pasta dos diagramas.');
  fs.copyFileSync(path.join(source, 'diagramas', name), path.join(output, 'diagramas', name));
}
fs.writeFileSync(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(
  'Mapa empacotado para publicação independente com senha. Nenhuma fonte ou credencial foi copiada.',
);
