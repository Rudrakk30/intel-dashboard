import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './global.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'INTEL | Global Intelligence',
  description: 'Personal global intelligence dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
