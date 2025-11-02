import { ICompanyInfo } from '@/types/company.types'
import { 
  addCompany, 
  deleteCompanyById, 
  getCompanies,
  updateCompanyById,
  type CompaniesQuery,
  type CompaniesResponse 
} from '@/services/companies.service'
import { ModalRenderer } from './ModalRenderer'

interface Column {
  key: keyof ICompanyInfo
  label: string
  sortable?: boolean
  render?: (row: ICompanyInfo) => HTMLElement
  format?: (row: ICompanyInfo) => string
}

interface TableConfig {
  container: HTMLElement
  columns: Column[]
  pageSize?: number
}

interface TableState {
  page: number
  pageSize: number
  sortKey: keyof ICompanyInfo | null
  sortDirection: 'asc' | 'desc' | null
  filterValue: string | null
  total: number
  totalPages: number
}

export class TableRenderer {
  private container: HTMLElement
  private data: ICompanyInfo[] = []
  private columns: Column[]
  private state: TableState
  private filterInput: HTMLInputElement | null = null
  private tableContainer: HTMLDivElement | null = null
  private paginationContainer: HTMLDivElement | null = null

  constructor(config: TableConfig) {
    this.container = config.container
    this.columns = config.columns
    this.state = {
      page: 1,
      pageSize: config.pageSize || 10,
      sortKey: null,
      sortDirection: null,
      filterValue: null,
      total: 0,
      totalPages: 1
    }
    this.init()
  }

  private async init(): Promise<void> {
    await this.fetchData()
    this.render()
  }

  private async fetchData(): Promise<void> {
    const query: CompaniesQuery = {
      page: this.state.page,
      pageSize: this.state.pageSize,
      sortKey: this.state.sortKey,
      sortDirection: this.state.sortDirection,
      filterManagerName: this.state.filterValue
    }

    const response = getCompanies(query)
    this.data = response.items
    this.updateStateFromResponse(response)
  }

  private updateStateFromResponse(response: CompaniesResponse): void {
    this.state.total = response.total
    this.state.totalPages = response.totalPages
    this.state.page = response.page
    this.state.pageSize = response.pageSize
  }

  public async setPage(page: number): Promise<void> {
    if (page < 1 || page > this.state.totalPages) return
    this.state.page = page
    await this.fetchData()
    this.updateTableAndPagination()
  }

  public async setSort(key: keyof ICompanyInfo, direction: 'asc' | 'desc' | null): Promise<void> {
    this.state.sortKey = key
    this.state.sortDirection = direction
    this.state.page = 1
    await this.fetchData()
    this.updateTableAndPagination()
  }

  public async setFilter(value: string | null): Promise<void> {
    this.state.filterValue = value
    this.state.page = 1
    await this.fetchData()
    this.updateTableAndPagination()
  }

  public getState(): TableState {
    return { ...this.state }
  }

  private createTable(): HTMLTableElement {
    const table = document.createElement('table')
    table.className = 'table'

    const thead = document.createElement('thead')
    thead.className = 'table__head'
    const headerRow = document.createElement('tr')
    headerRow.className = 'table__row'

    this.columns.forEach(column => {
      const th = document.createElement('th')
      th.className = 'table__cell table__cell--header'

      const headerContent = document.createElement('div')
      headerContent.className = 'table__header-content'

      const labelSpan = document.createElement('span')
      labelSpan.className = 'table__header-label'
      labelSpan.textContent = column.label
      headerContent.appendChild(labelSpan)

      if (column.sortable) {
        th.classList.add('table__cell--sortable')
        const sortIndicator = document.createElement('span')
        sortIndicator.className = 'table__sort-indicator'
        if (this.state.sortKey === column.key) {
          th.classList.add(`table__cell--sort-${this.state.sortDirection}`)
          sortIndicator.textContent = this.state.sortDirection === 'asc' ? '↑' : '↓'
        } else {
          sortIndicator.textContent = '↕'
        }
        headerContent.appendChild(sortIndicator)
        th.addEventListener('click', () => {
          const newDirection = this.state.sortKey === column.key && this.state.sortDirection === 'asc' ? 'desc' : 'asc'
          this.setSort(column.key, newDirection)
        })
      }

      th.appendChild(headerContent)
      headerRow.appendChild(th)
    })

    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    tbody.className = 'table__body'
    
    this.data.forEach((row) => {
      const tr = document.createElement('tr')
      tr.className = 'table__row'
      tr.addEventListener('click', () => this.handleRowClick(row))

      this.columns.forEach((column) => {
        const td = document.createElement('td')
        td.className = 'table__cell'

        if (column.render) {
          const element = column.render(row)
          td.appendChild(element)
        } else if (column.key === 'delete') {
          const button = document.createElement('button')
          button.className = 'table__action-button table__action-button--delete'
          button.textContent = '×'
          button.title = `Удалить компанию ${row.companyName}`
          button.addEventListener('click', async (e) => { 
            e.stopPropagation();
            const res = confirm(`Вы уверены, что хотите удалить организацию "${row.companyName}"?`)
            if (res && row['id']) {
              deleteCompanyById(row['id']);
              await this.fetchData()
              this.updateTableAndPagination()
            }
          })
          td.appendChild(button)
        } else {
          const content = document.createElement('div')
          content.className = 'table__cell-content'
          content.textContent = column.format ? column.format(row) : String(row[column.key])
          td.appendChild(content)
        }


        tr.appendChild(td)
      })

      tbody.appendChild(tr)
    })

    table.appendChild(tbody)
    return table
  }

  private createPagination(): HTMLElement {
    const pagination = document.createElement('div')
    pagination.className = 'table-pagination'

    const prevButton = document.createElement('button')
    prevButton.className = 'table-pagination__button table-pagination__button--prev'
    prevButton.textContent = '←'
    prevButton.disabled = this.state.page === 1
    prevButton.addEventListener('click', () => this.setPage(this.state.page - 1))

    const nextButton = document.createElement('button')
    nextButton.className = 'table-pagination__button table-pagination__button--next'
    nextButton.textContent = '→'
    nextButton.disabled = this.state.page === this.state.totalPages
    nextButton.addEventListener('click', () => this.setPage(this.state.page + 1))

    const pageInfo = document.createElement('span')
    pageInfo.className = 'table-pagination__info'
    pageInfo.textContent = `Page ${this.state.page} of ${this.state.totalPages}`

    pagination.appendChild(prevButton)
    pagination.appendChild(pageInfo)
    pagination.appendChild(nextButton)

    return pagination
  }

  private async handleEdit(company: ICompanyInfo): Promise<void> {
    if (!company.id) return

    const modal = new ModalRenderer({
      title: 'Редактировать организацию',
      initialData: company,
      onClose: () => modal.destroy(),
      onSave: async (data) => {
        try {
          const updated = await updateCompanyById(company.id!, data)
          if (updated) {
            await this.fetchData()
            this.updateTableAndPagination()
            modal.destroy()
          }
        } catch (error) {
          console.error('Произошла ошибка:', error)
        }
      }
    })
    modal.render()
  }


  private handleRowClick(row: ICompanyInfo): void {
    this.handleEdit(row)
  }

  private createFilter(): HTMLElement {
    const filterContainer = document.createElement('div')
    filterContainer.className = 'table-filter'

    const controlsWrapper = document.createElement('div')
    controlsWrapper.className = 'table-filter__controls'

    this.filterInput = document.createElement('input')
    this.filterInput.className = 'table-filter__input'
    this.filterInput.type = 'text'
    this.filterInput.placeholder = 'Поиск по ФИО...'
    this.filterInput.value = this.state.filterValue || ''
    this.filterInput.addEventListener('input', (e) => {
      this.setFilter((e.target as HTMLInputElement).value)
    })

    const addButton = document.createElement('button')
    addButton.className = 'table-filter__add-button'
    addButton.textContent = 'Добавить организацию'
    addButton.addEventListener('click', () => this.handleAdd())

    controlsWrapper.appendChild(this.filterInput)
    controlsWrapper.appendChild(addButton)
    filterContainer.appendChild(controlsWrapper)
    return filterContainer
  }

  private updateTableAndPagination(): void {
    if (this.tableContainer && this.paginationContainer) {
      this.tableContainer.innerHTML = ''
      this.paginationContainer.innerHTML = ''

      this.tableContainer.appendChild(this.createTable())
      this.paginationContainer.appendChild(this.createPagination())
    }
  }

  private async handleAdd(): Promise<void> {
    const modal = new ModalRenderer({
      title: 'Добавить организацию',
      initialData: undefined,
      onClose: () => modal.destroy(),
      onSave: async (data) => {
        try {
          addCompany(data)
          await this.fetchData()
          this.updateTableAndPagination()
          modal.destroy()
        } catch (error) {
          console.error('Ошибка при удалении огранизации:', error)
        }
      }
    })
    modal.render()
  }

  public render(): void {
    this.container.innerHTML = ''

    const filterElement = this.createFilter()
    this.container.appendChild(filterElement)

    this.tableContainer = document.createElement('div')
    this.tableContainer.className = 'table__container'
    this.container.appendChild(this.tableContainer)

    this.paginationContainer = document.createElement('div')
    this.paginationContainer.className = 'table-pagination__container'
    this.container.appendChild(this.paginationContainer)

    this.updateTableAndPagination()
  }
}