import '@/styles/main.scss'
import { TableRenderer } from './core/TableRenderer'
import { columns, tableData } from './data/table-data'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('table-container')
  if (!container) return

  const table = new TableRenderer({
    container,
    data: tableData,
    columns
  })

  table.render()
})