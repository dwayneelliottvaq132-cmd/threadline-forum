import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline — Community conversations",
  description: "Join thoughtful conversations, share stories, and discover your community.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
