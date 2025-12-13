import { useState, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Filter, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

export interface FilteringProps {
  // Search props
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Filter props
  children?: ReactNode;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  defaultExpanded?: boolean;
}

export function Filtering({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Cari...',
  showSearch = true,
  children,
  onClearFilters,
  showClearButton = true,
  defaultExpanded = false,
}: FilteringProps) {
  // State to manage filter visibility
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(defaultExpanded);

  // Toggle filter visibility
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Search Bar and/or Filter Toggle */}
          {(showSearch && onSearchChange) || children ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Bar */}
              {showSearch && onSearchChange && (
                <div className="flex-1 max-w-md">
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      name="search-filter"
                    />
                  </InputGroup>
                </div>
              )}

              {/* Filter Toggle Button */}
              {children && (
                <Button
                  variant="outline"
                  onClick={toggleFilterVisibility}
                  size="sm"
                  className="justify-between"
                >
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter</span>
                  </div>
                  {isFilterVisible ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ) : null}

          {/* Filter Section - Collapsible */}
          {children && isFilterVisible && (
            <div className="p-3 md:p-4">
              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-medium text-primary text-sm md:text-base">Opsi Filter</h3>
                </div>
                {showClearButton && onClearFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="w-full sm:w-auto justify-start"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>

              <Alert className="mb-4 border border-border bg-muted/50">
                <div className="flex  gap-2 md:gap-3">
                  <InfoIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <AlertTitle className="font-semibold text-primary text-sm md:text-base">
                      Instruksi Filter
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs md:text-sm">
                      Pilih filter untuk menampilkan data yang sesuai. Kombinasikan
                      beberapa filter untuk hasil yang lebih spesifik.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {children}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Filtering;
