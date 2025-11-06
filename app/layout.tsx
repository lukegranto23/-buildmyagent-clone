import type { Metadata } from "next";
import "./globals.css";
import "reactflow/dist/style.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Main Street Agent Lab by BuildMyAgent",
  description: "Package AI agents and analog sales kits for legacy, boomer-run businesses in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

