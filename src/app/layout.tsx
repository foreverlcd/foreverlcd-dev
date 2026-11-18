import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: "700",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "foreverlcd.dev",
    template: "%s — foreverlcd.dev",
  },
  description: "Portfolio profesional de desarrollo de software.",
  applicationName: "foreverlcd.dev",
  metadataBase: getSiteUrl(),
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "foreverlcd.dev",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${unbounded.variable} ${geist.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-surface text-fg antialiased">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <div id="contenido" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
