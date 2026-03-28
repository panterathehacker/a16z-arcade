import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "a16z Arcade",
  description: "A Pokémon Diamond/Pearl style RPG featuring a16z podcast guests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
