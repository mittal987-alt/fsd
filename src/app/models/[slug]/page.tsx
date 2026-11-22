import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await DataStore.getModelBySlug(slug);
  if (!model) return { title: "Model Not Found" };
  return {
    title: model.name,
    description: model.description,
  };
}

function Badge({ label, color = "blue" }: { label: string; color?: "blue" | "green" | "purple" | "yellow" | "zinc" }) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${styles[color]}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
      <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="text-lg font-semibold font-mono">{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;
  const model = await DataStore.getModelBySlug(slug);
  if (!model) notFound();

  const ctxLabel = model.contextWindow >= 1000000
    ? `${(model.contextWindow / 1000000).toFixed(1)}M`
    : `${Math.round(model.contextWindow / 1000)}K`;

  const releaseDate = new Date(model.releaseDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: "rgba(9,9,11,0.85)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">OA</div>
            <span className="font-semibold text-sm">OneAtlas</span>
          </Link>
          <nav className="hidden md:flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/models" className="hover:text-white transition-colors">Models</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
            <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          </nav>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/models" className="hover:text-white transition-colors">Models</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{model.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge label={model.modelType} color={model.modelType === "Reasoning" ? "purple" : model.modelType === "Multimodal" ? "green" : model.modelType === "Code" ? "yellow" : "blue"} />
              <Badge label={model.license} color="zinc" />
              {model.isFeatured && <Badge label="⭐ Featured" color="yellow" />}
            </div>
            <h1 className="text-2xl font-bold mb-2">{model.name}</h1>
            <p className="text-sm mb-2 leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              {model.description}
            </p>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              {model.company && (
                <Link href={`/companies/${model.company.slug}`} className="hover:text-blue-400 transition-colors">
                  🏢 {model.company.name}
                </Link>
              )}
              <span>Released {releaseDate}</span>
              {model.overallScore && (
                <span className="text-blue-400 font-mono font-medium">Score: {model.overallScore.toFixed(1)}</span>
              )}
            </div>
          </div>
          <Link
            href={`/compare?models=${model.slug}`}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            + Compare
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Context Window" value={ctxLabel} sub="tokens" />
          <StatCard label="Max Output" value={`${Math.round(model.maxOutputTokens / 1000)}K`} sub="tokens" />
          <StatCard label="Input Price" value={model.inputPricePerMillion === 0 ? "Free" : `$${model.inputPricePerMillion}`} sub="per 1M tokens" />
          <StatCard label="Output Price" value={model.outputPricePerMillion === 0 ? "Free" : `$${model.outputPricePerMillion}`} sub="per 1M tokens" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Architecture */}
            <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h2 className="font-semibold mb-4">Specifications</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  { label: "Architecture", value: model.architecture },
                  { label: "Parameters", value: model.parameterCountBillion ? `${model.parameterCountBillion}B` : "Unknown" },
                  { label: "License", value: model.license },
                  { label: "Cache Read", value: model.cacheReadPricePerMillion != null ? `$${model.cacheReadPricePerMillion}/1M` : "N/A" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Modalities</div>
                <div className="flex flex-wrap gap-2">
                  {model.modalities.map((m) => (
                    <Badge key={m} label={m} color="blue" />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((c) => (
                    <Badge key={c} label={c} color="zinc" />
                  ))}
                </div>
              </div>
            </div>

            {/* Provider Offerings */}
            {model.offerings && model.offerings.length > 0 && (
              <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <h2 className="font-semibold">Available Providers</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {model.offerings.length} provider{model.offerings.length > 1 ? "s" : ""} offering this model
                  </p>
                </div>
                <div>
                  {model.offerings.map((off, i) => (
                    <div
                      key={off.id}
                      className="px-5 py-4 border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{off.provider?.name ?? off.providerId}</div>
                          <Badge label={off.isAvailable ? "Live" : "Unavailable"} color={off.isAvailable ? "green" : "zinc"} />
                        </div>
                        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {off.providerModelId}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: "In /1M", value: `$${off.inputPricePerMillion}` },
                          { label: "Out /1M", value: `$${off.outputPricePerMillion}` },
                          { label: "P50 Latency", value: `${off.latencyP50Ms}ms` },
                          { label: "Throughput", value: `${off.throughputTps} tok/s` },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div style={{ color: "var(--text-muted)" }}>{label}</div>
                            <div className="font-mono mt-0.5">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Benchmarks */}
          <div className="space-y-6">
            {model.benchmarkScores && model.benchmarkScores.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <h2 className="font-semibold mb-4">Benchmarks</h2>
                <div className="space-y-4">
                  {model.benchmarkScores.map((bs) => {
                    const pct = bs.normalizedScore;
                    const color = pct >= 90 ? "#22c55e" : pct >= 75 ? "#3b82f6" : pct >= 60 ? "#eab308" : "#ef4444";
                    return (
                      <div key={bs.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: "var(--text-secondary)" }}>{bs.benchmark?.name ?? bs.benchmarkId}</span>
                          <span className="font-mono font-medium" style={{ color }}>
                            {bs.score.toFixed(1)} {bs.benchmark?.metric}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cost Calculator Quicklink */}
            <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-3 text-sm">Cost Estimation</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Calculate your monthly spend using the{" "}
                <code className="font-mono text-blue-400 text-xs">POST /api/v1/calculate-cost</code> endpoint.
              </p>
              <div className="rounded-lg p-3 font-mono text-xs" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {`{\n  "modelSlug": "${model.slug}",\n  "promptTokens": 1000,\n  "completionTokens": 500,\n  "requestsPerMonth": 10000\n}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
