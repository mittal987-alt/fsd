import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare Models" };

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rawModels = sp.models?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  const allModels = await DataStore.getModels({ sort: "score_desc", page: 1, limit: 100 });

  let compareData: Awaited<ReturnType<typeof DataStore.compareModels>> | null = null;
  let compareError: string | null = null;

  if (rawModels.length >= 2) {
    try {
      compareData = await DataStore.compareModels(rawModels.slice(0, 5));
    } catch (e) {
      compareError = e instanceof Error ? e.message : "Comparison failed";
    }
  }

  function Badge({ label, color = "blue" }: { label: string; color?: "blue" | "green" | "purple" | "yellow" | "zinc" }) {
    const styles: Record<string, string> = {
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
            <Link href="/compare" className="text-blue-400">Compare</Link>
            <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Model Comparison</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select 2–5 models to compare side-by-side</p>
        </div>

        {/* Model Selector */}
        <form method="GET" className="flex flex-wrap gap-3 mb-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <select
              key={i}
              name="m"
              defaultValue={rawModels[i] ?? ""}
              className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer min-w-48"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <option value="">{i === 0 ? "Model 1" : i === 1 ? "Model 2" : `Model ${i + 1} (optional)`}</option>
              {allModels.models.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
            </select>
          ))}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#3b82f6", color: "#fff" }}
            formAction="/compare"
          >
            Compare →
          </button>
        </form>

        {/* Quick picks */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { label: "Claude vs GPT-4o", href: "/compare?models=claude-3-5-sonnet,gpt-4o" },
            { label: "DeepSeek R1 vs o1", href: "/compare?models=deepseek-r1,o1" },
            { label: "Top 3 Reasoning", href: "/compare?models=deepseek-r1,o1,claude-3-5-sonnet" },
            { label: "Best Value", href: "/compare?models=deepseek-v3,llama-3-3-70b-instruct,gpt-4o-mini" },
          ].map((pick) => (
            <Link
              key={pick.label}
              href={pick.href}
              className="px-3 py-1.5 rounded-lg text-xs border transition-colors hover:border-blue-500/40"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {pick.label}
            </Link>
          ))}
        </div>

        {compareError && (
          <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--bg-card)", borderColor: "#ef444440", color: "#ef4444" }}>
            {compareError}
          </div>
        )}

        {compareData && (
          <>
            {/* Comparison Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Price Differential", value: compareData.comparison.priceDifferentialRatio, sub: "between cheapest & priciest" },
                { label: "Cheapest Model", value: compareData.comparison.cheapestModel ?? "—", sub: "lowest input price" },
                { label: "Largest Context", value: compareData.comparison.largestContextModel ?? "—", sub: "longest context window" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  <div className="font-semibold text-blue-400 font-mono">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Side-by-side table */}
            <div className="rounded-xl border overflow-x-auto" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    <th className="px-5 py-3 text-left text-xs font-medium w-36" style={{ color: "var(--text-muted)" }}>Attribute</th>
                    {compareData.models.map((m) => (
                      <th key={m.slug} className="px-5 py-3 text-center min-w-40">
                        <Link href={`/models/${m.slug}`} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-xs">
                          {m.name}
                        </Link>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.company?.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Overall Score",
                      render: (m: typeof compareData.models[0]) =>
                        <span className="text-blue-400 font-mono">{m.overallScore?.toFixed(1) ?? "—"}</span>,
                    },
                    {
                      label: "Type",
                      render: (m: typeof compareData.models[0]) =>
                        <Badge label={m.modelType.split("/")[0]} color={"blue"} />,
                    },
                    {
                      label: "Context Window",
                      render: (m: typeof compareData.models[0]) => {
                        const ctx = m.contextWindow >= 1000000
                          ? `${(m.contextWindow / 1000000).toFixed(1)}M`
                          : `${Math.round(m.contextWindow / 1000)}K`;
                        return <span className="font-mono">{ctx}</span>;
                      },
                    },
                    {
                      label: "Max Output",
                      render: (m: typeof compareData.models[0]) =>
                        <span className="font-mono">{Math.round(m.maxOutputTokens / 1000)}K</span>,
                    },
                    {
                      label: "Input / 1M",
                      render: (m: typeof compareData.models[0]) => {
                        const cheapest = compareData!.comparison.cheapestModel;
                        const isMin = m.slug === cheapest;
                        return (
                          <span className={`font-mono ${isMin ? "text-green-400" : ""}`}>
                            {m.inputPricePerMillion === 0 ? "Free" : `$${m.inputPricePerMillion}`}
                          </span>
                        );
                      },
                    },
                    {
                      label: "Output / 1M",
                      render: (m: typeof compareData.models[0]) =>
                        <span className="font-mono">${m.outputPricePerMillion}</span>,
                    },
                    {
                      label: "Parameters",
                      render: (m: typeof compareData.models[0]) =>
                        <span className="font-mono">{m.parameterCountBillion ? `${m.parameterCountBillion}B` : "Unknown"}</span>,
                    },
                    {
                      label: "License",
                      render: (m: typeof compareData.models[0]) =>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.license}</span>,
                    },
                    {
                      label: "Modalities",
                      render: (m: typeof compareData.models[0]) => (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {m.modalities.map((mod) => <Badge key={mod} label={mod} color="blue" />)}
                        </div>
                      ),
                    },
                  ].map((row) => (
                    <tr key={row.label} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{row.label}</td>
                      {compareData!.models.map((m) => (
                        <td key={m.slug} className="px-5 py-3 text-center text-xs">
                          {row.render(m)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Benchmark Comparison */}
            <div className="mt-8 rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold">Benchmark Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      <th className="px-5 py-3 text-left text-xs font-medium w-48" style={{ color: "var(--text-muted)" }}>Benchmark</th>
                      {compareData.models.map((m) => (
                        <th key={m.slug} className="px-5 py-3 text-center text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                          {m.name.split(" ").slice(0, 2).join(" ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.comparison.benchmarks.map(({ benchmark, scores }) => {
                      const hasData = Object.values(scores).some((s) => s.rawScore !== null);
                      if (!hasData) return null;

                      const validScores = Object.values(scores).filter((s) => s.rawScore !== null).map((s) => s.rawScore as number);
                      const maxScore = Math.max(...validScores);

                      return (
                        <tr key={benchmark.code} className="border-t" style={{ borderColor: "var(--border)" }}>
                          <td className="px-5 py-3">
                            <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{benchmark.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{benchmark.category} · {benchmark.metric}</div>
                          </td>
                          {compareData!.models.map((m) => {
                            const score = scores[m.slug];
                            const isBest = score.rawScore !== null && score.rawScore === maxScore;
                            return (
                              <td key={m.slug} className="px-5 py-3 text-center font-mono text-xs">
                                {score.rawScore !== null ? (
                                  <span className={isBest ? "text-green-400 font-semibold" : ""} style={isBest ? {} : { color: "var(--text-secondary)" }}>
                                    {score.rawScore.toFixed(1)}
                                    {isBest && " ✓"}
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--text-muted)" }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!compareData && rawModels.length < 2 && (
          <div className="rounded-xl border p-10 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-lg font-semibold mb-2">Select at least 2 models to compare</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Use the dropdowns above, or click one of the quick comparison presets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
