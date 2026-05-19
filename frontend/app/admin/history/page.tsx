"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { historyApi } from "@/lib/api";
import type { HistoryItem } from "@/types";
import { formatCF } from "@/lib/utils";

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  async function load(skip = 0) {
    setLoading(true);
    const res = await historyApi.list(skip, 20);
    setHistory(res.data);
    setLoading(false);
  }

  useEffect(() => { load(page * 20); }, [page]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Diagnosis</h1>
        <p className="text-muted-foreground text-sm mt-1">Log semua sesi diagnosis yang telah dilakukan</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Belum ada riwayat diagnosis</div>
          ) : (
            <div className="divide-y">
              {history.map((item) => (
                <div key={item.id}>
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-4">
                      {expandedId === item.id ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{item.session_id}</div>
                        <div className="text-sm mt-0.5">{formatDate(item.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{item.gejala_dipilih.length} gejala</Badge>
                      <Badge variant="outline">{item.hasil.length} hasil</Badge>
                    </div>
                  </button>
                  {expandedId === item.id && (
                    <div className="px-12 pb-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">HASIL DIAGNOSIS</p>
                        {item.hasil.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Tidak ada kerusakan terdeteksi</p>
                        ) : (
                          <div className="space-y-1">
                            {item.hasil.map((h, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="w-5 text-muted-foreground">{i + 1}.</span>
                                <span className="font-medium">{h.nama}</span>
                                <Badge className="ml-auto">{formatCF(h.cf_total)}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Sebelumnya
        </Button>
        <Button variant="outline" disabled={history.length < 20} onClick={() => setPage((p) => p + 1)}>
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
