<template>
  <AppModal v-model="model" @close="onClose" class="company-modal">
    <template #header>{{ title }}</template>

    <form class="company-modal__form" @submit.prevent="onSave" novalidate>
      <div class="company-modal__row">
        <label class="company-modal__label">Название</label>
        <input
          class="company-modal__input"
          v-model="form.companyName"
          type="text"
        />
      </div>

      <div class="company-modal__row">
        <label class="company-modal__label">ФИО директора</label>
        <input
          class="company-modal__input"
          v-model="form.managerName"
          type="text"
        />
      </div>

      <div class="company-modal__row">
        <label class="company-modal__label">Номер телефона</label>
        <input
          class="company-modal__input"
          v-model="form.phoneNumber"
          type="text"
        />
      </div>

      <fieldset class="company-modal__fieldset">
        <legend class="company-modal__legend">Адрес</legend>

        <div class="company-modal__row">
          <label class="company-modal__label">Город</label>
          <input
            class="company-modal__input"
            v-model="form.address.city"
            type="text"
          />
        </div>

        <div class="company-modal__row">
          <label class="company-modal__label">Улица</label>
          <input
            class="company-modal__input"
            v-model="form.address.street"
            type="text"
          />
        </div>

        <div class="company-modal__row">
          <label class="company-modal__label">Номер дома</label>
          <input
            class="company-modal__input"
            v-model.number="form.address.houseNumber"
            type="number"
          />
        </div>
      </fieldset>
    </form>

    <template #footer>
      <div class="company-modal__actions">
        <button class="company-modal__btn" @click="onClose" type="button">Отмена</button>
        <button
          class="company-modal__btn company-modal__btn--primary"
          @click.prevent="onSave"
          type="button"
          :disabled="!isValid"
        >
          Сохранить
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import type { ICompanyInfo } from '@/types/company.type';
import AppModal from './ui/AppModal.vue';
import { computed, reactive, watch } from 'vue';
import { addCompany, updateCompanyById } from '@/services/companies.service';

const props = defineProps<{
  companyData: ICompanyInfo | null;
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
  (e: 'save', payload: ICompanyInfo): void;
}>();

const model = computed<boolean>({
  get: () => !!props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

function onClose() {
  emit('update:modelValue', false);
  emit('close');
}

function emptyCompany(): ICompanyInfo {
  return {
    companyName: '',
    managerName: '',
    phoneNumber: '',
    address: { city: '', street: '', houseNumber: 0 },
  };
}

const form = reactive<ICompanyInfo>(props.companyData ? { ...props.companyData } : emptyCompany());


const isValid = computed(() => {
  if (!form.companyName) return false;
  if (!form.managerName) return false;
  if (!form.phoneNumber) return false;
  if (!form.address.city) return false;
  if (!form.address.street) return false;
  if (!form.address.houseNumber) return false;

  return true;
});

watch(
  () => props.companyData,
  (val) => {
    if (val) {
      Object.assign(form, JSON.parse(JSON.stringify(val)));
    } else {
      Object.assign(form, emptyCompany());
    }
  },
  { immediate: true },
);

const title = computed(() => (props.companyData ? `Редактировать организацию: ${props.companyData.companyName}` : 'Добавить организацию'));

function onSave() {
  const companyData = JSON.parse(JSON.stringify(form)) as ICompanyInfo;
  if (props.companyData && props.companyData.id) {
    updateCompanyById(props.companyData.id, companyData);
  } else {
    addCompany(companyData)
  }
  emit('save', companyData);
  onClose();
}
</script>

<style scoped lang="scss">
$gap: 8px;

.company-modal {
  &__form {
    display: flex;
    flex-direction: column;
    gap: $gap;
  }

  &__row {
    display: flex;
    gap: $gap;
    align-items: center;
  }

  &__label {
    width: 140px;
  }

  &__input {
    flex: 1 1 auto;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  &__fieldset {
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: $gap;
  }

  &__legend {
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__actions {
    display: flex;
    gap: $gap;
    justify-content: flex-end;
  }

  &__btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }

    &--primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  }
}
</style>
