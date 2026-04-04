import type { Metadata, Viewport } from 'next';
import './globals.css';
import AIChatbot from '@/app/components/AIChatbot';
import Providers from '@/app/components/Providers';

export const metadata: Metadata = {
  title: 'tMIC',
  description: 'Market Intelligence Center — Earnings Calendar & Financial Data',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
