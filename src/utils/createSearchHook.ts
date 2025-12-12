import { useSearchDropdown } from '@/hooks/useSearchDropdown';

/**
 * Generic utility untuk membuat custom search hook berbasis useSearchDropdown
 * dengan dukungan mapping ke format combobox options.
 */
export function createSearchHook<T>({
  searchFunction,
  formatter,
  getByIdFunction,
  debounceMs = 500,
  enablePagination = true,
  pageSize = 50,
}: {
  searchFunction: (term: string, limit?: number, page?: number) => Promise<any>;
  formatter: (item: T) => { value: string | number; label: string; description?: string };
  getByIdFunction?: (id: number) => Promise<{ data: T }>;
  debounceMs?: number;
  enablePagination?: boolean;
  pageSize?: number;
}) {
  const dropdown = useSearchDropdown<T>({
    searchFunction,
    getByIdFunction,
    debounceMs,
    enablePagination,
    pageSize,
  });

  const options = dropdown.suggestions.map(formatter);

  return {
    ...dropdown,
    options,
  };
}
