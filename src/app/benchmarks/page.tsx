import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Benchmarks" };

export default async function BenchmarksPage() {
  const benchmarks = await DataStore.getBenchmarks();

  const categoryColors: Record<string, "blue" | "purple" | "yellow" | "green" | "zinc"> = {
    General: "blue",
    Reasoning: "purple",
    Coding: "yellow",
    Agentic: "green",
    Multimodal: "zinc",
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
            <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            <Link href="/benchmarks" className="text-blue-400">Benchmarks</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
            <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Benchmarks</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Industry-standard evaluations used to measure AI model capabilities
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {benchmarks.map((bench) => {
            const color = categoryColors[bench.category] ?? "blue";
            const badgeStyles: Record<string, string> = {
              blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              green: "bg-green-500/10 text-green-400 border-green-500/20",
              purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
              zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
            };

            return (
              <div
                key={bench.code}
                className="rounded-xl border p-5"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${badgeStyles[color]}`}>
                        {bench.category}
                      </span>
                      <code className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{bench.code}</code>
                    </div>
                    <h3 className="font-semibold">{bench.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>Metric</div>
                    <div className="text-sm font-mono font-medium">{bench.metric}</div>
                  </div>
                </div>
                <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>{bench.description}</p>

                {bench.topScorers.length > 0 && (
                  <div>
                    <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Top Performers</div>
                    <div className="space-y-2">
                      {bench.topScorers.map((scorer, i) => {
                        const rankEmoji = ["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`;
                        const pct = bench.maxValue > 0 ? (scorer.score / bench.maxValue) * 100 : 0;
                        return (
                          <div key={scorer.modelSlug} className="flex items-center gap-3">
                            <span className="text-sm w-6 shrink-0">{rankEmoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Link
                                  href={`/models/${scorer.modelSlug}`}
                                  className="text-xs hover:text-blue-400 transition-colors truncate"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {scorer.modelName}
                                </Link>
                                <span className="text-xs font-mono font-medium text-blue-400 shrink-0 ml-2">
                                  {scorer.score.toFixed(1)}
                                </span>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${Math.min(pct, 100)}%`, background: "#3b82f6", opacity: 1 - i * 0.2 }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
