"use client";

import { useState, useMemo } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDiagnosisStore } from "@/lib/store";
import { KATEGORI_LABELS, type Gejala } from "@/types";
import { cn } from "@/lib/utils";

const CF_OPTIONS = [
  { label: "Ya", value: 1.0, color: "bg-green-500 hover:bg-green-600", textColor: "text-white" },
  { label: "Mungkin", value: 0.6, color: "bg-blue-500 hover:bg-blue-600", textColor: "text-white" },
  { label: "Tidak Tahu", value: 0.0, color: "bg-gray-200 hover:bg-gray-300", textColor: "text-gray-700" },
  { label: "Tidak", value: -1.0, color: "bg-red-100 hover:bg-red-200", textColor: "text-red-700" },
] as const;

interface Props {
  gejalaList: Gejala[];
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export default function QuestionWizard({ gejalaList, onSubmit, loading }: Props) {
  const { answers, setAnswer } = useDiagnosisStore();

  const categories = useMemo(() => {
    const cats = new Map<string, Gejala[]>();
    for (const g of gejalaList) {
      if (!cats.has(g.kategori)) cats.set(g.kategori, []);
      cats.get(g.kategori)!.push(g);
    }
    return Array.from(cats.entries());
  }, [gejalaList]);

  const [currentCatIdx, setCurrentCatIdx] = useState(0);

  const totalAnswered = Object.values(answers).filter((v) => v !== 0.0).length;
  const progressPct = Math.round((totalAnswered / gejalaList.length) * 100);

  const [catName, catGejala] = categories[currentCatIdx] ?? ["", []];
  const answeredInCat = catGejala.filter((g) => answers[g.id] !== undefined).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Kategori {currentCatIdx + 1} / {categories.length}
          </span>
          <span>{totalAnswered} gejala dijawab</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([cat], idx) => {
          const catAnswered = categories[idx][1].filter(
            (g) => answers[g.id] !== undefined
          ).length;
          return (
            <button
              key={cat}
              onClick={() => setCurrentCatIdx(idx)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                idx === currentCatIdx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              {KATEGORI_LABELS[cat] || cat}
              {catAnswered > 0 && (
                <span className="ml-1.5 bg-green-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                  {catAnswered}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {KATEGORI_LABELS[catName] || catName}
            </CardTitle>
            <Badge variant="secondary">
              {answeredInCat}/{catGejala.length} dijawab
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {catGejala.map((gejala, idx) => {
            const currentVal = answers[gejala.id];
            return (
              <div
                key={gejala.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  currentVal !== undefined ? "border-primary/30 bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{gejala.pertanyaan}</p>
                  {currentVal !== undefined && (
                    <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 ml-9">
                  {CF_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setAnswer(gejala.id, opt.value)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-xs font-semibold transition-all border-2",
                        currentVal === opt.value
                          ? `${opt.color} ${opt.textColor} border-transparent ring-2 ring-offset-1 ring-primary`
                          : "bg-background border-border hover:border-gray-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentCatIdx((i) => Math.max(0, i - 1))}
          disabled={currentCatIdx === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
        </Button>

        {currentCatIdx < categories.length - 1 ? (
          <Button onClick={() => setCurrentCatIdx((i) => i + 1)}>
            Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={loading || totalAnswered === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisis...
              </>
            ) : (
              "Lihat Hasil Diagnosis"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
