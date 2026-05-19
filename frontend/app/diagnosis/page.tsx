"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionWizard from "@/components/diagnosis/QuestionWizard";
import DiagnosisResult from "@/components/diagnosis/DiagnosisResult";
import { gejalaApi, diagnosisApi } from "@/lib/api";
import { useDiagnosisStore } from "@/lib/store";
import type { Gejala } from "@/types";

export default function DiagnosisPage() {
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { result, setResult, getAnsweredInputs, reset } = useDiagnosisStore();

  useEffect(() => {
    gejalaApi
      .list()
      .then((res) => setGejalaList(res.data))
      .catch(() => setError("Gagal memuat daftar gejala. Pastikan server backend berjalan."))
      .finally(() => setFetching(false));
  }, []);

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
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
        {fetching ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Memuat pertanyaan...</p>
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
          />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Pilih Gejala yang Dialami</h1>
              <p className="text-muted-foreground mt-1">
                Pilih jawaban yang paling sesuai untuk setiap gejala. Lewati gejala yang tidak
                relevan dengan memilih &ldquo;Tidak Tahu&rdquo;.
              </p>
            </div>
            <QuestionWizard
              gejalaList={gejalaList}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
}
