import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather App",
  description: "Погодное приложение для Омска и области",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}