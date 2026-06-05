export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 1) {
    return [1]
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]

  if (currentPage > 3) {
    items.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (currentPage < totalPages - 2) {
    items.push('ellipsis')
  }

  items.push(totalPages)

  return items
}

export function getPaginationRangeLabel(
  page: number,
  pageSize: number,
  totalCount: number,
) {
  if (totalCount === 0) {
    return 'Showing 0 of 0'
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return `Showing ${start}-${end} of ${totalCount}`
}
