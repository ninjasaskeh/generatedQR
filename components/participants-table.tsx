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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
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

export type ParticipantRow = {
  id: string;
  name: string;
  nik: string;
  hadir: boolean;
  qrToken: string;
};

export function ParticipantsTable({ data }: { data: ParticipantRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spKey = searchParams.toString();
  const initialQuery = searchParams.get("query") ?? "";
  const allowedLimits = [10, 20, 30, 40, 50] as const;
  const initialLimitRaw = Number(searchParams.get("limit") ?? "10");
  const initialLimit = (allowedLimits as readonly number[]).includes(
    initialLimitRaw,
  )
    ? initialLimitRaw
    : 10;
  const initialPageRaw = Number(searchParams.get("page") ?? "1");
  const initialPage =
    Number.isFinite(initialPageRaw) && initialPageRaw > 0
      ? Math.floor(initialPageRaw)
      : 1;

  const [input, setInput] = React.useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] =
    React.useState<string>(initialQuery);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pageSize, setPageSize] = React.useState<number>(initialLimit);
  const [page, setPage] = React.useState<number>(initialPage);
  const [hasMore, setHasMore] = React.useState<boolean>(false);
  const [rows, setRows] = React.useState<ParticipantRow[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(input.trim());
    }, 150);
    return () => clearTimeout(id);
  }, [input]);

  // Reflect input (immediate), pageSize and page to URL
  React.useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (input) nextParams.set("query", input);
    else nextParams.delete("query");
    nextParams.set("limit", String(pageSize));
    nextParams.set("page", String(page));
    const nextStr = nextParams.toString();
    const currStr = spKey;
    if (nextStr !== currStr) {
      router.replace(nextStr ? `${pathname}?${nextStr}` : pathname, {
        scroll: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, pageSize, page]);

  // Reset to first page when query or limit changes (after debounce)
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  // Fetch server data based on debouncedQuery, pageSize, and page
  React.useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    params.set("limit", String(pageSize));
    params.set("page", String(page));
    setLoading(true);
    fetch(`/api/participants?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        const payload = json as {
          data: ParticipantRow[];
          page: number;
          limit: number;
          hasMore: boolean;
        };
        return payload;
      })
      .then((payload) => {
        setRows(payload.data);
        setHasMore(Boolean(payload.hasMore));
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, pageSize, page]);

  // Sync local state when user navigates back/forward changing the URL
  React.useEffect(() => {
    const q = searchParams.get("query") ?? "";
    if (q !== input) setInput(q);
    const lRaw = Number(searchParams.get("limit") ?? "10");
    const l = (allowedLimits as readonly number[]).includes(lRaw) ? lRaw : 10;
    if (l !== pageSize) setPageSize(l);
    const pRaw = Number(searchParams.get("page") ?? "1");
    const p = Number.isFinite(pRaw) && pRaw > 0 ? Math.floor(pRaw) : 1;
    if (p !== page) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey]);

  const displayed = rows ?? data;

  const columns = React.useMemo<ColumnDef<ParticipantRow>[]>(
    () => [
      {
        header: "No",
        cell: ({ row }) => row.index + 1,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => row.original.name,
      },
      {
        accessorKey: "nik",
        header: "NIK",
        cell: ({ row }) => row.original.nik,
      },
      {
        accessorKey: "hadir",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.hadir ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader />
            )}
            {row.original.hadir ? "Hadir" : "Belum"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const p = row.original;
          const composeAndDownload = async (token: string, name?: string) => {
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
              const base = name
                ? `${sanitize(name)} Absensi QR Code`
                : "Absensi QR Code";
              a.download = `${base}.png`;
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
                      href={`/dashboard/participants/template?token=${encodeURIComponent(p.qrToken)}&name=${encodeURIComponent(p.name)}`}
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
                      composeAndDownload(p.qrToken, p.name);
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
    [],
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
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Filter nama atau NIK..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border px-2 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
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
              Array.from({ length: Math.min(4, pageSize) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-28" />
                    </div>
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
      <div className="flex items-center justify-end gap-2">
        <div className="text-sm text-muted-foreground">Halaman {page}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Berikutnya
          </Button>
        </div>
      </div>
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

function sanitize(s: string) {
  return s
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
