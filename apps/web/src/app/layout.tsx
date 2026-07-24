import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { localeToBcp47, BRAND } from "@os-community/shared";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getBottomNavItems } from "@/components/nav/bottom-nav-config";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { getLocale, getT } from "@/lib/i18n";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const { messages: t } = await getT();
  return {
    title: `${BRAND.name} ${t.brand.community} — ${t.brand.tagline}`,
    description: t.brand.mission,
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const { messages: t } = await getT();
  const htmlLang = localeToBcp47(locale).split("-")[0];

  const bottomNavItems = getBottomNavItems(t);

  return (
    <html lang={htmlLang} className={`${instrumentSans.variable} ${newsreader.variable}`}>
      <body className="has-bottom-nav">
        <AuthSessionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <BottomNav items={bottomNavItems} />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
