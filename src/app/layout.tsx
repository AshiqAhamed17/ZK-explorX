import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
