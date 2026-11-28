# Sinergo · Modul Magang dan MBKM (SI RPL UPI)

Aplikasi web manajemen program Magang Industri, Studi Independen, dan kegiatan MBKM untuk Program Studi Rekayasa Perangkat Lunak (RPL) Universitas Pendidikan Indonesia Kampus Cibiru, terintegrasi dengan autentikasi terpusat **SSO SACIBIRU**.

## Tech Stack Utama

- **Framework**: Next.js 16 (App Router, TypeScript strict, proteksi rute via `proxy.ts`)
- **UI & Styling**: Tailwind CSS, HeroUI, Lucide Icons, Google Fonts (`Lexend` & `Plus Jakarta Sans`)
- **State & Data Fetching**: TanStack Query, Axios (`libs/axios.ts`), Zustand (`stores/`)
- **Form & Validasi**: React Hook Form + Zod
- **Autentikasi**: NextAuth.js (`libs/auth.ts`) dengan Custom OAuth 2.0 Provider SSO SACIBIRU (`PKCE S256` + verifikasi JWT `RS256` via JWKS)
- **ORM & Database**: Prisma ORM (`libs/prisma.ts`) dengan MySQL di Aiven (SSL)

## Persiapan Lingkungan Lokal

1. Salin berkas variabel lingkungan dan lengkapi kredensial Aiven MySQL serta SSO SACIBIRU:
   ```bash
   cp .env.example .env
   ```
2. Instal seluruh dependency dan generate Prisma Client:
   ```bash
   npm install
   npx prisma generate
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

## Skrip Kualitas Kode

- `npm run typecheck` : Pemeriksaan tipe TypeScript (`tsc --noEmit`)
- `npm run lint` : Pemeriksaan kode dengan ESLint
- `npm run build` : Generate Prisma Client dan kompilasi produksi Next.js
