import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

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
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    // Handle edge case when totalPages is 0 or 1
    if (totalPages <= 1) {
      if (totalPages === 1) {
        pageNumbers.push(1);
      }
      return pageNumbers;
    }

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }

      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page (if totalPages > 1)
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full pt-8">
      <div className="p-4 border border-secondary rounded-md bg-primary text-secondary">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <span className="text-sm text-secondary">
              Showing {startItem} - {endItem} of {totalItems} entries
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={onItemsPerPageChange}
            >
              <SelectTrigger className="w-20 h-8 border-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[20, 50, 100, 250].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-secondary"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>

            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 p-0 ${currentPage === page
                    ? "bg-primary hover:bg-primary/50 border-secondary text-secondary"
                    : "bg-secondary border-primary hover:bg-secondary/50 text-primary"
                    }`}
                >
                  {page}
                </Button>
              ) : (
                <span
                  key={index}
                  className="mx-1 text-secondary"
                >
                  ...
                </span>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="h-8 w-8 p-0 border-secondary"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;