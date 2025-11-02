import { tableData } from '@/data/table-data';
import { ICompanyInfo } from '@/types/company.types';

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

const TABLE_DATA = JSON.parse(JSON.stringify(tableData)) as ICompanyInfo[];

function getSortableValue(item: ICompanyInfo, key: keyof ICompanyInfo): string | number {
  if (key === 'address') {
    return item.address?.city ?? '';
  }

  return item[key] as unknown as string | number;
}

export function getCompanies(query: CompaniesQuery = {}): CompaniesResponse {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 10);
  const sortKey = query.sortKey ?? null;
  const sortDirection = query.sortDirection ?? null;
  const filter = query.filterManagerName?.trim() ?? null;

  let items: ICompanyInfo[] = [...TABLE_DATA];

  if (filter) {
    const f = filter.toLowerCase();
    items = items.filter((it) => (it.managerName ?? '').toLowerCase().includes(f));
  }

  if (sortKey && sortDirection) {
    const dir = sortDirection === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const va = getSortableValue(a, sortKey);
      const vb = getSortableValue(b, sortKey);

      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, undefined, { sensitivity: 'base' }) * dir;
      }

      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = Math.min(total, clampedPage * pageSize);

  const pageItems = items.slice(start, end);

  return {
    items: pageItems,
    total,
    page: clampedPage,
    pageSize,
    totalPages,
  };
}

export const updateCompanyById = (id: number, data: ICompanyInfo): ICompanyInfo | null => {
  const index = TABLE_DATA.findIndex((company) => company.id === id);
  if (index === -1) {
    return null;
  }

  TABLE_DATA[index] = { ...TABLE_DATA[index], ...data };
  return TABLE_DATA[index];
};

export const addCompany = (payload: ICompanyInfo) => {
  TABLE_DATA.push({ ...payload, id: TABLE_DATA.length + 1 })
}

export const deleteCompanyById = (id: number): boolean => {
  const index = TABLE_DATA.findIndex((company) => company.id === id);
  if (index === -1) {
    return false;
  }

  TABLE_DATA.splice(index, 1);
  return true;
}

export const getCompanyById = (id: number): ICompanyInfo | null => {
  const company = TABLE_DATA.find((company) => company.id === id);
  return company || null;
};
