import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  pageParamName?: string;
  maxPageLinks?: number;
};

function buildHref(basePath: string, pageParamName: string, page: number): string {
  const joiner = basePath.includes("?") ? "&" : "?";
  return `${basePath}${joiner}${pageParamName}=${page}`;
}

function getPageRange(current: number, total: number, max: number) {
  if (total <= max) {
    return { start: 1, end: total, showStartEllipsis: false, showEndEllipsis: false };
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);

  return {
    start,
    end,
    showStartEllipsis: start > 1,
    showEndEllipsis: end < total,
  };
}

export default function AdminPagination({
  basePath,
  page,
  totalPages,
  pageParamName = "page",
  maxPageLinks = 7,
}: Props) {
  if (totalPages <= 1) return null;

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const clampedPage = Math.min(Math.max(safePage, 1), totalPages);

  const { start, end, showStartEllipsis, showEndEllipsis } = getPageRange(
    clampedPage,
    totalPages,
    Math.max(5, maxPageLinks),
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(
              basePath,
              pageParamName,
              clampedPage > 1 ? clampedPage - 1 : 1,
            )}
          />
        </PaginationItem>

        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink
                href={buildHref(basePath, pageParamName, 1)}
                aria-current={clampedPage === 1 ? "page" : undefined}
                className={
                  clampedPage === 1
                    ? "bg-primary text-secondary hover:bg-primary/90"
                    : ""
                }
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {[...Array(end - start + 1)].map((_, idx) => {
          const pageNumber = start + idx;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={buildHref(basePath, pageParamName, pageNumber)}
                aria-current={clampedPage === pageNumber ? "page" : undefined}
                className={
                  clampedPage === pageNumber
                    ? "bg-primary text-secondary hover:bg-primary/90"
                    : ""
                }
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {showEndEllipsis && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href={buildHref(basePath, pageParamName, totalPages)}
                aria-current={clampedPage === totalPages ? "page" : undefined}
                className={
                  clampedPage === totalPages
                    ? "bg-primary text-secondary hover:bg-primary/90"
                    : ""
                }
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href={buildHref(
              basePath,
              pageParamName,
              clampedPage < totalPages ? clampedPage + 1 : totalPages,
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
