import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import SiteFooter from "./components/SiteFooter";
import { META, NAV, PERSON } from "./data/copy";

/* Page titles and description live in app/data/copy.ts under META. */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-jb",
});

export const metadata: Metadata = {
  title: {
    default: META.title,
    template: META.titleTemplate,
  },
  description: META.description,
  keywords: META.keywords,
  authors: [{ name: PERSON.name }],
  creator: PERSON.name,
  openGraph: {
    title: META.title,
    description: META.description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: META.title,
    description: META.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06080b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="skipLink">
          {NAV.skipToContent}
        </a>
        <NavBar />
        <div id="main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
