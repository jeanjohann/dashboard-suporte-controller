/** Catálogo nativo: zero só pode ser exibido depois de confirmar categorias e população. */
export async function readZohoCategoryCatalog(get) {
  const result = await get('/organizationFields?module=tickets&apiNames=category');
  if (!Array.isArray(result?.data)) throw Error('Catálogo de categorias incompatível.');
  const categories = result.data.filter((field) => field.apiName === 'category');
  if (!categories.length || categories.some((field) => !Array.isArray(field.allowedValues)))
    throw Error('Catálogo de categorias não disponível.');
  const labels = categories.flatMap((field) =>
    field.allowedValues.map((item) => {
      const value = typeof item === 'string' ? item : item?.value;
      if (typeof value !== 'string' || !value.trim() || value.length > 160)
        throw Error('Categoria inválida no catálogo.');
      return value.trim();
    }),
  );
  return {
    version: 1,
    categories: [...new Set(labels)].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  };
}
