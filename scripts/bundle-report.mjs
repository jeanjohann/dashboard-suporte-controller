/** Mede o código de entrada e das OS pelo manifesto, sem contar importações tardias como download inicial. */
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = path.resolve('dist');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));

/** Percorre dependências estáticas e conta compartilhadas uma vez; dynamicImports só entram ao abrir o módulo. */
function measure(roots) {
  const keys = new Set();
  function visit(key) {
    if (keys.has(key)) return;
    keys.add(key);
    for (const dependency of manifest[key].imports || []) visit(dependency);
  }
  for (const key of roots) visit(key);
  const files = new Set(
    [...keys].map((key) => manifest[key].file).filter((file) => file.endsWith('.js')),
  );
  let bytes = 0,
    gzipBytes = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(dist, file));
    bytes += content.length;
    gzipBytes += gzipSync(content).length;
  }
  return `${(bytes / 1000).toFixed(1)} kB JS · ${(gzipBytes / 1000).toFixed(1)} kB gzip · ${files.size} arquivos`;
}

const entries = Object.keys(manifest).filter((key) => manifest[key].isEntry);
const orders = Object.keys(manifest).find(
  (key) => key.endsWith('/OrdersPage.jsx') || manifest[key].name === 'OrdersPage',
);
if (!orders) throw new Error('A entrada de OrdersPage não foi encontrada no manifesto.');
console.log('Entrada e verificação de acesso:', measure(entries));
console.log('Até a primeira tela de OS, sem planilha:', measure([...entries, orders]));
console.log(
  'Valores de gzip são estimativas locais; autenticação, rede, dados e renderização exigem medição no navegador.',
);
