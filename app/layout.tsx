import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Energyfox Solar Quiz",
  description: "Answer 5 quick solar questions and win up to 15% off your Energyfox solar system.",
};

export const viewport: Viewport = {
  themeColor: "#090f24",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${poppins.variable} h-full bg-navy-950 antialiased`}>
      <body className="min-h-full bg-navy-950">{children}</body>
    </html>
  );
}
