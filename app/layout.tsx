import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/shared/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UL Frankenstein',
  description: 'Next.js application with Auth0 Universal Login',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}