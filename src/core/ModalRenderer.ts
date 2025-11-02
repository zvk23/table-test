import { ICompanyInfo, ICompanyAddress } from '@/types/company.types'

interface ModalConfig {
  onSave: (data: ICompanyInfo) => void
  onClose: () => void
  title: string
  initialData?: ICompanyInfo
}

export class ModalRenderer {
  private container: HTMLElement
  private formData: Partial<ICompanyInfo>
  private formFields: { [key: string]: HTMLInputElement } = {}
  private saveButton: HTMLButtonElement | null = null

  constructor(private config: ModalConfig) {
    this.container = document.createElement('div')
    this.formData = this.config.initialData ? { ...this.config.initialData } : {
      companyName: '',
      managerName: '',
      phoneNumber: '',
      address: { city: '', street: '', houseNumber: 0 }
    }
  }

  private validateForm(): boolean {
    const { companyName, managerName, phoneNumber, address } = this.formData
    
    if (!companyName?.trim()) return false
    if (!managerName?.trim()) return false
    if (!phoneNumber?.trim()) return false
    if (!address?.city?.trim()) return false
    if (!address?.street?.trim()) return false
    if (!address?.houseNumber || address.houseNumber <= 0) return false
    
    if (phoneNumber && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneNumber)) return false

    return true
  }

  private formatPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    
    if (digits.length <= 1) return '+7 ('
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }

  private updateFormData(field: string, value: string | number) {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      this.formData.address = {
        ...(this.formData.address || {}),
        [addressField]: addressField === 'houseNumber' ? Number(value) : value
      }
    } else {
      this.formData[field as keyof ICompanyInfo] = value as never
    }

    if (this.saveButton) {
      this.saveButton.disabled = !this.validateForm()
    }
  }

  private createFormField(
    label: string,
    field: string,
    type: string = 'text',
    placeholder: string = ''
  ): HTMLElement {
    const container = document.createElement('div')
    container.className = 'modal__form-field'

    const labelElement = document.createElement('label')
    labelElement.className = 'modal__label'
    labelElement.textContent = label

    const input = document.createElement('input')
    input.className = 'modal__input'
    input.type = type
    input.placeholder = placeholder
    input.value = this.getFieldValue(field)

    if (field === 'phoneNumber') {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        const formattedValue = this.formatPhoneNumber(target.value)
        target.value = formattedValue
        this.updateFormData(field, formattedValue)
      })
    } else {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        this.updateFormData(field, type === 'number' ? Number(target.value) : target.value)
      })
    }

    this.formFields[field] = input
    container.appendChild(labelElement)
    container.appendChild(input)

    return container
  }

  private getFieldValue(field: string): string {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      return String(this.formData.address?.[addressField as keyof ICompanyAddress] || '')
    }
    return String(this.formData[field as keyof ICompanyInfo] || '')
  }

  public render(): void {
    this.container.className = 'modal'
    
    const content = document.createElement('div')
    content.className = 'modal__content'
    
    const header = document.createElement('div')
    header.className = 'modal__header'
    
    const title = document.createElement('h2')
    title.className = 'modal__title'
    title.textContent = this.config.title
    
    const closeButton = document.createElement('button')
    closeButton.className = 'modal__close'
    closeButton.innerHTML = '×'
    closeButton.addEventListener('click', this.config.onClose)
    
    header.appendChild(title)
    header.appendChild(closeButton)
    
    const form = document.createElement('form')
    form.className = 'modal__form'
    form.onsubmit = (e) => e.preventDefault()
    
    form.appendChild(this.createFormField('Название компании', 'companyName', 'text', 'ООО "Компания"'))
    form.appendChild(this.createFormField('ФИО директора', 'managerName', 'text', 'Иванов Иван Иванович'))
    form.appendChild(this.createFormField('Телефон', 'phoneNumber', 'text', '+7 (999) 999-99-99'))
    form.appendChild(this.createFormField('Город', 'address.city', 'text', 'Москва'))
    form.appendChild(this.createFormField('Улица', 'address.street', 'text', 'Ленина'))
    form.appendChild(this.createFormField('Номер дома', 'address.houseNumber', 'number', '1'))
    
    const footer = document.createElement('div')
    footer.className = 'modal__footer'
    
    const cancelButton = document.createElement('button')
    cancelButton.className = 'modal__button modal__button--secondary'
    cancelButton.textContent = 'Отмена'
    cancelButton.addEventListener('click', this.config.onClose)
    
    this.saveButton = document.createElement('button')
    this.saveButton.className = 'modal__button modal__button--primary'
    this.saveButton.textContent = 'Сохранить'
    this.saveButton.disabled = !this.validateForm()
    this.saveButton.addEventListener('click', () => {
      if (this.validateForm()) {
        this.config.onSave(this.formData as ICompanyInfo)
      }
    })
    
    footer.appendChild(cancelButton)
    footer.appendChild(this.saveButton)
    
    content.appendChild(header)
    content.appendChild(form)
    content.appendChild(footer)
    
    this.container.appendChild(content)
    document.body.appendChild(this.container)
  }

  public destroy(): void {
    this.container.remove()
  }
}