import type { Metadata } from "next";
import { Baloo_2, Nunito, Atkinson_Hyperlegible } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Alon | Voice AI Speech Practice",
  description:
    "Child-centered speech practice with instant AI feedback — affordable, accessible, and fun.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${baloo.variable} ${nunito.variable} ${atkinson.variable} antialiased bg-bg text-text`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
