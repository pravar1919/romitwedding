import type { Metadata, Viewport } from "next";
import { CONFIG } from "@/lib/config";
import { shareDescription, shareImage, shareTitle } from "@/lib/share";
import "./globals.css";

const title = `${CONFIG.couple.a} & ${CONFIG.couple.b} · Wedding Invitation · ${CONFIG.hashtag}`;
const description = `Wedding invitation: you're invited to the wedding of ${CONFIG.couple.a} & ${CONFIG.couple.b} · 29–30 November 2026 · ${CONFIG.city}`;

export const metadata: Metadata = {
  metadataBase: new URL(CONFIG.siteUrl),
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/favicon-180.png",
  },
  openGraph: {
    type: "website",
    siteName: `${CONFIG.couple.a} & ${CONFIG.couple.b}`,
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images: [shareImage.url] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#33040C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the invitation overlay is shown without a flash of the page behind it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js','intro-open')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Great+Vibes&family=Pinyon+Script&family=Tiro+Devanagari+Hindi&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
