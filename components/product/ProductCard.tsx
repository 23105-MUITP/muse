'use client';

import { ProductImage } from './ProductImage';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './ConfidenceBadge';
import { formatPrice } from '@/lib/utils';
import { Check, ChevronDown, GitCompare, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useComparison } from '@/lib/context/ComparisonContext';
import { useState } from 'react';
import type { ScoredProduct } from '@/lib/types';

interface ProductCardProps {
  product: ScoredProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();
  const [whyOpen, setWhyOpen] = useState(false);

  const inCart = isInCart(product.id);
  const inComparison = isInComparison(product.id);

  const handleComparisonClick = () => {
    if (inComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  return (
    <article
      className="muse-reveal flex flex-col overflow-hidden rounded-[20px] border border-[#ebe7ef] bg-white paper-shadow transition-transform duration-200 hover:-translate-y-0.5"
      data-testid="product-card"
      data-product-id={product.id}
      data-product-name={product.name}
      data-product-price={String(product.price)}
      data-product-category={product.category}
    >
      <div className="relative aspect-[4/5] bg-muted">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <ConfidenceBadge score={product.matchScore} />
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="mt-1 text-[17px] font-medium leading-tight tracking-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          {formatPrice(product.price)}
        </p>

        {product.tags.length > 0 && (
          <p className="mt-2 text-[12px] text-[#8c8790]">
            {product.tags.slice(0, 3).join(' · ')}
          </p>
        )}

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {product.matchReasons.length > 0 && (
          <button
            type="button"
            onClick={() => setWhyOpen((open) => !open)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#775bd0]"
          >
            Why this?
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${whyOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {whyOpen && product.matchReasons.length > 0 && (
          <div className="mt-3 rounded-2xl bg-[#f7f3ff] px-3.5 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7355ca]">
              Why Muse picked this
            </p>
            <ul className="space-y-1.5">
              {product.matchReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-[12px] text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7355ca]" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex gap-2 pt-1">
          <Button
            variant={inCart ? 'secondary' : 'default'}
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => addItem(product)}
          >
            {inCart ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="mr-1 h-4 w-4" />
                Add
              </>
            )}
          </Button>
          <Button
            variant={inComparison ? 'secondary' : 'outline'}
            size="icon"
            className="rounded-full"
            disabled={!inComparison && !canAddMore}
            onClick={handleComparisonClick}
            title={
              inComparison
                ? 'Remove from comparison'
                : canAddMore
                ? 'Add to comparison'
                : 'Comparison is full (max 3)'
            }
          >
            {inComparison ? (
              <Check className="h-4 w-4" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
