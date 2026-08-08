import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display face — geometric, technical; used with restraint on headings.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Data face — every metric, score, and axis renders in tabular mono.
const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zk-explorx.vercel.app"),
  title: {
    default: "ZK-explorX — The Zero-Knowledge Ecosystem Explorer",
    template: "%s · ZK-explorX",
  },
  description:
    "Explore, compare, and understand the Zero-Knowledge ecosystem by developer health — live GitHub activity, health scores, and curated protocol research.",
  keywords: [
    "zero knowledge",
    "ZK",
    "zkEVM",
    "zkVM",
    "rollup",
    "Ethereum L2",
    "developer activity",
  ],
  openGraph: {
    title: "ZK-explorX — The Zero-Knowledge Ecosystem Explorer",
    description:
      "Explore the Zero-Knowledge ecosystem by developer health, not token price.",
    type: "website",
    siteName: "ZK-explorX",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
