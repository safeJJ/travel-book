import type { Metadata } from "next";
import "./globals.css";
import "./prototype.css";
import ConfirmedDateBridge from "./confirmed-date-bridge";

export const metadata: Metadata = {
  title: "Travel Book Prototype",
  description: "A playful collaborative travel planner prototype"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        {children}
        <ConfirmedDateBridge />
      </body>
    </html>
  );
}