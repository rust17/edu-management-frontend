interface ExportColumn<T> {
  title: string
  key: keyof T | ((row: T) => string)
}

/**
 * Export data to CSV file using browser
 * @param data Array of data to export
 * @param columns Column configuration
 * @param filename Filename (without extension)
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // Transform data format
  const exportData = data.map(row => {
    const newRow: Record<string, string> = {}
    columns.forEach(col => {
      const value = typeof col.key === 'function'
        ? col.key(row)
        : row[col.key]
      newRow[col.title] = String(value ?? '-')
    })
    return newRow
  })

  // Generate CSV content
  const headers = columns.map(col => col.title)
  const csvContent = [
    headers.join(','),
    ...exportData.map(row =>
      headers.map(header => {
        const cell = row[header]
        // Handle cells containing commas by wrapping in quotes
        return cell.includes(',') ? `"${cell}"` : cell
      }).join(',')
    )
  ].join('\n')

  // Create Blob object
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8'
  })

  // Create download link
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toLocaleDateString()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
