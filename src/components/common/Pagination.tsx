import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MAX_VISIBLE_PAGES, PAGE_SIZE_OPTIONS } from "@/lib/constants";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 1) return totalPages === 1 ? [1] : [];
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) end = Math.min(4, totalPages - 1);
    else if (currentPage >= totalPages - 1) start = Math.max(totalPages - 3, 2);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const renderPageButton = (page: number | string, index: number) => {
    if (typeof page === "string") {
      return (
        <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground text-sm">
          ...
        </span>
      );
    }

    const isActive = currentPage === page;

    return (
      <Button
        key={page}
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onPageChange(page)}
        className={cn(
          "h-8 w-8 p-0 text-sm font-medium",
          isActive && "bg-muted text-foreground"
        )}
      >
        {page}
      </Button>
    );
  };

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Items info & page size selector */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {startItem} - {endItem} of {totalItems}
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={onItemsPerPageChange}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map(renderPageButton)}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;