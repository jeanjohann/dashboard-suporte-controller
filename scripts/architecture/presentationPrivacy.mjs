/** Mantém o roteiro do proprietário fora dos documentos compartilháveis e dos downloads. */
export function publicStudyGuide(guide) {
  return guide.replace(
    /^## 12\. Roteiro de apresentação de 10 minutos\r?\n[\s\S]*?(?=^## \d+\. |$(?![\s\S]))/m,
    '',
  );
}
export function privateStudyGuide(guide, section) {
  const clean = publicStudyGuide(guide);
  if (!section) return clean;
  const anchor = /^## 13\. /m;
  if (!anchor.test(clean)) throw Error('Ponto de inserção do roteiro local não encontrado.');
  return clean.replace(anchor, () => section.trimEnd() + '\n\n## 13. ');
}
export function renderArchitectureMap(template, payload) {
  const placeholder = /\/\*ARCHITECTURE_DATA\*\/\s*null/;
  if (!placeholder.test(template)) throw Error('Placeholder do template ausente.');
  const encoded = JSON.stringify(payload).replaceAll('<', '\\u003c');
  return template.replace(placeholder, () => encoded);
}
export function assertPublicArchitectureMap(html) {
  const embedded = /const data\s*=\s*(?:\/\*ARCHITECTURE_DATA\*\/\s*)?(\{[^\r\n]*\});/.exec(html);
  if (!embedded) throw Error('Dados do mapa compartilhável não encontrados.');
  const data = JSON.parse(embedded[1]);
  if (
    typeof data.guide !== 'string' ||
    publicStudyGuide(data.guide) !== data.guide ||
    Object.hasOwn(data, 'presentationNotes') ||
    /const notes\s*=\s*\[/.test(html)
  )
    throw Error('O mapa contém roteiro ou notas locais. Publicação interrompida.');
}
