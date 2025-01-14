interface ExportColumn<T> {
  title: string
  key: keyof T | ((row: T) => string)
}

/**
 * 使用浏览器导出数据为 CSV 文件
 * @param data 要导出的数据数组
 * @param columns 列配置
 * @param filename 文件名（不含扩展名）
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // 转换数据格式
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

  // 生成 CSV 内容
  const headers = columns.map(col => col.title)
  const csvContent = [
    headers.join(','),
    ...exportData.map(row =>
      headers.map(header => {
        const cell = row[header]
        // 处理包含逗号的内容，用引号包裹
        return cell.includes(',') ? `"${cell}"` : cell
      }).join(',')
    )
  ].join('\n')

  // 创建 Blob 对象
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8'
  })

  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toLocaleDateString()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
