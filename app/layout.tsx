import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import AIChatbot from '@/app/components/AIChatbot';
import Providers from '@/app/components/Providers';

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
      <body>
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
