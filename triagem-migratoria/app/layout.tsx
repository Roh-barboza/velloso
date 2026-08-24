import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triagem Migratória Velloso",
  description: "Sistema interno de triagem para identificar caminhos de residência e trabalho na Itália.",
  metadataBase: new URL("https://triagem-migratoria-velloso.vercel.app"),
  openGraph: {
    title: "Triagem Migratória Velloso",
    description: "Caminhos para viver e trabalhar na Itália.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Triagem Migratória Velloso" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Triagem Migratória Velloso",
    description: "Caminhos para viver e trabalhar na Itália.",
    images: ["/og.png"],
  },
  icons: { icon: "/logo-velloso.png", shortcut: "/logo-velloso.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
