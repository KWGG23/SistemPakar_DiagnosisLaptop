import Link from "next/link";
import { ArrowRight, Brain, CheckCircle, Cpu, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Forward Chaining",
    desc: "Inferensi berbasis aturan menggunakan metode forward chaining yang sistematis",
  },
  {
    icon: CheckCircle,
    title: "Certainty Factor",
    desc: "Tingkat kepercayaan diagnosis dihitung menggunakan metode Certainty Factor",
  },
  {
    icon: Cpu,
    title: "9 Kategori Kerusakan",
    desc: "Mencakup power, display, storage, RAM, overheating, audio, konektivitas, dan lebih",
  },
  {
    icon: Wrench,
    title: "Solusi Langkah Demi Langkah",
    desc: "Setiap diagnosis disertai panduan perbaikan yang detail dan praktis",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">DiagLaptop</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login Admin
              </Button>
            </Link>
            <Link href="/diagnosis">
              <Button size="sm">Mulai Diagnosis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Brain className="w-4 h-4" />
          Sistem Pakar Berbasis AI
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
          Diagnosis Kerusakan
          <br />
          <span className="text-primary">Laptop & PC</span> dengan Cepat
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Jawab beberapa pertanyaan tentang gejala yang dialami perangkat Anda, dan sistem pakar
          kami akan mengidentifikasi kemungkinan kerusakan beserta solusinya.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/diagnosis">
            <Button size="lg" className="text-base px-8">
              Mulai Diagnosis Sekarang <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="#cara-kerja">
            <Button variant="outline" size="lg" className="text-base px-8">
              Cara Kerja
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Siap Mendiagnosis?</h2>
            <p className="text-primary-foreground/80 mb-8">
              Gratis, cepat, dan tidak memerlukan akun. Cukup jawab pertanyaan dan dapatkan hasil
              diagnosis.
            </p>
            <Link href="/diagnosis">
              <Button
                variant="secondary"
                size="lg"
                className="text-base px-10"
              >
                Mulai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 DiagLaptop · Sistem Pakar Diagnosis Kerusakan Hardware</p>
      </footer>
    </div>
  );
}
