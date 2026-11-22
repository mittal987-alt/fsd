import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "OneAtlas — AI Model Intelligence", template: "%s | OneAtlas" },
  description:
    "Discover, compare, and evaluate AI models across providers. Real pricing, benchmarks, and provider infrastructure data for developers and AI engineers.",
  keywords: ["AI models", "LLM comparison", "AI pricing", "benchmarks", "OpenRouter", "Anthropic", "OpenAI"],
  openGraph: {
    title: "OneAtlas — AI Model Discovery & Intelligence",
    description: "The definitive AI model intelligence platform for developers.",
    type: "website",
    siteName: "OneAtlas",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
