import type { Metadata } from "next";
import "./globals.css";
import { PageStoreProvider } from "@/lib/pageStore";

export const metadata: Metadata = {
  title: "Zostel Trips",
  description: "Curated travel experiences for the modern explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PageStoreProvider>{children}</PageStoreProvider>
      </body>
    </html>
  );
}
