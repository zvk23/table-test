<template>
  <div class="pagination">
    <div class="pagination__pagesize">
      На странице:
      <select class="pagination__pagesize-select" :value="pageSize" @change="onPageSizeChange">
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <div class="pagination__controls" v-if="totalPages > 1">
      <button :disabled="currentPage <= 1" @click="prevPage">‹</button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="['pagination__page', { 'is-active': page === currentPage } ]"
        @click="setPage(page)"
      >
        {{ page }}
      </button>

      <button :disabled="currentPage >= totalPages" @click="nextPage">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  pageSizeOptions: Array<number>
  pageSize: number
  currentPage: number
  totalPages: number
}

const props = withDefaults(defineProps<IProps>(), {
  pageSizeOptions: () => [],
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
})

const emit = defineEmits<{
  (e: 'update:pageSize', value: number): void
  (e: 'update:currentPage', value: number): void
}>()

function setPage(page: number) {
  if (page < 1) page = 1 as number
  if (page > props.totalPages) page = props.totalPages

  emit('update:currentPage', page)
}

function prevPage() {
  if (Number(props.currentPage) > 1) emit('update:currentPage', (Number(props.currentPage) - 1) as number)
}

function nextPage() {
  if (Number(props.currentPage) < Number(props.totalPages)) emit('update:currentPage', (Number(props.currentPage) + 1) as number)
}

function onPageSizeChange(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value) as number
  emit('update:pageSize', val)
}
</script>

<style scoped lang="scss">
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;

  &__controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__page {
    padding: 4px 8px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;

    &.is-active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  }

  &__pagesize-select {
    margin-left: 6px;
  }
}
</style>
