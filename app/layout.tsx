import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizBattle",
  description: "Nền tảng thi trắc nghiệm Real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
