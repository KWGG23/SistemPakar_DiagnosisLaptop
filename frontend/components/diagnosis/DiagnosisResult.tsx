"use client";

import { AlertTriangle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiagnosisItem } from "@/types";
import { formatCF, getCFColor, getCFLabel } from "@/lib/utils";
import { KATEGORI_LABELS } from "@/types";

interface Props {
  hasil: DiagnosisItem[];
  totalGejala: number;
  sessionId: string;
  onReset: () => void;
}

function CFBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${getCFColor(value)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function DiagnosisResult({ hasil, totalGejala, sessionId, onReset }: Props) {
  if (hasil.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tidak Ada Kerusakan Terdeteksi</h2>
        <p className="text-muted-foreground mb-6">
          Berdasarkan {totalGejala} gejala yang dijawab, tidak ditemukan kerusakan dengan tingkat
          kepercayaan yang cukup (≥ 20%).
        </p>
        <Button onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hasil Diagnosis</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Berdasarkan {totalGejala} gejala · Ditemukan {hasil.length} kemungkinan kerusakan
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Diagnosis Ulang
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {hasil.map((item, idx) => (
          <Card
            key={item.kerusakan_id}
            className={idx === 0 ? "border-2 border-red-200 shadow-md" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                      idx === 0 ? "bg-red-500" : idx === 1 ? "bg-orange-500" : "bg-yellow-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <CardTitle className="text-base leading-tight">{item.nama}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.kode}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {KATEGORI_LABELS[item.kategori] || item.kategori}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-primary">{formatCF(item.cf_total)}</div>
                  <div className="text-xs text-muted-foreground">{getCFLabel(item.cf_total)}</div>
                </div>
              </div>
              <div className="mt-3">
                <CFBar value={item.cf_total} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-blue-500" /> Deskripsi
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.deskripsi}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Langkah Solusi
                </h4>
                <div className="space-y-1">
                  {item.solusi.split("\n").map((step, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Hasil diagnosis ini bersifat estimasi berdasarkan gejala yang dilaporkan. Untuk
              diagnosis yang lebih akurat, konsultasikan dengan teknisi profesional.
              <span className="block mt-1 text-xs text-amber-600">Session ID: {sessionId}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
