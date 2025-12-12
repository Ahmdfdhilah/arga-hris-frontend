import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../index';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
}

const ITEMS_TO_DISPLAY = 3;

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ items }) => {
  if (items.length === 0) return null;

  const [open, setOpen] = React.useState(false);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Case 1: Items less than or equal to ITEMS_TO_DISPLAY - show all */}
        {items.length <= ITEMS_TO_DISPLAY ? (
          items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItemUI>
                  {item.href && !isLast ? (
                    <BreadcrumbLink
                      asChild
                      className="max-w-20 truncate md:max-w-none"
                    >
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItemUI>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })
        ) : (
          /* Case 2: Items exceed ITEMS_TO_DISPLAY - show first, ellipsis, last 2 */
          <>
            {/* First item */}
            <BreadcrumbItemUI>
              <BreadcrumbLink asChild>
                <Link to={items[0].href ?? '/'}>{items[0].label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItemUI>
            <BreadcrumbSeparator />

            {/* Ellipsis dropdown for middle items */}
            <BreadcrumbItemUI>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger
                  className="flex items-center gap-1"
                  aria-label="Toggle menu"
                >
                  <BreadcrumbEllipsis className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {items.slice(1, -2).map((item, index) => (
                    <DropdownMenuItem key={index}>
                      <Link to={item.href ?? '#'} className="w-full">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItemUI>
            <BreadcrumbSeparator />

            {/* Last 2 items */}
            {items.slice(-2).map((item, index) => {
              const isLast = index === 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItemUI>
                    {item.href && !isLast ? (
                      <BreadcrumbLink
                        asChild
                        className="max-w-20 truncate md:max-w-none"
                      >
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItemUI>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default PageBreadcrumb;
