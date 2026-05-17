import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const newRodin = localFont({
  src: "../public/FOT-NewRodin Pro EB.otf",
  weight: "400",
  variable: "--font-wii",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newRodin.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
