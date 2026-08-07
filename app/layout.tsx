import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Book",
  description: "แพลตฟอร์มวางแผนทริปร่วมกับเพื่อนแบบเรียบง่าย"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
