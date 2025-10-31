export interface ICompanyAddress {
  city: string
  street: string
  houseNumber: number
}

export interface ICompanyInfo {
  id?: number
  companyName: string
  managerName: string
  phoneNumber: string
  address: ICompanyAddress
}