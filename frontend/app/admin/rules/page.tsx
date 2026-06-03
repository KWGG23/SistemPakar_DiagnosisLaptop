"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rulesApi, gejalaApi, kerusakanApi } from "@/lib/api";
import type { Gejala, Kerusakan, Rule } from "@/types";

const createSchema = z.object({
  gejala_id: z.string().min(1, "Pilih gejala"),
  kerusakan_id: z.string().min(1, "Pilih kerusakan"),
  cf_pakar: z.coerce.number().min(0).max(1),
});
const editSchema = z.object({
  cf_pakar: z.coerce.number().min(0).max(1),
});

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [kerusakanList, setKerusakanList] = useState<Kerusakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedGejala, setSelectedGejala] = useState("");
  const [selectedKerusakan, setSelectedKerusakan] = useState("");

  const createForm = useForm<z.infer<typeof createSchema>>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<z.infer<typeof editSchema>>({ resolver: zodResolver(editSchema) });

  async function load() {
    setLoading(true);
    const [r, g, k] = await Promise.all([
      rulesApi.list(),
      gejalaApi.list(),
      kerusakanApi.list(),
    ]);
    setRules(r.data);
    setGejalaList(g.data);
    setKerusakanList(k.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onCreateSubmit(data: z.infer<typeof createSchema>) {
    setSaving(true);
    try {
      await rulesApi.create({ gejala_id: data.gejala_id, kerusakan_id: data.kerusakan_id, cf_pakar: data.cf_pakar });
      setDialogMode(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onEditSubmit(data: z.infer<typeof editSchema>) {
    if (!editingRule) return;
    setSaving(true);
    try {
      await rulesApi.update(editingRule.id, data.cf_pakar);
      setDialogMode(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus rule ini?")) return;
    await rulesApi.delete(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Rules / CF</h1>
          <p className="text-muted-foreground text-sm mt-1">{rules.length} rule terdaftar</p>
        </div>
        <Button onClick={() => { createForm.reset(); setSelectedGejala(""); setSelectedKerusakan(""); setDialogMode("create"); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Rule
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
                    <th className="px-4 py-3 text-left font-medium">Gejala</th>
                    <th className="px-4 py-3 text-left font-medium">Kerusakan</th>
                    <th className="px-4 py-3 text-center font-medium">CF Pakar</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted-foreground">{rule.gejala_kode}</div>
                        <div className="text-xs line-clamp-1">{rule.gejala_pertanyaan}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted-foreground">{rule.kerusakan_kode}</div>
                        <div className="text-xs">{rule.kerusakan_nama}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-primary">{rule.cf_pakar.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRule(rule);
                              editForm.reset({ cf_pakar: rule.cf_pakar });
                              setDialogMode("edit");
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(rule.id)}
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

      {/* Create Dialog */}
      <Dialog open={dialogMode === "create"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Rule Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Gejala</Label>
              <Select
                value={selectedGejala}
                onValueChange={(v) => { setSelectedGejala(v); createForm.setValue("gejala_id", v); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gejala..." />
                </SelectTrigger>
                <SelectContent>
                  {gejalaList.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.kode} — {g.pertanyaan.slice(0, 60)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kerusakan</Label>
              <Select
                value={selectedKerusakan}
                onValueChange={(v) => { setSelectedKerusakan(v); createForm.setValue("kerusakan_id", v); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kerusakan..." />
                </SelectTrigger>
                <SelectContent>
                  {kerusakanList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.kode} — {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CF Pakar (0.0 – 1.0)</Label>
              <Input type="number" step="0.05" min="0" max="1" placeholder="0.7" {...createForm.register("cf_pakar")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Tambah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogMode === "edit"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CF Pakar</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            {editingRule && (
              <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                <div><span className="text-muted-foreground">Gejala:</span> {editingRule.gejala_kode} — {editingRule.gejala_pertanyaan}</div>
                <div><span className="text-muted-foreground">Kerusakan:</span> {editingRule.kerusakan_kode} — {editingRule.kerusakan_nama}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label>CF Pakar (0.0 – 1.0)</Label>
              <Input type="number" step="0.05" min="0" max="1" {...editForm.register("cf_pakar")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
