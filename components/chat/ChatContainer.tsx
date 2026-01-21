'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useMemo } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeMessage } from './WelcomeMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ComparisonTable } from '@/components/product/ComparisonTable';
import { AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useComparison } from '@/lib/context/ComparisonContext';
import type { ScoredProduct, Product } from '@/lib/types';

interface StreamDataItem {
  products?: ScoredProduct[];
  action?: 'add_to_cart' | 'view_cart' | 'remove_from_cart' | 'compare';
  product?: Product;
}

export function ChatContainer() {
  const { messages, isLoading, error, append, data } = useChat({
    api: '/api/chat',
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addToComparison, products: comparisonProducts } = useComparison();
  const processedActionsRef = useRef<Set<string>>(new Set());

  // Extract products and handle actions from stream data
  const { products, lastAction } = useMemo(() => {
    if (!data || data.length === 0) return { products: [], lastAction: null };

    let foundProducts: ScoredProduct[] = [];
    let foundAction: StreamDataItem | null = null;

    // Process all data items
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i] as StreamDataItem;
      if (item?.products && foundProducts.length === 0) {
        foundProducts = item.products;
      }
      if (item?.action && !foundAction) {
        foundAction = item;
      }
    }

    return { products: foundProducts, lastAction: foundAction };
  }, [data]);

  // Handle cart actions from stream data
  useEffect(() => {
    if (lastAction?.action === 'add_to_cart' && lastAction.product) {
      const actionKey = `add_${lastAction.product.id}_${Date.now()}`;
      if (!processedActionsRef.current.has(actionKey)) {
        processedActionsRef.current.add(actionKey);
        addItem(lastAction.product);
      }
    }
    if (lastAction?.action === 'compare' && lastAction.products) {
      lastAction.products.forEach((p: ScoredProduct) => {
        addToComparison(p);
      });
    }
  }, [lastAction, addItem, addToComparison]);

  // Clear processed actions when starting a new conversation
  useEffect(() => {
    if (messages.length === 0) {
      processedActionsRef.current.clear();
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, products, comparisonProducts]);

  const handleSampleQuery = (query: string) => {
    append({ role: 'user', content: query });
  };

  const handleFormSubmit = (message: string) => {
    append({ role: 'user', content: message });
  };

  // Check if the last assistant message should show products
  const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');
  const showProducts = products.length > 0 && lastAssistantIndex === messages.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage onSampleQuery={handleSampleQuery} />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <ChatMessage
                    role={message.role as 'user' | 'assistant'}
                    content={message.content}
                    isStreaming={
                      isLoading &&
                      index === messages.length - 1 &&
                      message.role === 'assistant'
                    }
                  />
                  {/* Show products after the last assistant message */}
                  {message.role === 'assistant' &&
                    index === lastAssistantIndex &&
                    showProducts &&
                    !isLoading && (
                      <div className="ml-11 mt-4">
                        <ProductGrid products={products} />
                      </div>
                    )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full typing-dot" />
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full typing-dot" />
                      <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">
                    Sorry, something went wrong. Please try again.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Comparison table - always visible when products are being compared */}
          {comparisonProducts.length > 0 && <ComparisonTable />}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
