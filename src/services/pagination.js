export const TABLE_PAGE_SIZE = 10

export function paginateRows(rows, requestedPage = 1) {
  const total = rows.length
  const last = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE))
  const page = Math.max(1, Math.min(requestedPage, last))
  return { items: rows.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE), page, last, total }
}

// También admite endpoints que devuelven listas completas o fijan su propio tamaño de página.
export async function fetchTablePage(fetchPage, requestedPage = 1) {
  const response = await fetchPage(requestedPage, TABLE_PAGE_SIZE)
  if (!response.meta) return paginateRows(response.data ?? response, requestedPage)
  const total = response.meta.total
  const last = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE))
  const page = Math.max(1, Math.min(requestedPage, last))
  const serverSize = Number(response.meta.per_page) || TABLE_PAGE_SIZE
  const start = (page - 1) * TABLE_PAGE_SIZE
  const first = Math.floor(start / serverSize) + 1
  const end = Math.min(start + TABLE_PAGE_SIZE, total)
  const final = Math.max(first, Math.ceil(end / serverSize))
  const rows = []
  for (let current = first; current <= final; current++) {
    const result = current === Number(response.meta.current_page)
      ? response : await fetchPage(current, TABLE_PAGE_SIZE)
    rows.push(...result.data)
  }
  const offset = start % serverSize
  return { items: rows.slice(offset, offset + TABLE_PAGE_SIZE), page, last, total }
}
