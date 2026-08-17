'use client';

import { ProductCard } from './ProductCard';
import type { ScoredProduct } from '@/lib/types';

interface ProductGridProps {
  products: ScoredProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
