import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Labs & Companies" };

export default async function CompaniesPage() {
  const companies = await DataStore.getCompanies();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: "rgba(9,9,11,0.85)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">OA</div>
            <span className="font-semibold text-sm">OneAtlas</span>
          </Link>
          <div className="hidden md:flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/models" className="hover:text-white transition-colors">Models</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/companies" className="text-blue-400">Labs</Link>
            <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">AI Labs &amp; Research Companies</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {companies.length} organizations building frontier AI
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="rounded-xl border p-5 transition-all hover:border-blue-500/40 group"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold group-hover:text-blue-400 transition-colors">{company.name}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-md border"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  {company.modelsCount} models
                </span>
              </div>
              <p className="text-xs mb-4 leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                {company.description}
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <div className="flex items-center gap-3">
                  {company.country && <span>📍 {company.country}</span>}
                  {company.foundedYear && <span>Est. {company.foundedYear}</span>}
                </div>
                {company.websiteUrl && (
                  <span className="text-blue-400">↗ Website</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
