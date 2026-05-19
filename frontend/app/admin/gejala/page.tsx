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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { gejalaApi } from "@/lib/api";
import type { Gejala } from "@/types";
import { KATEGORI_LABELS } from "@/types";

const schema = z.object({
  kode: z.string().min(1),
  pertanyaan: z.string().min(5),
  kategori: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function AdminGejalaPage() {
  const [list, setList] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Gejala | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function load() {
    setLoading(true);
    const res = await gejalaApi.list();
    setList(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ kode: "", pertanyaan: "", kategori: "" });
    setDialogOpen(true);
  }

  function openEdit(g: Gejala) {
    setEditing(g);
    reset({ kode: g.kode, pertanyaan: g.pertanyaan, kategori: g.kategori });
    setDialogOpen(true);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (editing) {
        await gejalaApi.update(editing.id, data);
      } else {
        await gejalaApi.create(data);
      }
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus gejala ini? Semua rule terkait juga akan dihapus.")) return;
    await gejalaApi.delete(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Gejala</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} gejala terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Gejala
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
                    <th className="px-4 py-3 text-left font-medium">Pertanyaan</th>
                    <th className="px-4 py-3 text-left font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((g) => (
                    <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{g.kode}</td>
                      <td className="px-4 py-3 max-w-md">{g.pertanyaan}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {KATEGORI_LABELS[g.kategori] || g.kategori}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(g)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(g.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Gejala" : "Tambah Gejala"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode</Label>
                <Input placeholder="G001" {...register("kode")} />
                {errors.kode && <p className="text-xs text-red-500">{errors.kode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input placeholder="power, display, ..." {...register("kategori")} />
                {errors.kategori && <p className="text-xs text-red-500">{errors.kategori.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Textarea
                placeholder="Apakah laptop/PC tidak menyala?"
                rows={3}
                {...register("pertanyaan")}
              />
              {errors.pertanyaan && <p className="text-xs text-red-500">{errors.pertanyaan.message}</p>}
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
