import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rankings & Leaderboard" };

export default async function RankingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const category = (sp.category ?? "overall") as "overall" | "reasoning" | "coding" | "value";

  const rankings = await DataStore.getRankings(category, 20);

  const categories = [
    { key: "overall", label: "Overall" },
    { key: "reasoning", label: "Reasoning" },
    { key: "coding", label: "Coding" },
    { key: "value", label: "Best Value" },
  ];

  const categoryColors: Record<string, "blue" | "purple" | "yellow" | "green"> = {
    overall: "blue",
    reasoning: "purple",
    coding: "yellow",
    value: "green",
  };

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
            <Link href="/rankings" className="text-blue-400">Rankings</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
            <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Model Leaderboard</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Rankings across capability categories</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/rankings?category=${cat.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                category === cat.key ? "bg-blue-500 text-white border-blue-500" : ""
              }`}
              style={
                category !== cat.key
                  ? { background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                  : {}
              }
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
            <h2 className="font-semibold capitalize">{category} Rankings</h2>
          </div>

          {rankings.map(({ rank, model, compositeScore }) => {
            const ctxLabel = model.contextWindow >= 1000000
              ? `${(model.contextWindow / 1000000).toFixed(1)}M`
              : `${Math.round(model.contextWindow / 1000)}K`;

            const rankColors: Record<number, string> = {
              1: "#fbbf24",
              2: "#9ca3af",
              3: "#cd7c2f",
            };

            return (
              <Link
                key={model.slug}
                href={`/models/${model.slug}`}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-white/[0.02] transition-colors group"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Rank */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: rankColors[rank] ? `${rankColors[rank]}20` : "var(--bg-elevated)",
                    color: rankColors[rank] ?? "var(--text-muted)",
                    border: `1px solid ${rankColors[rank] ? `${rankColors[rank]}40` : "var(--border)"}`,
                  }}
                >
                  {rank}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium group-hover:text-blue-400 transition-colors">{model.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{model.company?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{model.modelType}</span>
                    <span>•</span>
                    <span>{ctxLabel} ctx</span>
                    <span>•</span>
                    <span>{model.license}</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="hidden sm:flex flex-col items-end gap-1 w-32 shrink-0">
                  <span className="text-xs font-mono text-blue-400 font-semibold">{compositeScore.toFixed(1)}</span>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${compositeScore}%`, background: "#3b82f6" }}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0 w-20">
                  <div className="text-xs font-mono" style={{ color: model.inputPricePerMillion === 0 ? "#22c55e" : "var(--text-secondary)" }}>
                    {model.inputPricePerMillion === 0 ? "Free" : `$${model.inputPricePerMillion}`}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>per 1M in</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
