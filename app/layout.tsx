import type { Metadata } from "next";
import "./globals.css";
import "./prototype.css";
import "./prototype-06.css";

export const metadata: Metadata = {
  title: "Travel Book Prototype",
  description: "A playful collaborative travel planner prototype"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}