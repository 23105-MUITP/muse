'use client';

import type { ReactNode } from 'react';
import { Compass, Heart, Plus, Search, Sparkles, UserRound } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';
import { useOrders } from '@/lib/context/OrderContext';
import { usePreferences } from '@/hooks/usePreferences';

interface AppSidebarProps {
  recentTitles: string[];
  hasRecommendations: boolean;
  isHome: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onNewConversation: () => void;
  onDiscover: () => void;
  onRecommendations: () => void;
  onSaved: () => void;
  onTaste: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({
  recentTitles,
  hasRecommendations,
  isHome,
  search,
  onSearchChange,
  onNewConversation,
  onDiscover,
  onRecommendations,
  onSaved,
  onTaste,
  mobileOpen,
  onClose,
}: AppSidebarProps) {
  const { state } = useCart();
  const { orders } = useOrders();
  const { preferences } = usePreferences();

  const displayName = preferences.shipping?.fullName?.trim() || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const signalCount = state.totalItems + orders.length;

  const filteredRecent = recentTitles.filter((title) =>
    title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const navButton = (
    active: boolean,
    onClick: () => void,
    icon: ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => {
        onClick();
        onClose();
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
        active
          ? 'bg-[#eee8ff] font-medium text-[#7355ca]'
          : 'text-[#66616c] hover:bg-white/80'
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-[#19171d]/20 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[225px] flex-col border-r border-[#ece9ef] bg-[#fafafa] px-3.5 py-5 transition-transform duration-300 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-2.5 pb-5">
          <BrandMark size={22} />
          <p className="text-[19px] font-semibold tracking-tight">
            muse<span className="text-[#9675ed]">.</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onClose();
          }}
          className="mb-3.5 flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#19171d] px-3 py-3 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New conversation
        </button>

        <label className="mb-4 flex h-9 items-center gap-2 rounded-[9px] bg-[#f1eff3] px-3 text-[#aaa]">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your history"
            className="w-full bg-transparent text-[11px] text-foreground placeholder:text-[#aaa] focus-visible:outline-none"
          />
        </label>

        <nav className="grid gap-1">
          {navButton(isHome, onDiscover, <Compass className="h-3.5 w-3.5" />, 'Discover')}
          {navButton(
            hasRecommendations && !isHome,
            onRecommendations,
            <Sparkles className="h-3.5 w-3.5" />,
            'Recommendations'
          )}
          {navButton(false, onSaved, <Heart className="h-3.5 w-3.5" />, 'Saved')}
          {navButton(false, onTaste, <UserRound className="h-3.5 w-3.5" />, 'Taste profile')}
        </nav>

        <p className="mb-1.5 mt-6 px-2.5 text-[8px] uppercase tracking-[1.5px] text-[#aaa]">
          Recent
        </p>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {filteredRecent.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] leading-relaxed text-[#aaa]">
              Conversations you start will appear here.
            </p>
          ) : (
            filteredRecent.map((title, index) => (
              <p
                key={`${index}-${title}`}
                className="truncate rounded-md px-2.5 py-1.5 text-[12px] text-[#77727d]"
                title={title}
              >
                {title}
              </p>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onTaste();
            onClose();
          }}
          className="mt-auto flex items-center gap-2.5 border-t border-[#e9e6eb] px-2 pt-4 text-left"
        >
          <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-gradient-to-br from-[#b49bea] to-[#7e61d1] text-[10px] font-semibold text-white">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-semibold leading-tight">
              {displayName}
            </span>
            <span className="block text-[10px] text-[#aaa]">
              taste profile
              {signalCount > 0 ? ` · ${signalCount} signals` : ''}
            </span>
          </span>
        </button>
      </aside>
    </>
  );
}
