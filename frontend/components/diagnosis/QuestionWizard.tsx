"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Brain,
  Layers,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDiagnosisStore } from "@/lib/store";
import { 
  KATEGORI_LABELS, 
  DETAIL_QUESTIONS,
  SPECIFIC_QUESTIONS,
  getDynamicQuestions,
  type Gejala, 
  type GejalaDetail 
} from "@/types";
import { cn } from "@/lib/utils";

const CF_OPTIONS = [
  { 
    label: "Ya", 
    value: 1.0, 
    color: "bg-green-500 hover:bg-green-600", 
    textColor: "text-white", 
    desc: "Saya mengalami gejala ini",
    icon: "✅"
  },
  { 
    label: "Mungkin", 
    value: 0.6, 
    color: "bg-blue-500 hover:bg-blue-600", 
    textColor: "text-white", 
    desc: "Kadang-kadang atau mirip",
    icon: "🤔"
  },
  { 
    label: "Tidak Tahu", 
    value: 0.0, 
    color: "bg-gray-200 hover:bg-gray-300", 
    textColor: "text-gray-700", 
    desc: "Tidak yakin / tidak tahu",
    icon: "❓"
  },
  { 
    label: "Tidak", 
    value: -1.0, 
    color: "bg-red-100 hover:bg-red-200", 
    textColor: "text-red-700", 
    desc: "Saya tidak mengalami ini",
    icon: "❌"
  },
] as const;

interface Props {
  gejalaList: Gejala[];
  onSubmit: () => Promise<void>;
  loading: boolean;
  filterCategory?: string;
  isMultiMode?: boolean;
  selectedCategories?: string[];
}

export default function QuestionWizard({ 
  gejalaList, 
  onSubmit, 
  loading, 
  filterCategory, 
  isMultiMode = false,
  selectedCategories = []
}: Props) {
  const { answers, setAnswer } = useDiagnosisStore();
  
  // State untuk dynamic questions
  const [dynamicQuestions, setDynamicQuestions] = useState<GejalaDetail[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showBranchingTip, setShowBranchingTip] = useState(true);

  // Update dynamic questions berdasarkan jawaban terbaru
  const updateDynamicQuestions = useCallback(() => {
    // Untuk multi mode, kita perlu cek semua kategori
    const categoriesToCheck = isMultiMode ? selectedCategories : (filterCategory ? [filterCategory] : []);
    
    if (categoriesToCheck.length === 0) return;
    
    const allDynamicQuestions: GejalaDetail[] = [];
    
    for (const cat of categoriesToCheck) {
      const newDynamicQuestions = getDynamicQuestions(answers, cat);
      allDynamicQuestions.push(...newDynamicQuestions);
    }
    
    // Filter out questions that are already answered or already shown
    const existingIds = new Set(dynamicQuestions.map(q => q.id));
    const answeredIds = new Set(Object.keys(answers));
    
    const uniqueNew = allDynamicQuestions.filter(q => 
      !existingIds.has(q.id) && !answeredIds.has(q.id)
    );
    
    if (uniqueNew.length > 0) {
      setDynamicQuestions(prev => [...prev, ...uniqueNew]);
      
      // Auto-expand section when new questions appear
      const newCategories = new Set(uniqueNew.map(q => q.kategori));
      setExpandedSections(prev => {
        const next = new Set(prev);
        newCategories.forEach(cat => next.add(cat));
        return next;
      });
    }
  }, [answers, filterCategory, isMultiMode, selectedCategories, dynamicQuestions]);

  // Trigger update when answers change
  useEffect(() => {
    updateDynamicQuestions();
  }, [answers, updateDynamicQuestions]);

  // Gabungkan semua pertanyaan (statis + dinamis)
  const allQuestions = useMemo(() => {
    // Pertanyaan statis dari backend (level 1)
    const staticQuestions = gejalaList.map(g => ({ 
      ...g, 
      level: 1 as const,
      isDynamic: false 
    }));
    
    // Pertanyaan dinamis yang belum dijawab
    const answeredIds = new Set(Object.keys(answers));
    const activeDynamic = dynamicQuestions.filter(q => !answeredIds.has(q.id));
    
    return [...staticQuestions, ...activeDynamic];
  }, [gejalaList, dynamicQuestions, answers]);

  // Kelompokkan berdasarkan kategori
  const categories = useMemo(() => {
    const cats = new Map<string, (Gejala | GejalaDetail)[]>();
    for (const g of allQuestions) {
      const kategori = (g as GejalaDetail).kategori || (g as Gejala).kategori;
      if (!cats.has(kategori)) cats.set(kategori, []);
      cats.get(kategori)!.push(g);
    }
    
    // Urutkan: kategori dengan pertanyaan belum lengkap didahulukan
    return Array.from(cats.entries()).sort((a, b) => {
      const aAnswered = a[1].filter(g => answers[g.id] !== undefined).length;
      const bAnswered = b[1].filter(g => answers[g.id] !== undefined).length;
      const aPercent = aAnswered / a[1].length;
      const bPercent = bAnswered / b[1].length;
      return aPercent - bPercent;
    });
  }, [allQuestions, answers]);

  const [currentCatIdx, setCurrentCatIdx] = useState(0);
  
  // Reset ke kategori pertama saat filter berubah
  useEffect(() => {
    setCurrentCatIdx(0);
    setDynamicQuestions([]);
  }, [filterCategory, isMultiMode, selectedCategories]);

  const totalAnswered = Object.values(answers).filter((v) => v !== 0.0).length;
  const totalQuestions = allQuestions.length;
  const progressPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const [catName, catGejala] = categories[currentCatIdx] ?? ["", []];
  const answeredInCat = catGejala.filter((g) => answers[g.id] !== undefined).length;
  const catProgress = catGejala.length > 0 ? (answeredInCat / catGejala.length) * 100 : 0;

  // Hitung jumlah pertanyaan dinamis per kategori
  const dynamicCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of dynamicQuestions) {
      const cat = q.kategori;
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return counts;
  }, [dynamicQuestions]);

  // Toggle section expansion
  const toggleSection = (category: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Get level badge info
  const getLevelInfo = (level?: number, isDynamic?: boolean) => {
    if (level === 3) {
      return { 
        text: "Spesifik", 
        color: "bg-amber-100 text-amber-700", 
        icon: "🎯",
        description: "Pertanyaan spesifik untuk diagnosis lebih akurat"
      };
    }
    if (level === 2 || isDynamic) {
      return { 
        text: "Detail", 
        color: "bg-purple-100 text-purple-700", 
        icon: "🔍",
        description: "Pertanyaan detail muncul berdasarkan jawaban Anda sebelumnya"
      };
    }
    return { 
      text: "Umum", 
      color: "bg-gray-100 text-gray-600", 
      icon: "📌",
      description: "Pertanyaan dasar tentang gejala yang dialami"
    };
  };

  if (allQuestions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Tidak ada pertanyaan yang tersedia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>
              {isMultiMode 
                ? `Diagnosis ${selectedCategories.length} Kategori`
                : `Diagnosis ${KATEGORI_LABELS[filterCategory || ""] || "Lengkap"}`
              }
            </span>
          </div>
          <span>{totalAnswered} dari {totalQuestions} pertanyaan dijawab</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        {progressPct === 100 && totalQuestions > 0 && (
          <p className="text-xs text-green-600 text-center">
            ✅ Semua pertanyaan telah dijawab! Klik "Lihat Hasil Diagnosis" untuk melanjutkan.
          </p>
        )}
      </div>

      {/* Multi Mode Info */}
      {isMultiMode && selectedCategories.length > 1 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <p className="text-xs text-blue-700">
            📋 Mode Multi Kategori: {selectedCategories.length} kategori dipilih.
            Jawab semua pertanyaan untuk hasil diagnosis yang komprehensif.
          </p>
        </div>
      )}

      {/* Branching Info Tip */}
      {showBranchingTip && dynamicQuestions.length === 0 && !isMultiMode && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-purple-700">
              ✨ Sistem akan menampilkan pertanyaan detail secara otomatis berdasarkan jawaban Anda
            </p>
          </div>
          <button 
            onClick={() => setShowBranchingTip(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Dynamic Questions Alert */}
      {dynamicQuestions.length > 0 && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <p className="text-xs text-purple-700">
            🔍 Terdeteksi {dynamicQuestions.length} pertanyaan detail tambahan yang relevan dengan masalah Anda.
            Menjawab pertanyaan ini akan meningkatkan akurasi diagnosis.
          </p>
        </div>
      )}

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([cat], idx) => {
          const catAnswered = categories[idx][1].filter(
            (g) => answers[g.id] !== undefined
          ).length;
          const catTotal = categories[idx][1].length;
          const isComplete = catAnswered === catTotal;
          const hasDynamic = dynamicCountByCategory.has(cat);
          const isExpanded = expandedSections.has(cat);
          
          return (
            <button
              key={cat}
              onClick={() => setCurrentCatIdx(idx)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                idx === currentCatIdx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50",
                hasDynamic && "ring-2 ring-purple-300 ring-offset-1",
                isComplete && "bg-green-50 border-green-300"
              )}
            >
              {KATEGORI_LABELS[cat] || cat}
              {hasDynamic && <Sparkles className="w-3 h-3" />}
              {catAnswered > 0 && (
                <span className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px]",
                  isComplete ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
                )}>
                  {catAnswered}/{catTotal}
                </span>
              )}
              {isExpanded && idx !== currentCatIdx && (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          );
        })}
      </div>

      {/* Questions Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {KATEGORI_LABELS[catName] || catName}
              </CardTitle>
              {dynamicCountByCategory.has(catName) && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  +{dynamicCountByCategory.get(catName)} detail
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {answeredInCat}/{catGejala.length} dijawab
              </Badge>
              <button
                onClick={() => toggleSection(catName)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {expandedSections.has(catName) ? "Sembunyikan" : "Perluas"}
              </button>
            </div>
          </div>
          {catProgress === 100 && catGejala.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Semua pertanyaan di kategori ini telah dijawab
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {catGejala.map((gejala, idx) => {
            const currentVal = answers[gejala.id];
            const isDynamic = (gejala as GejalaDetail).isDynamic === true;
            const level = (gejala as GejalaDetail).level || 1;
            const levelInfo = getLevelInfo(level, isDynamic);
            const isAnswered = currentVal !== undefined;
            const parentId = (gejala as GejalaDetail).parentId;
            
            return (
              <div
                key={gejala.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  isAnswered ? "border-primary/30 bg-primary/5" : "border-border",
                  isDynamic && "border-purple-200 bg-purple-50/30 animate-in fade-in slide-in-from-top-2 duration-300",
                  level === 3 && "border-amber-200 bg-amber-50/30"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-medium leading-relaxed">{gejala.pertanyaan}</p>
                      <Badge className={cn("text-[10px]", levelInfo.color)} title={levelInfo.description}>
                        {levelInfo.icon} {levelInfo.text}
                      </Badge>
                      {parentId && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          ⤷ Pertanyaan lanjutan
                        </Badge>
                      )}
                    </div>
                    {isDynamic && level === 2 && (
                      <p className="text-[10px] text-purple-600 mt-0.5">
                        💡 Pertanyaan ini muncul karena jawaban Anda sebelumnya mengindikasikan masalah spesifik
                      </p>
                    )}
                    {level === 3 && (
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        🎯 Pertanyaan spesifik untuk memastikan diagnosis yang lebih akurat
                      </p>
                    )}
                  </div>
                  {isAnswered && (
                    <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 ml-9">
                  {CF_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setAnswer(gejala.id, opt.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-semibold transition-all border-2 flex items-center gap-1",
                        currentVal === opt.value
                          ? `${opt.color} ${opt.textColor} border-transparent ring-2 ring-offset-1 ring-primary`
                          : "bg-background border-border hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-sm">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
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

      {/* Progress Tips */}
      {totalAnswered < totalQuestions && currentCatIdx === categories.length - 1 && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ⚡ {totalQuestions - totalAnswered} pertanyaan belum dijawab
          </p>
          <p className="text-xs text-muted-foreground">
            Pertanyaan yang tidak dijawab akan dianggap "Tidak Tahu" (CF = 0) dan tidak mempengaruhi hasil diagnosis
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-1">
          <Badge className="bg-gray-100 text-gray-600">📌 Umum</Badge>
          <span>Pertanyaan dasar</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge className="bg-purple-100 text-purple-700">🔍 Detail</Badge>
          <span>Muncul otomatis berdasarkan jawaban</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge className="bg-amber-100 text-amber-700">🎯 Spesifik</Badge>
          <span>Untuk diagnosis lebih akurat</span>
        </div>
      </div>
    </div>
  );
}