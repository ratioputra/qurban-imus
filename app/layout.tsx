import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Qurban Imus",
  description: "Aplikasi Manajemen Qurban",
};

// Root layout — hanya shell HTML, tanpa Sidebar.
// Sidebar ditambahkan di app/(app)/layout.tsx agar halaman /login bebas dari Sidebar.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
