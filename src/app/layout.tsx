import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const luckiestGuy = localFont({
  src: "../shared/brand-fonts/LuckiestGuy-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});

const bubblegumSans = localFont({
  src: "../shared/brand-fonts/BubblegumSans-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
});

const nunito = localFont({
  src: [
    {
      path: "../shared/brand-fonts/Nunito-latin-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../shared/brand-fonts/Nunito-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../shared/brand-fonts/Nunito-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../shared/brand-fonts/JetBrainsMono-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Boba Bear",
    template: "%s · Boba Bear",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1A2210",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${luckiestGuy.variable} ${bubblegumSans.variable} ${nunito.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="font-body antialiased min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:font-body focus:font-bold focus:bg-[var(--interactive-primary)] focus:text-[#1F2C08] focus:shadow-lg focus-ring"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
