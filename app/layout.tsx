import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline — communities, people and plans",
  description: "A social network for visual stories, useful discussions, local meetups and meaningful connections.",
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
      <body style={{ "--font-body": "Inter, ui-sans-serif, system-ui, sans-serif", "--font-display": "Iowan Old Style, Baskerville, Georgia, serif" } as React.CSSProperties}>{children}</body>
    </html>
  );
}
