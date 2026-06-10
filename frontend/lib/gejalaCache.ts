// lib/gejalaCache.ts
import { Gejala } from "@/types";
import { gejalaApi } from "./api";

// Simple cache untuk gejala
const gejalaCache = new Map<string, Gejala[]>();

export async function getGejalaByCategories(categories: string[]): Promise<Gejala[]> {
  const cacheKey = categories.sort().join(",");
  
  // Check cache
  if (gejalaCache.has(cacheKey)) {
    return gejalaCache.get(cacheKey)!;
  }
  
  // Fetch data
  const allGejala: Gejala[] = [];
  for (const cat of categories) {
    const res = await gejalaApi.list(cat);
    if (res.data && Array.isArray(res.data)) {
      allGejala.push(...res.data);
    }
  }
  
  // Remove duplicates
  const uniqueGejala = Array.from(
    new Map(allGejala.map(g => [g.id, g])).values()
  );
  
  // Store in cache
  gejalaCache.set(cacheKey, uniqueGejala);
  
  return uniqueGejala;
}

// Clear cache when needed
export function clearGejalaCache() {
  gejalaCache.clear();
}