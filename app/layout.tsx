import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/context/CartContext';
import { ComparisonProvider } from '@/lib/context/ComparisonContext';
import { OrderProvider } from '@/lib/context/OrderContext';
import { ShopUiProvider } from '@/lib/context/ShopUiContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Muse — personal commerce AI',
  description:
    'A conversational shopping assistant for Indian D2C food and fashion. Tell Muse what you want.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>
        <ShopUiProvider>
          <CartProvider>
            <OrderProvider>
              <ComparisonProvider>{children}</ComparisonProvider>
            </OrderProvider>
          </CartProvider>
        </ShopUiProvider>
      </body>
    </html>
  );
}
