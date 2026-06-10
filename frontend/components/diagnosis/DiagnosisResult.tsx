"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  Download, 
  Share2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Printer,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiagnosisItem } from "@/types";
import { formatCF, getCFColor, getCFLabel, cn } from "@/lib/utils";
import { KATEGORI_LABELS, getCategoryColor } from "@/types";

interface Props {
  hasil: DiagnosisItem[];
  totalGejala: number;
  sessionId: string;
  onReset: () => void;
  currentCategory?: string;
  isMultiMode?: boolean;
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

function DiagnosisCard({ item, index, isTop }: { item: DiagnosisItem; index: number; isTop: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  const rankColors: Record<number, string> = {
    0: "bg-red-500",
    1: "bg-orange-500",
    2: "bg-yellow-500",
  };
  const rankColor = rankColors[index] || "bg-blue-500";

  // Parse solusi yang mungkin berupa numbered list atau plain text
  const solutionSteps = item.solusi.split("\n").filter(step => step.trim().length > 0);
  
  // Deteksi apakah solusi sudah dalam format numbered list
  const hasNumberedSteps = solutionSteps.some(step => /^\d+\./.test(step.trim()));

  return (
    <Card className={cn("transition-all", isTop && "border-2 border-red-200 shadow-md")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                rankColor
              )}
            >
              {index + 1}
            </span>
            <div>
              <CardTitle className="text-base leading-tight">{item.nama}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {item.kode}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getCategoryColor(item.kategori))}
                  style={{ 
                    backgroundColor: `${getCategoryColor(item.kategori)}20`, 
                    color: getCategoryColor(item.kategori).replace("bg-", "text-") 
                  }}
                >
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
        {/* Deskripsi */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
            <Info className="w-4 h-4 text-blue-500" /> Deskripsi
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.deskripsi}</p>
        </div>
        
        {/* Solusi - Expandable */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-semibold flex items-center gap-1.5 mb-2 hover:text-primary transition-colors group"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" /> 
            Langkah Solusi
            {expanded ? 
              <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary" /> : 
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            }
          </button>
          {expanded && (
            <div className="space-y-2 mt-2 pl-4 border-l-2 border-green-200">
              {solutionSteps.map((step, i) => {
                // Jika sudah numbered, tampilkan apa adanya
                if (hasNumberedSteps || /^\d+\./.test(step.trim())) {
                  return (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                      {step.trim()}
                    </p>
                  );
                }
                // Jika plain text, tambahkan bullet point
                return (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    • {step.trim()}
                  </p>
                );
              })}
            </div>
          )}
          {/* Preview jika tidak expanded */}
          {!expanded && solutionSteps.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {solutionSteps[0].length > 100 ? solutionSteps[0].substring(0, 100) + "..." : solutionSteps[0]}
            </p>
          )}
        </div>

        {/* Additional info for top result */}
        {isTop && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span className="font-semibold">Prioritas Perbaikan:</span> 
              Kerusakan ini memiliki tingkat kepercayaan tertinggi. Mulai perbaikan dari sini.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DiagnosisResult({ 
  hasil, 
  totalGejala, 
  sessionId, 
  onReset, 
  currentCategory, 
  isMultiMode = false 
}: Props) {
  const router = useRouter();
  const [showAllResults, setShowAllResults] = useState(true);
  
  // Group hasil berdasarkan kategori untuk multi mode
  const groupedByCategory = !isMultiMode ? null : hasil.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {} as Record<string, DiagnosisItem[]>);

  // Get top result confidence
  const topConfidence = hasil.length > 0 ? hasil[0].cf_total : 0;
  const confidenceLevel = 
    topConfidence >= 0.8 ? "Sangat Tinggi" :
    topConfidence >= 0.6 ? "Tinggi" :
    topConfidence >= 0.4 ? "Sedang" : "Rendah";

  // Format untuk export
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      total_gejala: totalGejala,
      hasil: hasil.map(h => ({
        nama: h.nama,
        kode: h.kode,
        kategori: h.kategori,
        cf_total: h.cf_total,
        cf_persen: formatCF(h.cf_total),
        deskripsi: h.deskripsi,
        solusi: h.solusi
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosis_${sessionId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Format untuk print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hasil Diagnosis - ${sessionId.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 25px; }
          .result-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; padding: 15px; }
          .result-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
          .confidence { font-size: 20px; font-weight: bold; color: #2563eb; }
          .category { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Hasil Diagnosis Kerusakan Laptop/PC</h1>
        <p><strong>Session ID:</strong> ${sessionId}</p>
        <p><strong>Tanggal:</strong> ${new Date().toLocaleString('id-ID')}</p>
        <p><strong>Total Gejala:</strong> ${totalGejala}</p>
        <h2>Kemungkinan Kerusakan</h2>
        ${hasil.map((h, i) => `
          <div class="result-card">
            <div class="result-header">
              <div>
                <strong>${i + 1}. ${h.nama}</strong><br/>
                <span class="category">${KATEGORI_LABELS[h.kategori] || h.kategori}</span>
              </div>
              <div class="confidence">${formatCF(h.cf_total)}</div>
            </div>
            <p><strong>Deskripsi:</strong> ${h.deskripsi}</p>
            <p><strong>Solusi:</strong></p>
            <ul>${h.solusi.split('\n').filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join('')}</ul>
          </div>
        `).join('')}
        <div class="footer">
          <p>Hasil diagnosis ini bersifat estimasi berdasarkan gejala yang dilaporkan.</p>
          <p>Untuk diagnosis yang lebih akurat, konsultasikan dengan teknisi profesional.</p>
        </div>
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px;">Print</button>
          <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px;">Close</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  const handleShare = async () => {
    const text = `Hasil Diagnosis Laptop/PC:\n${hasil.slice(0, 3).map((h, i) => 
      `${i + 1}. ${h.nama} (${formatCF(h.cf_total)})`
    ).join("\n")}\n\nDiagnosis via DiagLaptop`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        navigator.clipboard.writeText(text);
        alert("Hasil diagnosis disalin ke clipboard!");
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Hasil diagnosis disalin ke clipboard!");
    }
  };

  if (hasil.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Info className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Tidak Ada Kerusakan Terdeteksi</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Berdasarkan {totalGejala} gejala yang dijawab, tidak ditemukan kerusakan dengan tingkat
          kepercayaan yang cukup (≥ 20%).
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Kemungkinan penyebab:
        </p>
        <ul className="text-sm text-muted-foreground mb-8 text-left max-w-sm mx-auto space-y-1">
          <li>• Gejala yang dialami belum terdaftar dalam basis pengetahuan</li>
          <li>• Masalah bersifat intermittent (timbul tenggelam)</li>
          <li>• Kombinasi gejala tidak cukup kuat untuk mengidentifikasi kerusakan spesifik</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Diagnosis Ulang
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Hasil Diagnosis</h2>
            {isMultiMode && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Multi Kategori
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Berdasarkan {totalGejala} gejala yang dijawab • Ditemukan {hasil.length} kemungkinan kerusakan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Ulang
          </Button>
        </div>
      </div>

      {/* Confidence Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {hasil.length}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kemungkinan Kerusakan</p>
                <p className="font-semibold">Tingkat Kepercayaan: <span className="text-blue-600">{confidenceLevel}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Rekomendasi</p>
              <p className="text-sm font-medium">
                {hasil[0].cf_total >= 0.6 
                  ? "🔧 Segera lakukan perbaikan sesuai solusi teratas"
                  : "💡 Konsultasikan dengan teknisi untuk diagnosis lebih lanjut"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi Mode Info */}
      {isMultiMode && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            📊 Mode Multi Kategori: Hasil diagnosis mencakup semua kemungkinan kerusakan
            dari kategori yang dipilih. {groupedByCategory && Object.keys(groupedByCategory).length} kategori terdeteksi.
          </p>
        </div>
      )}

      {/* Results - Grouped by category for multi mode */}
      {isMultiMode && groupedByCategory ? (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([kategori, items]) => (
            <div key={kategori} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-16 bg-white/90 backdrop-blur-sm py-2 z-10">
                <Badge 
                  className={cn("px-3 py-1.5", getCategoryColor(kategori))}
                  style={{ backgroundColor: getCategoryColor(kategori) }}
                >
                  {KATEGORI_LABELS[kategori] || kategori}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({items.length} kemungkinan)
                </span>
              </div>
              {items.map((item, idx) => (
                <DiagnosisCard 
                  key={item.kerusakan_id} 
                  item={item} 
                  index={idx} 
                  isTop={idx === 0 && kategori === hasil[0].kategori}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Single mode - normal list
        <div className="space-y-4">
          {hasil.map((item, idx) => (
            <DiagnosisCard 
              key={item.kerusakan_id} 
              item={item} 
              index={idx} 
              isTop={idx === 0}
            />
          ))}
        </div>
      )}

      {/* Toggle for showing/hiding lower confidence results */}
      {hasil.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllResults(!showAllResults)}
            className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            {showAllResults ? (
              <>Sembunyikan hasil dengan confidence rendah <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Tampilkan semua {hasil.length} hasil <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                Hasil diagnosis ini bersifat estimasi berdasarkan gejala yang dilaporkan. Untuk
                diagnosis yang lebih akurat, konsultasikan dengan teknisi profesional.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Session ID: {sessionId} • Simpan ID ini untuk referensi jika konsultasi dengan teknisi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Bottom */}
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Diagnosis Baru
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Kembali ke Beranda
        </Button>
        {currentCategory && (
          <Button 
            variant="outline" 
            onClick={() => router.push(`/diagnosis?category=${currentCategory}`)}
          >
            <ArrowRight className="w-4 h-4 mr-2" /> Diagnosis {KATEGORI_LABELS[currentCategory]} Lagi
          </Button>
        )}
      </div>
    </div>
  );
}