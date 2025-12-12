import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import type { PaginatedApiResponse } from '@/services/base/types';

interface UseSearchDropdownProps<T> {
  searchFunction: (
    term: string,
    limit?: number,
    page?: number,
  ) => Promise<PaginatedApiResponse<T>>;
  getByIdFunction?: (id: number) => Promise<{ data: T }>;
  debounceMs?: number;
  onSelect?: (item: T) => void;
  filterFunction?: (items: T[], accessibleIds?: number[]) => T[];
  getItemId?: (item: T) => number;
  hasAdminRole?: boolean;
  accessibleIds?: number[];
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
}

export function useSearchDropdown<T>({
  searchFunction,
  getByIdFunction,
  debounceMs = 500,
  onSelect,
  filterFunction,
  getItemId,
  hasAdminRole = false,
  accessibleIds = [],
  enablePagination = false,
  pageSize = 10,
}: UseSearchDropdownProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [initialValues, setInitialValues] = useState<T[]>([]); // Track initial loaded values
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [initialTotalItems, setInitialTotalItems] = useState(0); // Track total from initial fetch
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Store stable references to functions and values
  const searchFunctionRef = useRef(searchFunction);
  const getByIdFunctionRef = useRef(getByIdFunction);
  const filterFunctionRef = useRef(filterFunction);
  const getItemIdRef = useRef(getItemId);
  const hasAdminRoleRef = useRef(hasAdminRole);
  const accessibleIdsRef = useRef(accessibleIds);

  // Update refs when values change
  searchFunctionRef.current = searchFunction;
  getByIdFunctionRef.current = getByIdFunction;
  filterFunctionRef.current = filterFunction;
  getItemIdRef.current = getItemId;
  hasAdminRoleRef.current = hasAdminRole;
  accessibleIdsRef.current = accessibleIds;

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Helper function to apply access control filtering
  const applyAccessControl = (items: T[]): T[] => {
    if (
      filterFunctionRef.current &&
      !hasAdminRoleRef.current &&
      accessibleIdsRef.current.length > 0
    ) {
      return filterFunctionRef.current(items, accessibleIdsRef.current);
    } else if (
      getItemIdRef.current &&
      !hasAdminRoleRef.current &&
      accessibleIdsRef.current.length > 0
    ) {
      return items.filter((item) =>
        accessibleIdsRef.current.includes(getItemIdRef.current!(item)),
      );
    }
    return items;
  };

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(0);
    setHasMoreData(false);
    setTotalItems(0);
    // Only clear suggestions if search term is not empty (to avoid clearing initial data)
    if (enablePagination && debouncedSearchTerm.trim()) {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm, enablePagination]);

  // Initial fetch on mount with empty query
  useEffect(() => {
    const performInitialFetch = async () => {
      if (hasInitialFetch) return;

      try {
        setIsSearching(true);
        const response = await searchFunctionRef.current('', pageSize, 1);
        const items = response.data;
        const filteredItems = applyAccessControl(items);

        setInitialValues(filteredItems);
        setSuggestions(filteredItems);
        setHasMoreData(response.meta.has_next_page);
        setTotalItems(response.meta.total_items);
        setInitialTotalItems(response.meta.total_items); // Save initial total
        setHasInitialFetch(true);
      } catch (error) {
        console.error('Initial fetch error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performInitialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Search effect - using refs to avoid dependency issues
  useEffect(() => {
    const performSearch = async (isLoadMore = false) => {
      if (!debouncedSearchTerm.trim()) {
        // When search term is empty, show initial values
        setSuggestions(initialValues);
        setShowSuggestions(false);
        setIsSearching(false);
        setTotalItems(initialTotalItems);
        setHasMoreData(initialValues.length < initialTotalItems);
        setCurrentPage(0);
        return;
      }

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsSearching(true);
        }

        const page = enablePagination ? currentPage + 1 : 1;
        const limit = enablePagination ? pageSize : 50;

        const response = await searchFunctionRef.current(
          debouncedSearchTerm,
          limit,
          page,
        );

        // Response structure dari service: PaginatedApiResponse<T>
        const newItems = response.data; // data is T[]
        const total = response.meta.total_items;
        const hasMore = response.meta.has_next_page;

        // Apply access control filtering
        const filteredItems = applyAccessControl(newItems);

        if (enablePagination && isLoadMore) {
          // Append to existing suggestions for pagination
          setSuggestions((prev) => [...prev, ...filteredItems]);
        } else {
          // Replace suggestions with search results only (don't merge with initialValues)
          setSuggestions(filteredItems);
        }

        setHasMoreData(hasMore);
        setTotalItems(total);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        if (!isLoadMore) {
          setSuggestions(initialValues);
          setShowSuggestions(false);
          setHasMoreData(false);
          setTotalItems(0);
        }
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, currentPage, enablePagination, pageSize, initialValues, initialTotalItems]); // Depend on pagination state too

  // Click outside effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    if (onSelect) {
      onSelect(item);
    }
    setShowSuggestions(false);
  };

  const loadMore = () => {
    if (enablePagination && hasMoreData && !isLoadingMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions(initialValues); // Keep initial values
    setShowSuggestions(false);
    setIsSearching(false);
    setIsLoadingMore(false);
    setCurrentPage(0);
    setHasMoreData(false);
    setTotalItems(0);
  };

  const toggleSearchMode = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setSearchTerm('');
    }
  };

  // Function to load initial value by ID
  const loadInitialValue = async (id: number) => {
    if (!getByIdFunctionRef.current) return;

    try {
      const response = await getByIdFunctionRef.current(id);
      const item = response.data;

      // Add to initial values if not already present
      setInitialValues((prev) => {
        const exists = prev.some((value) => {
          if (getItemIdRef.current) {
            return getItemIdRef.current(value) === id;
          }
          // Fallback: assume item has 'id' property
          return (value as any).id === id;
        });

        return exists ? prev : [item, ...prev];
      });

      // Also add to suggestions immediately
      setSuggestions((prev) => {
        const exists = prev.some((suggestion) => {
          if (getItemIdRef.current) {
            return getItemIdRef.current(suggestion) === id;
          }
          // Fallback: assume item has 'id' property
          return (suggestion as any).id === id;
        });

        return exists ? prev : [item, ...prev];
      });
    } catch (error) {
      console.error('Error loading initial value:', error);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    suggestionsRef,
    handleSelect,
    clearSearch,
    toggleSearchMode,
    loadInitialValue,
    // Pagination-related returns
    isLoadingMore,
    hasMoreData,
    totalItems,
    currentPage,
    loadMore,
    pagination: enablePagination
      ? {
          currentPage: currentPage + 1, // Convert to 1-based
          totalPages: Math.ceil(totalItems / pageSize),
          totalItems,
          hasNextPage: hasMoreData,
        }
      : undefined,
  };
}
