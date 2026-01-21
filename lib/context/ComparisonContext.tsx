'use client';

import React, { createContext, useContext, useState } from 'react';
import type { ScoredProduct } from '@/lib/types';

interface ComparisonContextType {
  products: ScoredProduct[];
  addToComparison: (product: ScoredProduct) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean;
  maxProducts: number;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);
const MAX_COMPARISON_PRODUCTS = 3;

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ScoredProduct[]>([]);

  const addToComparison = (product: ScoredProduct): boolean => {
    if (products.length >= MAX_COMPARISON_PRODUCTS) {
      return false;
    }
    if (products.some((p) => p.id === product.id)) {
      return false;
    }
    setProducts((prev) => [...prev, product]);
    return true;
  };

  const removeFromComparison = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setProducts([]);
  };

  const isInComparison = (productId: string): boolean => {
    return products.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        products,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddMore: products.length < MAX_COMPARISON_PRODUCTS,
        maxProducts: MAX_COMPARISON_PRODUCTS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
