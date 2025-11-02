export interface ICompanyInfo {
  id: number
  name: string
  address: string
  employees: number
  revenue: number
}

export interface ITableState {
  page: number
  pageSize: number
  sortKey: keyof ICompanyInfo | null
  sortDirection: 'asc' | 'desc' | null
  filterValue: string | null
  total: number
  totalPages: number
}

export interface ITableColumn {
  key: keyof ICompanyInfo
  title: string
  sortable?: boolean
  filterable?: boolean
}

export interface ITableConfig {
  container: HTMLElement
  columns: ITableColumn[]
  pageSize?: number
}