import Link from "next/link";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Inference Providers" };

export default async function ProvidersPage() {
  const providers = await DataStore.getProviders();

  const statusColors: Record<string, string> = {
    Operational: "text-green-400",
    Degraded: "text-yellow-400",
    Down: "text-red-400",
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
            <Link href="/companies" className="hover:text-white transition-colors">Labs</Link>
            <Link href="/providers" className="text-blue-400">Providers</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Inference Providers</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {providers.length} API providers hosting and serving AI models
          </p>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          {/* Header */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-medium border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
            <div className="col-span-4">Provider</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Avg Latency</div>
            <div className="col-span-2 text-right">Throughput</div>
            <div className="col-span-2 text-right">Models</div>
          </div>
          {providers.map((provider) => (
            <Link
              key={provider.slug}
              href={`/providers/${provider.slug}`}
              className="grid grid-cols-12 px-5 py-4 items-center border-b last:border-0 hover:bg-white/[0.02] transition-colors group"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="col-span-4 min-w-0 pr-3">
                <div className="font-medium group-hover:text-blue-400 transition-colors truncate">{provider.name}</div>
                <div className="text-xs mt-0.5 truncate line-clamp-1" style={{ color: "var(--text-muted)" }}>
                  {provider.description}
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${provider.status === "Operational" ? "bg-green-400" : provider.status === "Degraded" ? "bg-yellow-400" : "bg-red-400"}`} />
                  <span className={`text-xs ${statusColors[provider.status] ?? "text-zinc-400"}`}>{provider.status}</span>
                </div>
              </div>
              <div className="col-span-2 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                {provider.avgLatencyMs}ms
              </div>
              <div className="col-span-2 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                {provider.avgThroughputTps} tok/s
              </div>
              <div className="col-span-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                {provider.modelsCount} models
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
