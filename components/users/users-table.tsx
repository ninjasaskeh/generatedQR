"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { CreateUserForm } from "@/components/users/create-user-form";
import { EditUserForm } from "@/components/users/edit-user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string | null;
};

export function UsersTable() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(1);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<UserRow | null>(null);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit,
          offset: (page - 1) * limit,
        },
      });
      if (
        error &&
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        const msg = (error as { message?: unknown }).message;
        throw new Error(typeof msg === "string" ? msg : "Failed to list users");
      }
      const users =
        data &&
        typeof data === "object" &&
        "users" in (data as Record<string, unknown>) &&
        Array.isArray((data as { users: unknown }).users)
          ? (data as { users: UserRow[] }).users
          : [];
      const totalVal =
        data &&
        typeof data === "object" &&
        "total" in (data as Record<string, unknown>) &&
        typeof (data as { total: unknown }).total === "number"
          ? (data as { total: number }).total
          : 0;
      setRows(users);
      setPageCount(Math.max(1, Math.ceil((totalVal || 0) / limit)));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat users");
    } finally {
      setLoading(false);
    }
  }, [limit, page]);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const removeRow = async (id: string) => {
    if (currentUserId && id === currentUserId) {
      toast.error("Tidak bisa menghapus akun sendiri");
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const parsed: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg =
          parsed &&
          typeof parsed === "object" &&
          "error" in (parsed as Record<string, unknown>) &&
          typeof (parsed as { error?: unknown }).error === "string"
            ? (parsed as { error: string }).error
            : "Gagal hapus user";
        throw new Error(errMsg);
      }
      toast.success("User dihapus");
      setDeleteOpen(false);
      setSelected(null);
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchRows();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal hapus user");
    }
  };

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User</DialogTitle>
              <DialogDescription>
                Isi detail pengguna untuk menambahkan akun baru.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              onSuccessAction={() => {
                setAddOpen(false);
                setPage(1);
                fetchRows();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border p-2 sm:p-3 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(5, limit) }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  <TableCell className="w-10">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-56" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u, idx) => (
                <TableRow key={u.id}>
                  <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                  <TableCell className="min-w-[180px]">{u.name}</TableCell>
                  <TableCell className="min-w-[240px]">{u.email}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit user"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelected(u);
                          setEditOpen(true);
                        }}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Hapus user"
                        title={
                          currentUserId && u.id === currentUserId
                            ? "Tidak bisa hapus akun sendiri"
                            : "Hapus"
                        }
                        disabled={!!currentUserId && u.id === currentUserId}
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentUserId && u.id === currentUserId) {
                            toast.error("Tidak bisa menghapus akun sendiri");
                            return;
                          }
                          setSelected(u);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog (portaled) */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditOpen(false);
            setSelected(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Perbarui detail pengguna lalu simpan perubahan.
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <EditUserForm
              id={selected.id}
              initial={{
                name: selected.name || "",
                email: selected.email || "",
              }}
              onCancelAction={() => {
                setEditOpen(false);
                setSelected(null);
              }}
              onSuccessAction={() => {
                setEditOpen(false);
                setSelected(null);
                fetchRows();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog (portaled) */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteOpen(false);
            setSelected(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus user secara permanen. Tindakan tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!currentUserId && selected?.id === currentUserId}
              onClick={() => {
                if (selected) {
                  if (currentUserId && selected.id === currentUserId) {
                    toast.error("Tidak bisa menghapus akun sendiri");
                    return;
                  }
                  removeRow(selected.id);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="/ halaman" />
            </SelectTrigger>
            <SelectContent align="start">
              {[10, 20, 30, 40, 50].map((ps) => (
                <SelectItem key={ps} value={String(ps)}>
                  {ps} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {pageNumbers.map((p, i) => (
              <PaginationItem key={`${p}-${i}`}>
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
                className={
                  page >= pageCount ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
