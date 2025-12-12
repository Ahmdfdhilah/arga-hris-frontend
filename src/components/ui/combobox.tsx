"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export interface ComboboxOption {
    value: string | number | null;
    label: string;
    description?: string;
}

export interface ComboboxProps {
    options: ComboboxOption[];
    value?: string | number | null;
    onChange?: (value: string | number | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    disabled?: boolean;
    // Search
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    // Infinite scroll
    enableInfiniteScroll?: boolean;
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isLoadingMore?: boolean;
    pagination?: { page: number; totalPages: number };
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    className,
    disabled = false,
    searchValue,
    onSearchChange,
    isLoading = false,
    enableInfiniteScroll = false,
    onLoadMore,
    hasNextPage = false,
    isLoadingMore = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [internalSearch, setInternalSearch] = React.useState("")

    const currentSearch = searchValue !== undefined ? searchValue : internalSearch
    const handleSearchChange = onSearchChange || setInternalSearch

    const selectedOption = options.find((option) => option.value === value)

    // Infinite scroll observer
    const observerRef = React.useRef<IntersectionObserver | null>(null)
    const loadMoreRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            if (!enableInfiniteScroll) return
            if (isLoadingMore) return
            if (observerRef.current) observerRef.current.disconnect()

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && onLoadMore) {
                    onLoadMore()
                }
            })

            if (node) observerRef.current.observe(node)
        },
        [enableInfiniteScroll, isLoadingMore, hasNextPage, onLoadMore]
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("w-full justify-between font-normal", className)}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={!onSearchChange}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={currentSearch}
                        onValueChange={handleSearchChange}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={String(option.value)}
                                            value={String(option.value)}
                                            onSelect={() => {
                                                onChange?.(option.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{option.label}</span>
                                                {option.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.description}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {enableInfiniteScroll && hasNextPage && (
                                    <div
                                        ref={loadMoreRef}
                                        className="flex items-center justify-center py-2"
                                    >
                                        {isLoadingMore && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default Combobox
