"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Check, X, ArrowRight, Sparkles } from "lucide-react";
import { MULTI_CATEGORIES, KATEGORI_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (categories: string[]) => void;
  maxCategories?: number;
}

export default function MultiCategorySelector({ onSelect, maxCategories = 5 }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = MULTI_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (categoryId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      if (prev.length >= maxCategories) {
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handleStart = () => {
    if (selectedIds.length > 0) {
      onSelect(selectedIds);
    }
  };

  const totalQuestions = selectedIds.reduce((sum, id) => {
    const cat = MULTI_CATEGORIES.find(c => c.id === id);
    return sum + (cat?.count || 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Diagnosis Multi Masalah</h1>
        </div>
        <p className="text-muted-foreground">
          Pilih semua kategori masalah yang Anda alami. Sistem akan menggabungkan semua pertanyaan
          dari kategori yang dipilih.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari kategori..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected Categories Badges */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium mr-2">Dipilih:</span>
          {selectedIds.map(id => {
            const cat = MULTI_CATEGORIES.find(c => c.id === id);
            return (
              <Badge key={id} className="gap-1" variant="secondary">
                {cat?.icon} {cat?.name}
                <button onClick={() => toggleCategory(id)} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          <span className="text-sm text-muted-foreground ml-2">
            (Total {totalQuestions} pertanyaan)
          </span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCategories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          const isDisabled = !isSelected && selectedIds.length >= maxCategories;
          
          return (
            <Card
              key={cat.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && toggleCategory(cat.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", cat.color, "bg-opacity-20")}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} pertanyaan</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? "bg-primary border-primary" : "border-gray-300"
                )}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info & Actions */}
      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          {selectedIds.length === 0 ? (
            <p>💡 Pilih minimal 1 kategori untuk memulai diagnosis</p>
          ) : (
            <p>✅ {selectedIds.length} kategori dipilih • {totalQuestions} pertanyaan akan ditampilkan</p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={selectedIds.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Mulai Diagnosis Multi Kategori
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ⚡ Maksimal {maxCategories} kategori dalam satu sesi diagnosis
        </p>
      </div>
    </div>
  );
}