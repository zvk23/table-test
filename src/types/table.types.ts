export interface Column {
  key: string
  label: string
  format?: (value: any) => string
  sortable?: boolean
  render?: (row: any) => HTMLElement
}

export interface TableConfig {
  container: HTMLElement
  data: any[]
  columns: Column[]
  pageSize?: number
}

export type SortDirection = 'asc' | 'desc'

export interface TableState {
  page: number
  pageSize: number
  sortKey: string | null
  sortDirection: SortDirection | null
  filterValue: string | null
  total: number
  totalPages: number
}