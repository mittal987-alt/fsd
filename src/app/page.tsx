import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import { ModelQuerySchema } from "@/lib/validations/api-schemas";

function Badge({ label, color = "blue" }: { label: string; color?: "blue" | "green" | "purple" | "yellow" | "red" | "zinc" }) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${styles[color]}`}>
      {label}
    </span>
  );
}

function PriceBadge({ price }: { price: number }) {
  if (price === 0) return <Badge label="Free" color="green" />;
  if (price <= 0.5) return <Badge label={`$${price}/1M`} color="green" />;
  if (price <= 5) return <Badge label={`$${price}/1M`} color="blue" />;
  return <Badge label={`$${price}/1M`} color="yellow" />;
}

function ContextBadge({ ctx }: { ctx: number }) {
  const k = ctx >= 1000000 ? `${(ctx / 1000000).toFixed(1)}M` : `${Math.round(ctx / 1000)}K`;
  return <span className="text-xs text-zinc-400">{k}</span>;
}

function TypeColor(type: string): "blue" | "purple" | "green" | "yellow" | "zinc" {
  if (type.includes("Reasoning")) return "purple";
  if (type.includes("Multi") || type.includes("Code")) return "green";
  if (type.includes("Embedding")) return "yellow";
  return "blue";
}

export default async function HomePage() {
  const params = ModelQuerySchema.parse({});
  const result = await DataStore.getModels({ ...params, limit: 20 });
  const stats = await DataStore.getPlatformStats();
  const featured = result.models.filter((m) => m.isFeatured).slice(0, 4);

  const navItems = [
    { href: "/models", label: "Models" },
    { href: "/compare", label: "Compare" },
    { href: "/rankings", label: "Rankings" },
    { href: "/benchmarks", label: "Benchmarks" },
    { href: "/companies", label: "Labs" },
    { href: "/providers", label: "Providers" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: "rgba(9,9,11,0.85)", borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  OA
                </div>
                <span className="font-semibold tracking-tight">OneAtlas</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-md text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseOver={(e) => { (e.target as HTMLElement).style.color = "var(--text-primary)"; }}
                    onMouseOut={(e) => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/models"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search models
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(59,130,246,0.4), transparent)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-6"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {stats.totalModels} models tracked across {stats.totalProviders} providers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            AI Model Discovery &amp;{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)" }}>
              Intelligence
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
            Discover, compare, and evaluate every frontier AI model across providers.
            Real-time pricing, benchmarks, latency, and infrastructure data for engineers and researchers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/models"
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{ background: "#3b82f6", color: "#fff" }}
            >
              Explore Models →
            </Link>
            <Link
              href="/compare"
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Compare Side-by-Side
            </Link>
            <Link
              href="/api/v1/models"
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              target="_blank"
            >
              REST API ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <section className="border-y py-8" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: "Models Indexed", value: stats.totalModels },
              { label: "Providers", value: stats.totalProviders },
              { label: "AI Labs", value: stats.totalCompanies },
              { label: "Avg Latency", value: `${stats.avgLatencyMs}ms` },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Models ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Featured Models</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Top frontier models by composite benchmark score</p>
          </div>
          <Link href="/models" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((model) => (
            <Link
              key={model.slug}
              href={`/models/${model.slug}`}
              className="group rounded-xl p-4 border transition-all hover:border-blue-500/40"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <Badge label={model.modelType} color={TypeColor(model.modelType)} />
                {model.overallScore && (
                  <span className="text-xs font-mono text-blue-400">{model.overallScore.toFixed(1)}</span>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors leading-snug">
                {model.name}
              </h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {model.company?.name}
              </p>
              <div className="flex items-center justify-between">
                <PriceBadge price={model.inputPricePerMillion} />
                <ContextBadge ctx={model.contextWindow} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── All Models Table ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Model Catalogue</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>All indexed models ranked by composite score</p>
          </div>
          <Link href="/rankings" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Leaderboard →
          </Link>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-medium border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
            <div className="col-span-1">#</div>
            <div className="col-span-4">Model</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2 text-right">Input / 1M</div>
            <div className="col-span-2 text-right">Context</div>
            <div className="col-span-1 text-right">Score</div>
          </div>
          {result.models.map((model, idx) => (
            <Link
              key={model.slug}
              href={`/models/${model.slug}`}
              className="grid grid-cols-12 px-4 py-3.5 text-sm border-b last:border-0 transition-colors hover:bg-white/[0.02] items-center group"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="col-span-1 text-xs" style={{ color: "var(--text-muted)" }}>{idx + 1}</div>
              <div className="col-span-4">
                <div className="font-medium group-hover:text-blue-400 transition-colors truncate">{model.name}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{model.company?.name}</div>
              </div>
              <div className="col-span-2">
                <Badge label={model.modelType.split("/")[0]} color={TypeColor(model.modelType)} />
              </div>
              <div className="col-span-2 text-right font-mono text-xs">
                {model.inputPricePerMillion === 0 ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  <span style={{ color: "var(--text-secondary)" }}>${model.inputPricePerMillion}</span>
                )}
              </div>
              <div className="col-span-2 text-right text-xs" style={{ color: "var(--text-secondary)" }}>
                <ContextBadge ctx={model.contextWindow} />
              </div>
              <div className="col-span-1 text-right font-mono text-xs text-blue-400">
                {model.overallScore?.toFixed(1) ?? "—"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── API CTA ──────────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold mb-3">REST API Included</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            All data is available via a structured JSON API. Query, filter, compare, and calculate costs programmatically.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-xs font-mono">
            {[
              "GET /api/v1/models",
              "GET /api/v1/models/:slug",
              "GET /api/v1/models/compare",
              "GET /api/v1/rankings",
              "POST /api/v1/calculate-cost",
              "GET /api/v1/benchmarks",
              "GET /api/v1/companies",
              "GET /api/v1/providers",
              "GET /api/health",
            ].map((endpoint) => (
              <span
                key={endpoint}
                className="px-3 py-1.5 rounded-md border"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {endpoint}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t py-8 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <p>OneAtlas · AI Model Intelligence Platform · Built with Next.js, Prisma &amp; PostgreSQL</p>
      </footer>
    </div>
  );
}
