'use client';

import Image from 'next/image';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">About</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 2rem' }}>
              About tMIC
            </h1>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: 720,
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 480,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                }}
              >
                <Image
                  src="/lego/images/yep.jpg"
                  alt="tMIC"
                  width={1080}
                  height={1080}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  priority
                />
              </div>

              <p
                style={{
                  marginTop: '2rem',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: 'var(--text-secondary, #555)',
                  textAlign: 'center',
                }}
              >
		 YEP king      	
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
