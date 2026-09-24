import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './global.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'INTEL | Global Intelligence',
  description: 'Personal intelligence dashboard for global markets, tech, and startups.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen selection:bg-[#065F46] selection:text-white transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
