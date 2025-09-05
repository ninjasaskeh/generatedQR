"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// removed Input import
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Image as ImageIcon,
  Download as DownloadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export type QRRow = {
  id: string;
  token: string;
  hadir: boolean;
  souvenir: boolean;
};

export function QRCodesTable({ data }: { data: QRRow[] }) {
  // removed input/debouncedQuery state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);
  const [rows, setRows] = React.useState<QRRow[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState<number>(1);
  const abortRef = React.useRef<AbortController | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // reset to first page when pageSize changes
  React.useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Initialize from URL
  React.useEffect(() => {
    const pRaw = Number(searchParams.get("page") || "1");
    const p = Number.isFinite(pRaw) && pRaw > 0 ? Math.floor(pRaw) : 1;
    const lRaw = Number(searchParams.get("limit") || String(pageSize));
    const allowed = [10, 20, 30, 40, 50] as const;
    const l = (allowed as readonly number[]).includes(lRaw) ? lRaw : 10;
    if (p !== page) setPage(p);
    if (l !== pageSize) setPageSize(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect to URL on change
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Fetch server data based on pageSize and page only
  React.useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("page", String(page));
    setLoading(true);
    fetch(`/api/qrcodes?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        const payload = json as {
          data: QRRow[];
          page: number;
          limit: number;
          total: number;
          pageCount: number;
        };
        return payload;
      })
      .then((payload) => {
        setRows(payload.data);
        setPageCount(Math.max(1, payload.pageCount || 1));
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [pageSize, page]);

  // Helper: compute page numbers with ellipses
  const pageNumbers = React.useMemo(() => {
    const maxButtons = 5;
    const pages: (number | "ellipsis")[] = [];
    if (pageCount <= maxButtons) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
      return pages;
    }
    const left = Math.max(1, page - 1);
    const right = Math.min(pageCount, page + 1);
    pages.push(1);
    if (left > 2) pages.push("ellipsis");
    for (let i = left; i <= right; i++)
      if (i !== 1 && i !== pageCount) pages.push(i);
    if (right < pageCount - 1) pages.push("ellipsis");
    if (pageCount > 1) pages.push(pageCount);
    return pages;
  }, [page, pageCount]);

  const displayed = rows ?? data;

  const columns = React.useMemo<ColumnDef<QRRow>[]>(
    () => [
      {
        header: "No",
        cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
        size: 40,
      },
      {
        accessorKey: "token",
        header: "Token",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate" title={row.original.token}>
            {row.original.token}
          </div>
        ),
      },
      {
        accessorKey: "hadir",
        header: "Hadir",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.hadir ? (
              <IconCircleCheckFilled className="mr-1 size-4 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader className="mr-1 size-4" />
            )}
            {row.original.hadir ? "Hadir" : "Belum"}
          </Badge>
        ),
      },
      {
        accessorKey: "souvenir",
        header: "Souvenir",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.souvenir ? (
              <IconCircleCheckFilled className="mr-1 size-4 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader className="mr-1 size-4" />
            )}
            {row.original.souvenir ? "Diambil" : "Belum"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const p = row.original;
          const composeAndDownload = async (token: string) => {
            try {
              const bg = await loadImage("/BRCODE%20DEPAN.jpg");
              const qr = await loadImage(
                `/api/qr?size=500x500&data=${encodeURIComponent(token)}`,
              );
              const canvas = document.createElement("canvas");
              canvas.width = bg.naturalWidth;
              canvas.height = bg.naturalHeight;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Canvas tidak didukung");
              ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(qr, 292, 860, 500, 500);
              const url = canvas.toDataURL("image/png");
              const a = document.createElement("a");
              a.href = url;
              a.download = `QR.png`;
              a.click();
            } catch {
              toast.error("Gagal membuat poster dari template");
            }
          };
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" aria-label="Aksi">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/participants/template?token=${encodeURIComponent(p.token)}`}
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="size-4" />
                        Buka Template
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      composeAndDownload(p.token);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <DownloadIcon className="size-4" />
                      Download dari Template
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [page, pageSize],
  );

  const table = useReactTable({
    data: displayed,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border px-2 text-sm"
            value={pageSize}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPageSize(next);
              setPage(1);
            }}
          >
            {[10, 20, 30, 40, 50].map((ps) => (
              <option key={ps} value={ps}>
                {ps} / halaman
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-md border p-2 sm:p-3 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(5, pageSize) }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  <TableCell className="w-10">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-28 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pageNumbers.map((p, idx) => (
            <PaginationItem key={`${p}-${idx}`}>
              {p === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    if (p !== page) setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < pageCount) setPage(page + 1);
              }}
              aria-disabled={page >= pageCount}
              className={
                page >= pageCount ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
