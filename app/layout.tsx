import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/context/CartContext';
import { ComparisonProvider } from '@/lib/context/ComparisonContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'lumin.ai',
  description: 'AI-powered shopping assistant for Indian D2C food and fashion products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ComparisonProvider>
            {children}
          </ComparisonProvider>
        </CartProvider>
      </body>
    </html>
  );
}
