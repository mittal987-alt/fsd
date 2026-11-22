import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await DataStore.getCompanyBySlug(slug);
  if (!company) return { title: "Not Found" };
  return { title: company.name, description: company.description };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const company = await DataStore.getCompanyBySlug(slug);
  if (!company) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: "rgba(9,9,11,0.85)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">OA</div>
            <span className="font-semibold text-sm">OneAtlas</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{company.name}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
          <p className="text-sm max-w-2xl leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            {company.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            {company.country && <span>📍 {company.country}</span>}
            {company.foundedYear && <span>🗓 Founded {company.foundedYear}</span>}
            {company.websiteUrl && (
              <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                ↗ {company.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Models by {company.name}</h2>
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            {company.models.map((model) => {
              const ctx = model.contextWindow >= 1_000_000
                ? `${(model.contextWindow / 1_000_000).toFixed(1)}M`
                : `${Math.round(model.contextWindow / 1000)}K`;
              return (
                <Link
                  key={model.slug}
                  href={`/models/${model.slug}`}
                  className="flex items-center justify-between px-5 py-4 border-b last:border-0 hover:bg-white/[0.02] transition-colors group"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <div className="font-medium group-hover:text-blue-400 transition-colors">{model.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{model.modelType}</div>
                  </div>
                  <div className="flex items-center gap-6 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-mono">{ctx} ctx</span>
                    <span className="font-mono">
                      {model.inputPricePerMillion === 0 ? <span className="text-green-400">Free</span> : `$${model.inputPricePerMillion}/1M`}
                    </span>
                    <span className="text-blue-400">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
