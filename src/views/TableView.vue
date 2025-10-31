<template>
  <div class="table">
    <div class="table__header-actions">
      <div class="table__search">
        <input v-model="searchTerm" placeholder="Найти по ФИО..." />
      </div>

      <button class="table__add-company-button" @click="onAddCompany">Добавить организацию</button>
    </div>

    <table class="table__table" v-if="cols">
      <thead class="table__head">
        <tr class="table__row table__row--head">
          <th v-for="col in cols" :key="col.key" class="table__th" @click="onSort(col.key)">
            <span class="table__th-label">{{ col.label }}</span>
            <span class="table__sort-indicator" v-if="sortState.key === col.key">
              {{ sortState.direction === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(row, rowIndex) in tableData"
          :key="rowIndex"
          class="table__row"
          @click="onRowClick(row)"
        >
          <td v-for="col in cols" :key="col.key" class="table__td">
            <template v-if="col.key !== 'address'">
              {{ row[col.key] }}
            </template>

            <template v-else>{{
              `г. ${row[col.key]?.city}, ул. ${row[col.key]?.street}, д. ${row[col.key]?.houseNumber}`
            }}</template>
          </td>

          <td class="table__td table__td--action">
            <button class="table__delete-btn" @click.stop="onRemoveCompany(row)">X</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <div class="pagination__pagesize">
        На странице:
        <select v-model.number="pageSize">
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      <div class="pagination__controls" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="prevPage">‹</button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="['pagination__page', { 'is-active': page === currentPage }]"
          @click="setPage(page)"
        >
          {{ page }}
        </button>

        <button :disabled="currentPage === totalPages" @click="nextPage">›</button>
      </div>
    </div>
  </div>

  <CompanyModal v-model="companyModalOpened" :company-data="companyData" @close="onCloseModal" @save="onSave"/>
</template>

<script setup lang="ts">
import CompanyModal from '@/components/CompanyModal.vue'
import { columns } from '@/data/table-data'
import type { ICompanyInfo } from '@/types/company.type'
import { ref, watch, watchEffect } from 'vue'
import { deleteCompanyById, getCompanies } from '@/services/companies.service'

interface ICol {
  label: string
  key: keyof ICompanyInfo
}

// Чтобы не тащить closeDeep из lodash или vueuse
const cols: ICol[] = JSON.parse(JSON.stringify(columns)) as ICol[]

const tableData = ref<Array<ICompanyInfo>>([])

const companyModalOpened = ref(false)
const companyData = ref<null | ICompanyInfo>(null)

const sortState = ref<{ key: keyof ICompanyInfo | null; direction: 'asc' | 'desc' | null }>({
  key: null,
  direction: null,
})

function onSort(key: keyof ICompanyInfo) {
  if (sortState.value.key === key) {
    sortState.value.direction = sortState.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.value.key = key
    sortState.value.direction = 'asc'
  }
}

const searchTerm = ref<string>('')
const pageSizeOptions = [5, 10, 20, 50]
const pageSize = ref<number>(10)
const currentPage = ref<number>(1)
const totalPages = ref<number>(1)

watch(pageSize, () => {
  currentPage.value = 1
})

watch(searchTerm, () => {
  currentPage.value = 1
})

function setPage(p: number) {
  if (p < 1) p = 1
  if (p > totalPages.value) p = totalPages.value
  currentPage.value = p
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

function onRowClick(row: ICompanyInfo) {
  companyData.value = row
  companyModalOpened.value = true
}

function onCloseModal() {
  companyModalOpened.value = false
  companyData.value = null
}

function onAddCompany() {
  companyData.value = null
  companyModalOpened.value = true
}

function onSave() {
  loadData()
}

function onRemoveCompany(company: ICompanyInfo) {
  if (!company || !company.id) return

  const confirmed = confirm(`Вы уверены, что хотите удалить организацию "${company.companyName}"?`)
  if (!confirmed) return

  const success = deleteCompanyById(company.id)
  if (success) {
    alert('Организация успешно удалена.')
    onSave()
  } else {
    alert('Ошибка при удалении организации.')
  }
}

function loadData() {
  const data = getCompanies({
    page: currentPage.value,
    pageSize: pageSize.value,
    sortKey: sortState.value.key,
    sortDirection: sortState.value.direction,
    filterManagerName: searchTerm.value.trim() || null,
  })
  tableData.value = data.items
  totalPages.value = data.totalPages
}

watchEffect(() => {
  loadData()
})
</script>

<style scoped lang="scss">
$border-color: #000;
$muted-border: #ccc;
$cell-padding: 5px 10px;
$gap: 8px;
$primary: #007bff;

.table {
  $root: &;

  &__table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid $border-color;
  }

  &__th,
  &__td {
    border: 1px solid $border-color;
    padding: $cell-padding;
    text-align: left;
  }

  &__th {
    cursor: pointer;
  }

  &__row {
    border: 1px solid $border-color;

    &--head {
      background: #fafafa;
    }
  }

  &__header-actions {
    display: flex;
    margin-bottom: 8px;
    gap: $gap;

    #{$root}__search {
      margin-bottom: 0;

      input {
        padding: 6px 8px;
        border: 1px solid $muted-border;
        border-radius: 4px;
        width: 260px;
      }
    }
  }

  &__delete-btn {
    padding: 4px 8px;
    border: 1px solid $muted-border;
    background: #fff;
    cursor: pointer;
  }
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;

    &__controls {
      display: flex;
      gap: $gap;
      align-items: center;
    }

    &__page {
      padding: 4px 8px;
      border: 1px solid $muted-border;
      background: #fff;
      cursor: pointer;

      .is-active {
        background: $primary;
        color: white;
        border-color: $primary;
      }
    }


    &__pagesize {
      select {
        margin-left: 6px;
      }
    }
  }
</style>
