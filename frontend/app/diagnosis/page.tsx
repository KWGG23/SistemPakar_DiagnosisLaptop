"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Cpu, Filter, X, Layers, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDiagnosisStore } from "@/lib/store";
import { getGejalaByCategories } from "@/lib/gejalaCache";
import { KATEGORI_LABELS, type Gejala } from "@/types";
import { diagnosisApi } from "@/lib/api";

// Dynamic imports
const MultiCategorySelector = dynamic(
  () => import("@/components/diagnosis/MultiCategorySelector"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const QuestionWizard = dynamic(
  () => import("@/components/diagnosis/QuestionWizard"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const DiagnosisResult = dynamic(
  () => import("@/components/diagnosis/DiagnosisResult"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function DiagnosisPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </main>
    </div>
  );
}

function DiagnosisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categoriesParam = searchParams.get("categories");
  
  const selectedCategories = (() => {
    if (categoriesParam) return categoriesParam.split(",");
    return categoryParam ? [categoryParam] : [];
  })();
  
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showSelector, setShowSelector] = useState(!categoryParam && !categoriesParam);
  
  const { result, setResult, getAnsweredInputs, reset, answers } = useDiagnosisStore();
  const isInitialMount = useRef(true);
  const isDataLoaded = useRef(false);

  // Load gejala data - only once
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setIsReady(true);
      return;
    }
    
    if (isDataLoaded.current) return;
    
    const loadData = async () => {
      try {
        const data = await getGejalaByCategories(selectedCategories);
        setGejalaList(data);
        isDataLoaded.current = true;
      } catch (err) {
        setError("Gagal memuat daftar gejala. Pastikan server backend berjalan.");
      } finally {
        setIsReady(true);
      }
    };
    
    loadData();
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
    setResult(null);
    setShowSelector(true);
    setError(null);
    isDataLoaded.current = false;
    setGejalaList([]);
  }

  function handleMultiCategorySelect(categories: string[]) {
    if (!categories.length) return;
    router.push(`/diagnosis?categories=${categories.join(",")}`);
    setShowSelector(false);
    setResult(null);
    isDataLoaded.current = false;
  }

  function clearFilter() {
    router.push("/diagnosis");
    setShowSelector(true);
    reset();
    setResult(null);
    isDataLoaded.current = false;
    setGejalaList([]);
  }

  function removeCategory(categoryToRemove: string) {
    const newCategories = selectedCategories.filter(c => c !== categoryToRemove);
    if (newCategories.length === 0) {
      clearFilter();
    } else {
      router.push(`/diagnosis?categories=${newCategories.join(",")}`);
      isDataLoaded.current = false;
    }
  }

  const answeredCount = Object.values(answers).filter(v => v !== 0.0 && v !== undefined).length;
  const totalGejala = gejalaList.length;
  const isMulti = selectedCategories.length > 1;
  const hasCategories = selectedCategories.length > 0;

  // Show selector
  if (showSelector && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="font-semibold">Diagnosis Kerusakan</span>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <MultiCategorySelector onSelect={handleMultiCategorySelect} />
        </main>
      </div>
    );
  }

  // Still loading
  if (!isReady) {
    return <DiagnosisPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                {result ? "Hasil Diagnosis" : (isMulti ? "Diagnosis Multi Masalah" : "Diagnosis Kerusakan")}
              </span>
            </div>
          </div>
          
          {hasCategories && !result && (
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
        {error ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        ) : result ? (
          <DiagnosisResult
            hasil={result.hasil || []}
            totalGejala={result.total_gejala || 0}
            sessionId={result.session_id || ""}
            onReset={handleReset}
            currentCategory={isMulti ? undefined : selectedCategories[0]}
            isMultiMode={isMulti}
          />
        ) : totalGejala === 0 && hasCategories ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Tidak ada gejala yang tersedia untuk kategori ini.</p>
            <Button onClick={clearFilter} className="mt-4">
              Kembali ke Pemilihan Kategori
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {isMulti 
                  ? `Diagnosis ${selectedCategories.length} Kategori Masalah`
                  : `Diagnosis ${KATEGORI_LABELS[selectedCategories[0]] || selectedCategories[0]}`
                }
              </h1>
              <p className="text-muted-foreground mt-1">
                {isMulti
                  ? `Jawab pertanyaan berikut untuk mengidentifikasi masalah pada ${selectedCategories.length} kategori`
                  : "Pilih jawaban yang paling sesuai untuk setiap gejala"
                }
              </p>
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

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<DiagnosisPageSkeleton />}>
      <DiagnosisContent />
    </Suspense>
  );
}