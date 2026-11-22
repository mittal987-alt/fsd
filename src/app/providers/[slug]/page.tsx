import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStore } from "@/lib/data-store";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = await DataStore.getProviderBySlug(slug);
  if (!provider) return { title: "Not Found" };
  return { title: provider.name, description: provider.description };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { slug } = await params;
  const provider = await DataStore.getProviderBySlug(slug);
  if (!provider) notFound();

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
          <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{provider.name}</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{provider.name}</h1>
            <span className="flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${provider.status === "Operational" ? "bg-green-400" : "bg-yellow-400"}`} />
              <span className={provider.status === "Operational" ? "text-green-400" : "text-yellow-400"}>{provider.status}</span>
            </span>
          </div>
          <p className="text-sm max-w-2xl leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>{provider.description}</p>
          <div className="flex flex-wrap items-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>⚡ {provider.avgLatencyMs}ms avg latency</span>
            <span>🚀 {provider.avgThroughputTps} tok/s throughput</span>
            {provider.websiteUrl && (
              <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                ↗ Website
              </a>
            )}
            {provider.apiDocsUrl && (
              <a href={provider.apiDocsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                📄 API Docs
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Models on {provider.name}</h2>
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-medium border-b"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
              <div className="col-span-5">Model</div>
              <div className="col-span-2 text-right">In /1M</div>
              <div className="col-span-2 text-right">Out /1M</div>
              <div className="col-span-1 text-right">P50</div>
              <div className="col-span-2 text-right">Throughput</div>
            </div>
            {provider.offerings.map(({ model, offering }) => (
              <Link
                key={model.slug}
                href={`/models/${model.slug}`}
                className="grid grid-cols-12 px-5 py-4 items-center border-b last:border-0 hover:bg-white/[0.02] transition-colors group"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="col-span-5 min-w-0 pr-3">
                  <div className="font-medium group-hover:text-blue-400 transition-colors truncate">{model.name}</div>
                  <div className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
                    {offering.providerModelId}
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                  ${offering.inputPricePerMillion}
                </div>
                <div className="col-span-2 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                  ${offering.outputPricePerMillion}
                </div>
                <div className="col-span-1 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {offering.latencyP50Ms}ms
                </div>
                <div className="col-span-2 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {offering.throughputTps} t/s
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
