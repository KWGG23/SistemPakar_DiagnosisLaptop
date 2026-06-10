"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, Filter, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuestionWizard from "@/components/diagnosis/QuestionWizard";
import DiagnosisResult from "@/components/diagnosis/DiagnosisResult";
import MultiCategorySelector from "@/components/diagnosis/MultiCategorySelector";
import { gejalaApi, diagnosisApi } from "@/lib/api";
import { useDiagnosisStore } from "@/lib/store";
import { KATEGORI_LABELS, type Gejala } from "@/types";

export default function DiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categoriesParam = searchParams.get("categories");
  
  // Single category atau multi categories
  const selectedCategories = useMemo(() => {
    if (categoriesParam) {
      return categoriesParam.split(",");
    }
    return categoryParam ? [categoryParam] : [];
  }, [categoryParam, categoriesParam]);
  
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(!categoryParam && !categoriesParam);

  const { result, setResult, getAnsweredInputs, reset, answers } = useDiagnosisStore();

  // Load gejala berdasarkan kategori yang dipilih (multiple)
  useEffect(() => {
    if (selectedCategories.length === 0) return;
    
    const loadGejala = async () => {
      setFetching(true);
      try {
        const allGejala: Gejala[] = [];
        
        for (const cat of selectedCategories) {
          const res = await gejalaApi.list(cat);
          allGejala.push(...res.data);
        }
        
        // Remove duplicates (if any)
        const uniqueGejala = Array.from(
          new Map(allGejala.map(g => [g.id, g])).values()
        );
        
        setGejalaList(uniqueGejala);
      } catch {
        setError("Gagal memuat daftar gejala. Pastikan server backend berjalan.");
      } finally {
        setFetching(false);
      }
    };
    
    loadGejala();
  }, [selectedCategories]);

  async function handleSubmit() {
    const inputs = getAnsweredInputs();
    if (inputs.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await diagnosisApi.diagnose(inputs);
      setResult(res.data);
    } catch {
      setError("Gagal menjalankan diagnosis. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    reset();
    setShowSelector(true);
  }

  function handleMultiCategorySelect(categories: string[]) {
    const categoriesParam = categories.join(",");
    router.push(`/diagnosis?categories=${categoriesParam}`);
    setShowSelector(false);
  }

  function clearFilter() {
    router.push("/diagnosis");
    setShowSelector(true);
    reset();
  }

  function removeCategory(categoryToRemove: string) {
    const newCategories = selectedCategories.filter(c => c !== categoryToRemove);
    if (newCategories.length === 0) {
      clearFilter();
    } else {
      router.push(`/diagnosis?categories=${newCategories.join(",")}`);
    }
  }

  const answeredCount = Object.values(answers).filter(v => v !== 0.0).length;
  const totalGejala = gejalaList.length;
  const isMulti = selectedCategories.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {isMulti ? "Diagnosis Multi Masalah" : "Diagnosis Kerusakan"}
              </span>
            </div>
          </div>
          
          {/* Selected Categories Badges */}
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Layers className="w-4 h-4 text-muted-foreground" />
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  <Filter className="w-3 h-3" />
                  {KATEGORI_LABELS[cat] || cat}
                  <button onClick={() => removeCategory(cat)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedCategories.length > 1 && (
                <Button variant="ghost" size="sm" onClick={clearFilter} className="text-xs">
                  Reset Semua
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {showSelector && !result ? (
          <MultiCategorySelector onSelect={handleMultiCategorySelect} />
        ) : fetching ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Memuat pertanyaan dari {selectedCategories.length} kategori...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        ) : result ? (
          <DiagnosisResult
            hasil={result.hasil}
            totalGejala={result.total_gejala}
            sessionId={result.session_id}
            onReset={handleReset}
            currentCategory={isMulti ? undefined : selectedCategories[0]}
            isMultiMode={isMulti}
          />
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {isMulti 
                  ? `Diagnosis ${selectedCategories.length} Kategori Masalah`
                  : `Diagnosis ${KATEGORI_LABELS[selectedCategories[0]] || selectedCategories[0]}`
                }
              </h1>
              <p className="text-muted-foreground mt-1">
                {isMulti
                  ? `Jawab pertanyaan berikut untuk mengidentifikasi masalah pada ${selectedCategories.length} kategori yang dipilih`
                  : "Pilih jawaban yang paling sesuai untuk setiap gejala"
                }
              </p>
              {isMulti && (
                <p className="text-sm text-blue-600 mt-2">
                  Menampilkan {totalGejala} gejala dari kategori: {selectedCategories.map(c => KATEGORI_LABELS[c]).join(", ")}
                  <br />
                  {answeredCount} dari {totalGejala} sudah dijawab
                </p>
              )}
            </div>
            
            <QuestionWizard
              gejalaList={gejalaList}
              onSubmit={handleSubmit}
              loading={loading}
              filterCategory={isMulti ? undefined : selectedCategories[0]}
              isMultiMode={isMulti}
              selectedCategories={selectedCategories}
            />
          </div>
        )}
      </main>
    </div>
  );
}