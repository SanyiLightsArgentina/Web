/** Category absence means all products; display labels are never sentinels. */
export function catalogHref(categoryName: string | null = null): string {
  return categoryName === null ? '/productos' : `/productos?${new URLSearchParams({ categoria: categoryName })}`
}

export function catalogCriteria(params: URLSearchParams) {
  const page = Number(params.get('pagina'))
  return {
    query: params.get('q') ?? '', categoryName: params.get('categoria') ?? '',
    onlyNew: params.get('nuevos') === '1',
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  }
}
