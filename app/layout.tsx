import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MD to PDF",
  description: "Convert Markdown to PDF using jsPDF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
