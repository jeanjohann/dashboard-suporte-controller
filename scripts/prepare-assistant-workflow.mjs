import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assistantAgentWorkflow } from './assistant-agent-workflow.mjs';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultExport = join(
  process.env.LOCALAPPDATA || '',
  'Addlog',
  'n8n-lab',
  'assistant-agent-before-mcp-20261025.json',
);
const credentialExport = resolve(process.argv[2] || defaultExport);
const parsed = JSON.parse(await readFile(credentialExport, 'utf8'));
const savedWorkflow = Array.isArray(parsed) ? parsed[0] : parsed;
if (
  !savedWorkflow ||
  savedWorkflow.id !== 'labAssistantAgent01' ||
  !Array.isArray(savedWorkflow.nodes)
)
  throw new Error('O backup selecionado não contém o workflow labAssistantAgent01.');

const gemini = savedWorkflow.nodes.find((node) => node.type.endsWith('.lmChatGoogleGemini'))
  ?.credentials?.googlePalmApi;
const archive = savedWorkflow.nodes.find((node) => node.type === 'n8n-nodes-base.httpRequest')
  ?.credentials?.httpHeaderAuth;
for (const [label, credential] of [
  ['Google Gemini', gemini],
  ['Acervo local', archive],
]) {
  if (typeof credential?.id !== 'string' || typeof credential?.name !== 'string')
    throw new Error(`O backup não contém a referência da credencial ${label}.`);
}

const workflow = assistantAgentWorkflow(gemini, archive);
const output = join(projectRoot, 'import', 'assistant-agent-demo.json');
await writeFile(output, JSON.stringify([workflow], null, 2) + '\n', 'utf8');
process.stdout.write(
  JSON.stringify({
    workflow: workflow.id,
    active: workflow.active,
    nodes: workflow.nodes.map((node) => node.name),
    output: 'import/assistant-agent-demo.json',
  }) + '\n',
);
