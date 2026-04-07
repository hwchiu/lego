'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import KnowledgeGraph from './KnowledgeGraph';

export default function SupplyChainLanding() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <KnowledgeGraph />
        </main>
      </div>
    </>
  );
}
