import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'tMIC',
  description: 'Market Intelligence Center — Earnings Calendar & Financial Data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
