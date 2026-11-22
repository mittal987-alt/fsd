import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import { ModelQuerySchema } from "@/lib/validations/api-schemas";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Models" };

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

export default async function ModelsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const params = ModelQuerySchema.parse({
    q: sp.q,
    company: sp.company,
    type: sp.type,
    modality: sp.modality,
    sort: sp.sort || "score_desc",
    page: sp.page,
    limit: sp.limit || "20",
  });

  const result = await DataStore.getModels(params);

  const sortOptions = [
    { value: "score_desc", label: "Top Score" },
    { value: "price_asc", label: "Cheapest First" },
    { value: "price_desc", label: "Most Expensive" },
    { value: "context_desc", label: "Largest Context" },
    { value: "release_desc", label: "Newest First" },
    { value: "name_asc", label: "Name A–Z" },
  ];

  const typeColors: Record<string, "blue" | "purple" | "green" | "yellow" | "zinc"> = {
    "Chat/Completion": "blue",
    "Reasoning": "purple",
    "Multimodal": "green",
    "Code": "yellow",
    "Embedding": "zinc",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: "rgba(9,9,11,0.85)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">OA</div>
            <span className="font-semibold text-sm">OneAtlas</span>
          </Link>
          <div className="hidden md:flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/models" className="text-blue-400">Models</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
            <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">AI Models</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {result.total} models across {result.facets?.companies?.length ?? 0} labs
          </p>
        </div>

        {/* Filters Bar */}
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search models…"
            className="flex-1 min-w-48 px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500/60 transition-colors"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="">All Types</option>
            {result.facets?.modelTypes?.map((t) => (
              <option key={t.name} value={t.name}>{t.name} ({t.count})</option>
            ))}
          </select>
          <select
            name="company"
            defaultValue={params.company ?? ""}
            className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="">All Labs</option>
            {result.facets?.companies?.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name} ({c.count})</option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={params.sort}
            className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            Filter
          </button>
          {(params.q || params.company || params.type) && (
            <Link
              href="/models"
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Clear
            </Link>
          )}
        </form>

        {/* Model Table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-medium border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
            <div className="col-span-1">#</div>
            <div className="col-span-4">Model</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1 text-right">Params</div>
            <div className="col-span-1 text-right">Context</div>
            <div className="col-span-1 text-right">In /1M</div>
            <div className="col-span-1 text-right">Out /1M</div>
            <div className="col-span-1 text-right">Score</div>
          </div>
          {result.models.length === 0 && (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No models found matching your filters.
            </div>
          )}
          {result.models.map((model, idx) => {
            const start = (params.page - 1) * params.limit;
            const ctxLabel = model.contextWindow >= 1000000
              ? `${(model.contextWindow / 1000000).toFixed(1)}M`
              : `${Math.round(model.contextWindow / 1000)}K`;

            return (
              <Link
                key={model.slug}
                href={`/models/${model.slug}`}
                className="grid grid-cols-12 px-5 py-4 text-sm border-b last:border-0 items-center hover:bg-white/[0.02] transition-colors group"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="col-span-1 text-xs" style={{ color: "var(--text-muted)" }}>{start + idx + 1}</div>
                <div className="col-span-4 min-w-0 pr-3">
                  <div className="font-medium group-hover:text-blue-400 transition-colors truncate">{model.name}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{model.company?.name}</div>
                </div>
                <div className="col-span-2">
                  <Badge
                    label={model.modelType.split("/")[0]}
                    color={typeColors[model.modelType] ?? "blue"}
                  />
                </div>
                <div className="col-span-1 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {model.parameterCountBillion ? `${model.parameterCountBillion}B` : "—"}
                </div>
                <div className="col-span-1 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                  {ctxLabel}
                </div>
                <div className="col-span-1 text-right font-mono text-xs">
                  {model.inputPricePerMillion === 0
                    ? <span className="text-green-400">Free</span>
                    : <span style={{ color: "var(--text-secondary)" }}>${model.inputPricePerMillion}</span>
                  }
                </div>
                <div className="col-span-1 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                  ${model.outputPricePerMillion}
                </div>
                <div className="col-span-1 text-right font-mono text-xs text-blue-400">
                  {model.overallScore?.toFixed(1) ?? "—"}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {result.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {params.page > 1 && (
              <Link
                href={`/models?${new URLSearchParams({ ...sp, page: String(params.page - 1) }).toString()}`}
                className="px-4 py-2 rounded-lg text-sm border transition-colors"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                ← Prev
              </Link>
            )}
            <span className="px-4 py-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {params.page} / {result.totalPages}
            </span>
            {params.page < result.totalPages && (
              <Link
                href={`/models?${new URLSearchParams({ ...sp, page: String(params.page + 1) }).toString()}`}
                className="px-4 py-2 rounded-lg text-sm border transition-colors"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
