import { Film } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminReels } from "@/app/lib/admin-data";
import { CreateReelDialog } from "@/components/create-reel-dialog";
import { ReelCard } from "@/components/reel-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const REELS_PER_PAGE = 15;

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

type Props = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function ReelsPage({ searchParams }: Props) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawPage = parseInt(resolvedParams.page || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { reels, totalCount, totalPages, page } = await getAdminReels({
    page: currentPage,
    limit: REELS_PER_PAGE,
  });

  const startItem = totalCount === 0 ? 0 : (page - 1) * REELS_PER_PAGE + 1;
  const endItem = Math.min(page * REELS_PER_PAGE, totalCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-4xl">
              <Film className="size-8 text-primary" />
              Reels
            </CardTitle>
            <CardDescription className="mt-1">
              Browse, play, and manage reels from your production queue.
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-start md:items-center gap-2 w-full md:w-fit">
            <span className="hidden md:flex rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {totalCount === 0
                ? "0 total reels"
                : `Showing ${startItem}–${endItem} of ${totalCount} reels`}
            </span>
            <CreateReelDialog />
          </div>
        </CardHeader>
      </Card>

      {/* Reels Card Gallery */}
      {reels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Film className="size-8" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No reels found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalCount === 0
                  ? "Create your first reel to see it here."
                  : "No reels exist on this page."}
              </p>
            </div>
            {/* <CreateReelDialog /> */}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {reels.map((reel) => (
              <div key={reel.id} className="relative flex flex-col">
                <ReelCard reel={reel} />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-card p-4 sm:flex-row">
              {/* <p className="text-xs text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span> (Showing {startItem}–{endItem} of {totalCount} items)
              </p> */}

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`?page=${Math.max(1, page - 1)}`}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {getPageNumbers(page, totalPages).map((p, idx) => (
                    <PaginationItem key={idx}>
                      {p === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink href={`?page=${p}`} isActive={p === page}>
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={`?page=${Math.min(totalPages, page + 1)}`}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

