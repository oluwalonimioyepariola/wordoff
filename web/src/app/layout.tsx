import type { Metadata, Viewport } from "next";
import { Ultra, Zilla_Slab } from "next/font/google";
import "./globals.css";

const ultra = Ultra({ weight: "400", subsets: ["latin"], variable: "--font-ultra", display: "swap" });
const zilla = Zilla_Slab({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-zilla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wordoff · A word standoff",
  description:
    "Wordoff is a word game played as a duel. You and a rival chase the same secret word across one saloon table. Free, offline, open source.",
  openGraph: {
    title: "Wordoff · A word standoff",
    description: "One word. Two guns. High noon. A word-game duel against three rivals, free and fully offline.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#24160d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ultra.variable} ${zilla.variable} h-full`}>
      <body className="min-h-full font-sans text-[17px] leading-relaxed">{children}</body>
    </html>
  );
}
