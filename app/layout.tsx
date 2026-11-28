import type { Metadata } from "next";
import { Lexend, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SI RPL UPI · Portal Magang dan MBKM",
  description:
    "Sistem Informasi Program Penguatan Pengalaman Profesional Non Kependidikan (Magang dan MBKM) Program Studi Rekayasa Perangkat Lunak UPI Kampus Cibiru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${lexend.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-dvh bg-brand-canvas font-sans text-brand-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
