/** A página experimental não é uma permissão distribuível no cadastro de usuários. */
export const assistantPreviewHash = '#assistente-laboratorio';
export function canOpenAssistantPreview(user) {
  return Boolean(user?.active && user.role === 'admin');
}
export function requestsAssistantPreview(user, hash) {
  return canOpenAssistantPreview(user) && hash === assistantPreviewHash;
}
