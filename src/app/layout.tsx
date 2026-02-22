import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ShareScribe – Secure PDF Hosting & QR Generation',
  description:
    'Upload PDFs, generate shareable links, create downloadable QR codes, and track analytics — all in one modern SaaS platform.',
  keywords: ['PDF hosting', 'QR code generator', 'file sharing', 'document management'],
  openGraph: {
    title: 'ShareScribe',
    description: 'Secure PDF hosting and QR generation platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
