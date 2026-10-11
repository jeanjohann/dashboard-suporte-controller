/**
 * Confere os caminhos locais após mudanças de estrutura.
 * Não executa o aplicativo nem acessa arquivos das planilhas.
 * O build continua sendo necessário para validar exports, JSX e dependências externas.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
let checked = 0;

function visit(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (/\.(js|jsx|mjs)$/.test(file)) {
      const source = fs.readFileSync(file, 'utf8');
      const imports = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"](\.[^'"]+)['"]/g;
      for (const [, specifier] of source.matchAll(imports)) {
        checked++;
        const target = path.resolve(path.dirname(file), specifier);
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
          failures.push(`${path.relative(root, file)} → ${specifier}`);
        }
      }
    }
  }
}

for (const folder of ['src', 'server', 'scripts']) visit(path.join(root, folder));
if (failures.length) {
  console.error('Caminhos de importação inexistentes:\n' + failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${checked} caminhos locais conferidos; nenhum arquivo ausente.`);
}
