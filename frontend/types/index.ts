export interface Gejala {
  id: string;
  kode: string;
  pertanyaan: string;
  kategori: string;
}

export interface Kerusakan {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  solusi: string;
  kategori: string;
}

export interface Rule {
  id: string;
  gejala_id: string;
  kerusakan_id: string;
  cf_pakar: number;
  gejala_kode?: string;
  gejala_pertanyaan?: string;
  kerusakan_kode?: string;
  kerusakan_nama?: string;
}

export interface GejalaInput {
  gejala_id: string;
  cf_user: number;
}

export interface DiagnosisItem {
  kerusakan_id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  solusi: string;
  kategori: string;
  cf_total: number;
}

export interface DiagnoseResponse {
  session_id: string;
  hasil: DiagnosisItem[];
  total_gejala: number;
}

export interface HistoryItem {
  id: string;
  session_id: string;
  gejala_dipilih: GejalaInput[];
  hasil: DiagnosisItem[];
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const CF_USER_VALUES = {
  ya: 1.0,
  mungkin: 0.6,
  tidak_tahu: 0.0,
  tidak: -1.0,
} as const;

export type CFUserKey = keyof typeof CF_USER_VALUES;

export const KATEGORI_LABELS: Record<string, string> = {
  power: "Daya / Power",
  baterai: "Baterai",
  display: "Layar / Display",
  overheating: "Overheat",
  storage: "Penyimpanan",
  keyboard: "Keyboard & Touchpad",
  audio: "Audio / Suara",
  konektivitas: "Konektivitas",
  port: "Port & Konektor",
  ram: "RAM / Memori",
  motherboard: "Motherboard",
  cpu: "Prosesor (CPU)",
  gpu: "Kartu Grafis (GPU)",
};

// ============================================================
// MULTI CATEGORY & BRANCHING (FRONTEND ONLY)
// ============================================================

export interface GejalaDetail extends Gejala {
  level: 1 | 2 | 3 | 4;
  parentId?: string;
  dependsOnValue?: number[];
  isDynamic?: boolean;
}

// Daftar lengkap kategori untuk multi-select
export const MULTI_CATEGORIES = [
  { id: "power", name: "Daya / Power", icon: "🔌", color: "bg-red-500", count: 13 },
  { id: "baterai", name: "Baterai", icon: "🔋", color: "bg-orange-500", count: 5 },
  { id: "display", name: "Layar", icon: "🖥️", color: "bg-blue-500", count: 8 },
  { id: "overheating", name: "Overheating", icon: "🌡️", color: "bg-red-600", count: 7 },
  { id: "storage", name: "Penyimpanan", icon: "💾", color: "bg-purple-500", count: 8 },
  { id: "keyboard", name: "Keyboard/Touchpad", icon: "⌨️", color: "bg-green-500", count: 7 },
  { id: "audio", name: "Audio/Suara", icon: "🔊", color: "bg-yellow-500", count: 4 },
  { id: "konektivitas", name: "Konektivitas", icon: "🌐", color: "bg-indigo-500", count: 4 },
  { id: "port", name: "Port", icon: "🔌", color: "bg-gray-500", count: 4 },
  { id: "ram", name: "RAM", icon: "🧠", color: "bg-pink-500", count: 5 },
];

// Pertanyaan Detail Level 2 (muncul setelah user menjawab pertanyaan level 1)
export const DETAIL_QUESTIONS: Record<string, Omit<GejalaDetail, 'kategori' | 'kode'>> = {
  // ========== POWER CATEGORY ==========
  "G001": {
    id: "D001",
    pertanyaan: "Apakah lampu indikator power (LED) menyala meskipun layar gelap?",
    level: 2,
    parentId: "G001",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G001_d2": {
    id: "D002",
    pertanyaan: "Apakah ada bunyi beep atau suara kipas saat tombol power ditekan?",
    level: 2,
    parentId: "G001",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G004": {
    id: "D003",
    pertanyaan: "Apakah laptop mati setelah digunakan beberapa menit atau langsung saat dinyalakan?",
    level: 2,
    parentId: "G004",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G004_d2": {
    id: "D004",
    pertanyaan: "Apakah laptop bisa menyala kembali setelah didinginkan beberapa saat?",
    level: 2,
    parentId: "G004",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G006": {
    id: "D005",
    pertanyaan: "Apakah charger terlihat bengkok atau kabelnya terkelupas?",
    level: 2,
    parentId: "G006",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== DISPLAY CATEGORY ==========
  "G014": {
    id: "D006",
    pertanyaan: "Apakah layar menampilkan gambar sangat samar jika disenter (masih ada backlight)?",
    level: 2,
    parentId: "G014",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G014_d2": {
    id: "D007",
    pertanyaan: "Apakah gambar normal saat laptop dihubungkan ke monitor eksternal?",
    level: 2,
    parentId: "G014",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G016": {
    id: "D008",
    pertanyaan: "Apakah garis tersebut bergerak (berkedip) atau statis/tetap?",
    level: 2,
    parentId: "G016",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G016_d2": {
    id: "D009",
    pertanyaan: "Apakah garis muncul sejak laptop dinyalakan (sebelum masuk Windows) atau setelah masuk OS?",
    level: 2,
    parentId: "G016",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G017": {
    id: "D010",
    pertanyaan: "Apakah kedipan terjadi terus-menerus atau hanya saat aplikasi tertentu?",
    level: 2,
    parentId: "G017",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G021": {
    id: "D011",
    pertanyaan: "Apakah artefak muncul hanya saat game/aplikasi berat atau juga di desktop?",
    level: 2,
    parentId: "G021",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== OVERHEATING CATEGORY ==========
  "G022": {
    id: "D012",
    pertanyaan: "Apakah area sekitar keyboard atau bawah laptop terasa sangat panas hingga tidak nyaman?",
    level: 2,
    parentId: "G022",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G023": {
    id: "D013",
    pertanyaan: "Apakah suara kipas seperti bergetar, berdecit, atau seperti ada yang menyangkut?",
    level: 2,
    parentId: "G023",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G023_d2": {
    id: "D014",
    pertanyaan: "Apakah kipas terkadang berhenti berputar meskipun laptop panas?",
    level: 2,
    parentId: "G023",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G025": {
    id: "D015",
    pertanyaan: "Berapa lama rata-rata laptop bisa menyala sebelum mati?",
    level: 2,
    parentId: "G025",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== STORAGE CATEGORY ==========
  "G029": {
    id: "D016",
    pertanyaan: "Apakah muncul pesan error seperti 'No bootable device' atau 'Operating system not found'?",
    level: 2,
    parentId: "G029",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G032": {
    id: "D017",
    pertanyaan: "Apakah bunyi klik terjadi terus-menerus atau hanya saat mengakses file?",
    level: 2,
    parentId: "G032",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G033": {
    id: "D018",
    pertanyaan: "Apakah laptop terasa lambat saat booting, membuka file, atau keduanya?",
    level: 2,
    parentId: "G033",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== AUDIO CATEGORY ==========
  "G044": {
    id: "D019",
    pertanyaan: "Apakah suara berfungsi normal saat menggunakan headphone?",
    level: 2,
    parentId: "G044",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G045": {
    id: "D020",
    pertanyaan: "Apakah suara pecah terjadi di semua volume atau hanya saat volume tinggi?",
    level: 2,
    parentId: "G045",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== RAM CATEGORY ==========
  "G054": {
    id: "D021",
    pertanyaan: "Berapa kali bunyi beep yang terdengar? (misal: 1x pendek, 3x panjang)",
    level: 2,
    parentId: "G054",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G055": {
    id: "D022",
    pertanyaan: "Apa kode error yang muncul pada Blue Screen? (contoh: MEMORY_MANAGEMENT, IRQL_NOT_LESS_OR_EQUAL)",
    level: 2,
    parentId: "G055",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== KEYBOARD CATEGORY ==========
  "G037": {
    id: "D023",
    pertanyaan: "Berapa banyak tombol yang tidak berfungsi? (1-3 tombol, 4-10 tombol, atau banyak tombol)",
    level: 2,
    parentId: "G037",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G038": {
    id: "D024",
    pertanyaan: "Apakah tombol yang ditekan menghasilkan karakter yang berbeda atau mengetik sendiri tanpa ditekan?",
    level: 2,
    parentId: "G038",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== KONEKTIVITAS CATEGORY ==========
  "G048": {
    id: "D025",
    pertanyaan: "Apakah WiFi card terlihat di Device Manager (dengan tanda kuning) atau tidak ada sama sekali?",
    level: 2,
    parentId: "G048",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G049": {
    id: "D026",
    pertanyaan: "Apakah perangkat lain (HP, laptop lain) memiliki sinyal kuat di lokasi yang sama?",
    level: 2,
    parentId: "G049",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },

  // ========== PORT CATEGORY ==========
  "G052": {
    id: "D027",
    pertanyaan: "Apakah port USB lain berfungsi normal?",
    level: 2,
    parentId: "G052",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "G053": {
    id: "D028",
    pertanyaan: "Apakah sudah mencoba kabel HDMI yang berbeda dan monitor lain?",
    level: 2,
    parentId: "G053",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
};

// Pertanyaan Level 3 (Lebih spesifik)
export const SPECIFIC_QUESTIONS: Record<string, Omit<GejalaDetail, 'kategori' | 'kode'>> = {
  "D006": {
    id: "S001",
    pertanyaan: "Apakah Anda bisa melihat bayangan Windows/desktop jika dilihat dari sudut samping?",
    level: 3,
    parentId: "D006",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "D007": {
    id: "S002",
    pertanyaan: "Apakah layar laptop pernah terbentur atau terkena tekanan berlebih?",
    level: 3,
    parentId: "D007",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "D008": {
    id: "S003",
    pertanyaan: "Apakah garis berubah-ubah warna atau posisinya saat layar digerakkan?",
    level: 3,
    parentId: "D008",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "D012": {
    id: "S004",
    pertanyaan: "Apakah panas terasa di satu area tertentu (misal: kiri atas) atau menyeluruh?",
    level: 3,
    parentId: "D012",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
  "D013": {
    id: "S005",
    pertanyaan: "Apakah suara berisik berkurang jika laptop dimiringkan atau diketuk pelan?",
    level: 3,
    parentId: "D013",
    dependsOnValue: [1.0, 0.6],
    isDynamic: true,
  },
};

// Fungsi untuk mendapatkan semua pertanyaan dinamis berdasarkan jawaban user
export function getDynamicQuestions(
  currentAnswers: Record<string, number>,
  kategori: string
): GejalaDetail[] {
  const dynamicQuestions: GejalaDetail[] = [];
  const answeredIds = Object.keys(currentAnswers);
  
  // Level 2
  for (const [parentId, detail] of Object.entries(DETAIL_QUESTIONS)) {
    const answerValue = currentAnswers[parentId];
    const requiredValues = detail.dependsOnValue || [1.0, 0.6];
    
    if (answerValue !== undefined && requiredValues.includes(answerValue)) {
      const parentKategori = getKategoriByGejalaId(parentId);
      if (parentKategori === kategori || !kategori) {
        dynamicQuestions.push({
          ...detail,
          kategori: parentKategori,
          kode: `DYN_${detail.id}`,
        } as GejalaDetail);
      }
    }
  }
  
  // Level 3
  for (const [parentId, detail] of Object.entries(SPECIFIC_QUESTIONS)) {
    const answerValue = currentAnswers[parentId];
    const requiredValues = detail.dependsOnValue || [1.0, 0.6];
    
    if (answerValue !== undefined && requiredValues.includes(answerValue)) {
      const parentKategori = getKategoriByDynamicId(parentId);
      if (parentKategori === kategori || !kategori) {
        dynamicQuestions.push({
          ...detail,
          kategori: parentKategori,
          kode: `DYN_${detail.id}`,
        } as GejalaDetail);
      }
    }
  }
  
  return dynamicQuestions;
}

// Helper: Mapping ID gejala ke kategori
export function getKategoriByGejalaId(gejalaId: string): string {
  const mapping: Record<string, string> = {
    "G001": "power", "G002": "power", "G003": "power", "G004": "power", "G005": "power",
    "G006": "power", "G007": "power", "G008": "power",
    "G009": "baterai", "G010": "baterai", "G011": "baterai", "G012": "baterai", "G013": "baterai",
    "G014": "display", "G015": "display", "G016": "display", "G017": "display", "G018": "display",
    "G019": "display", "G020": "display", "G021": "display",
    "G022": "overheating", "G023": "overheating", "G024": "overheating", "G025": "overheating",
    "G026": "overheating", "G027": "overheating", "G028": "overheating",
    "G029": "storage", "G030": "storage", "G031": "storage", "G032": "storage", "G033": "storage",
    "G034": "storage", "G035": "storage", "G036": "storage",
    "G037": "keyboard", "G038": "keyboard", "G039": "keyboard", "G040": "keyboard",
    "G041": "keyboard", "G042": "keyboard", "G043": "keyboard",
    "G044": "audio", "G045": "audio", "G046": "audio", "G047": "audio",
    "G048": "konektivitas", "G049": "konektivitas", "G050": "konektivitas", "G051": "konektivitas",
    "G052": "port", "G053": "port", "G069": "port", "G070": "port",
    "G054": "ram", "G055": "ram", "G056": "ram", "G057": "ram", "G058": "ram",
    "G059": "motherboard", "G060": "motherboard", "G061": "motherboard", "G062": "motherboard",
    "G063": "motherboard",
    "G064": "cpu", "G065": "cpu",
    "G066": "gpu", "G067": "gpu", "G068": "gpu",
  };
  return mapping[gejalaId] || "power";
}

export function getKategoriByDynamicId(dynamicId: string): string {
  const mapping: Record<string, string> = {
    "D001": "power", "D002": "power", "D003": "power", "D004": "power", "D005": "power",
    "D006": "display", "D007": "display", "D008": "display", "D009": "display", "D010": "display",
    "D011": "display",
    "D012": "overheating", "D013": "overheating", "D014": "overheating", "D015": "overheating",
    "D016": "storage", "D017": "storage", "D018": "storage",
    "D019": "audio", "D020": "audio",
    "D021": "ram", "D022": "ram",
    "D023": "keyboard", "D024": "keyboard",
    "D025": "konektivitas", "D026": "konektivitas",
    "D027": "port", "D028": "port",
    "S001": "display", "S002": "display", "S003": "display",
    "S004": "overheating", "S005": "overheating",
  };
  return mapping[dynamicId] || "power";
}

// Helper untuk mendapatkan warna berdasarkan kategori
export const getCategoryColor = (kategori: string): string => {
  const colors: Record<string, string> = {
    power: "bg-red-500",
    baterai: "bg-orange-500",
    display: "bg-blue-500",
    overheating: "bg-red-600",
    storage: "bg-purple-500",
    keyboard: "bg-green-500",
    audio: "bg-yellow-500",
    konektivitas: "bg-indigo-500",
    port: "bg-gray-500",
    ram: "bg-pink-500",
    motherboard: "bg-slate-500",
    cpu: "bg-cyan-500",
    gpu: "bg-emerald-500",
  };
  return colors[kategori] || "bg-gray-500";
};