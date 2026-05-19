"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { kerusakanApi } from "@/lib/api";
import type { Kerusakan } from "@/types";
import { KATEGORI_LABELS } from "@/types";

const schema = z.object({
  kode: z.string().min(1),
  nama: z.string().min(3),
  deskripsi: z.string().min(10),
  solusi: z.string().min(10),
  kategori: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function AdminKerusakanPage() {
  const [list, setList] = useState<Kerusakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Kerusakan | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function load() {
    setLoading(true);
    const res = await kerusakanApi.list();
    setList(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ kode: "", nama: "", deskripsi: "", solusi: "", kategori: "" });
    setDialogOpen(true);
  }

  function openEdit(k: Kerusakan) {
    setEditing(k);
    reset({ kode: k.kode, nama: k.nama, deskripsi: k.deskripsi, solusi: k.solusi, kategori: k.kategori });
    setDialogOpen(true);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (editing) {
        await kerusakanApi.update(editing.id, data);
      } else {
        await kerusakanApi.create(data);
      }
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kerusakan ini? Semua rule terkait juga akan dihapus.")) return;
    await kerusakanApi.delete(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kerusakan</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} kerusakan terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Kerusakan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Kode</th>
                    <th className="px-4 py-3 text-left font-medium">Nama Kerusakan</th>
                    <th className="px-4 py-3 text-left font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((k) => (
                    <tr key={k.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{k.kode}</td>
                      <td className="px-4 py-3 font-medium">{k.nama}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {KATEGORI_LABELS[k.kategori] || k.kategori}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(k)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(k.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kerusakan" : "Tambah Kerusakan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode</Label>
                <Input placeholder="K001" {...register("kode")} />
                {errors.kode && <p className="text-xs text-red-500">{errors.kode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input placeholder="power, display, ..." {...register("kategori")} />
                {errors.kategori && <p className="text-xs text-red-500">{errors.kategori.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Kerusakan</Label>
              <Input placeholder="IC Power / Chip Power Rusak" {...register("nama")} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Penjelasan detail kerusakan..." rows={3} {...register("deskripsi")} />
              {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Solusi</Label>
              <Textarea
                placeholder="Langkah-langkah perbaikan (gunakan nomor untuk setiap langkah)..."
                rows={4}
                {...register("solusi")}
              />
              {errors.solusi && <p className="text-xs text-red-500">{errors.solusi.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editing ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
