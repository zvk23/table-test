import type { ICompanyInfo } from "../company.type";

export type SortDirection = 'asc' | 'desc';

export interface CompaniesQuery {
  page?: number;
  pageSize?: number;
  sortKey?: keyof ICompanyInfo | null;
  sortDirection?: SortDirection | null;
  filterManagerName?: string | null;
}

export interface CompaniesResponse {
  items: ICompanyInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
