'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useMemo, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeMessage } from './WelcomeMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ComparisonTable } from '@/components/product/ComparisonTable';
import { AlertCircle, Menu } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useComparison } from '@/lib/context/ComparisonContext';
import { useShopUi } from '@/lib/context/ShopUiContext';
import { BrandMark } from '@/components/brand/BrandMark';
import { useVoicePlayback } from '@/hooks/useVoicePlayback';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CartSheet } from '@/components/cart/CartSheet';
import { OrdersSheet } from '@/components/orders/OrdersSheet';
import { TasteSheet } from '@/components/taste/TasteSheet';
import type { ScoredProduct, Product } from '@/lib/types';

interface StreamDataItem {
  products?: ScoredProduct[];
  action?: 'add_to_cart' | 'view_cart' | 'remove_from_cart' | 'compare' | 'open_checkout' | 'view_orders';
  product?: Product;
}

export function ChatContainer() {
  const [sessionId, setSessionId] = useState(0);

  return (
    <ChatWorkspace
      key={sessionId}
      onNewConversation={() => setSessionId((id) => id + 1)}
    />
  );
}

function ChatWorkspace({ onNewConversation }: { onNewConversation: () => void }) {
  const { messages, isLoading, error, append, data } = useChat({
    api: '/api/chat',
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addToComparison, products: comparisonProducts } = useComparison();
  const { setCartOpen, openCheckout, openOrders } = useShopUi();
  const processedActionsRef = useRef<Set<string>>(new Set());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const spokenMessageIdRef = useRef<string | null>(null);
  const { speak, stop: stopSpeaking } = useVoicePlayback();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasteOpen, setTasteOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const { products, lastAction } = useMemo(() => {
    if (!data || data.length === 0) return { products: [], lastAction: null };

    let foundProducts: ScoredProduct[] = [];
    let foundAction: StreamDataItem | null = null;

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

  useEffect(() => {
    if (!lastAction?.action) return;
    const actionKey = `${lastAction.action}_${lastAction.product?.id || ''}_${messages.length}`;
    if (processedActionsRef.current.has(actionKey)) return;
    processedActionsRef.current.add(actionKey);

    if (lastAction.action === 'add_to_cart' && lastAction.product) {
      addItem(lastAction.product);
    }
    if (lastAction.action === 'compare' && lastAction.products) {
      lastAction.products.forEach((p: ScoredProduct) => {
        addToComparison(p);
      });
    }
    if (lastAction.action === 'view_cart') {
      setCartOpen(true);
    }
    if (lastAction.action === 'open_checkout') {
      openCheckout();
    }
    if (lastAction.action === 'view_orders') {
      openOrders();
    }
  }, [lastAction, addItem, addToComparison, messages.length, setCartOpen, openCheckout, openOrders]);

  useEffect(() => {
    if (messages.length === 0) {
      processedActionsRef.current.clear();
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, products, comparisonProducts]);

  useEffect(() => {
    if (!voiceEnabled) {
      stopSpeaking();
      return;
    }
    if (isLoading) return;
    const last = messages[messages.length - 1];
    if (
      last?.role === 'assistant' &&
      last.content &&
      last.id !== spokenMessageIdRef.current
    ) {
      spokenMessageIdRef.current = last.id;
      void speak(last.content);
    }
  }, [voiceEnabled, isLoading, messages, speak, stopSpeaking]);

  const handleSampleQuery = (query: string) => {
    append({ role: 'user', content: query });
  };

  const handleFormSubmit = (message: string) => {
    append({ role: 'user', content: message });
  };

  const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');
  const showProducts = products.length > 0 && lastAssistantIndex === messages.length - 1;
  const isHome = messages.length === 0;
  const recentTitles = messages
    .filter((message) => message.role === 'user' && message.content.trim())
    .map((message) => message.content.trim());

  const composer = (
    <ChatInput
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      voiceEnabled={voiceEnabled}
      onVoiceEnabledChange={setVoiceEnabled}
    />
  );

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden">
      <AppSidebar
        recentTitles={recentTitles}
        hasRecommendations={showProducts}
        isHome={isHome}
        search={historySearch}
        onSearchChange={setHistorySearch}
        onNewConversation={onNewConversation}
        onDiscover={onNewConversation}
        onRecommendations={() => {
          document.getElementById('muse-recommendations')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }}
        onSaved={() => setCartOpen(true)}
        onTaste={() => setTasteOpen(true)}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-white/55">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eeeaf0] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e7e2eb] text-[#777] md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <p className="truncate text-[13px] font-semibold">
              muse <span className="font-medium text-[#8e70df]">personal commerce AI</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrdersSheet />
            <CartSheet />
          </div>
        </header>

        {isHome ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col justify-center px-4 py-8">
              <WelcomeMessage onSampleQuery={handleSampleQuery} />
              <div className="mx-auto mt-2 w-full max-w-[800px]">{composer}</div>
              <p className="mt-2 pb-4 text-center text-[11px] text-[#aaa]">
                Muse learns from your conversations — not from endless scrolling.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-4 py-6">
                <div className="space-y-8">
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
                      {message.role === 'assistant' &&
                        index === lastAssistantIndex &&
                        showProducts &&
                        !isLoading && (
                          <div id="muse-recommendations" className="mt-5">
                            <ProductGrid products={products} />
                          </div>
                        )}
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-center gap-3">
                      <BrandMark size={36} pulse />
                      <div>
                        <p className="text-sm text-[#7355ca]">Finding your best matches…</p>
                        <div className="mt-1.5 flex gap-1">
                          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-destructive">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm">
                        Sorry, something went wrong. Please try again.
                      </p>
                    </div>
                  )}
                </div>

                {comparisonProducts.length > 0 && <ComparisonTable />}
              </div>
            </ScrollArea>

            <div className="bg-gradient-to-t from-white via-white/90 to-transparent">
              <div className="mx-auto max-w-3xl">{composer}</div>
            </div>
          </>
        )}
      </div>

      <TasteSheet open={tasteOpen} onOpenChange={setTasteOpen} />
    </div>
  );
}
