'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/context/CartContext';
import { useOrders } from '@/lib/context/OrderContext';
import { usePreferences } from '@/hooks/usePreferences';

interface TasteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TasteSheet({ open, onOpenChange }: TasteSheetProps) {
  const { state } = useCart();
  const { orders } = useOrders();
  const { preferences } = usePreferences();

  const diet = new Set<string>();
  const interests = new Set<string>();

  for (const item of state.items) {
    item.tags.slice(0, 3).forEach((tag) => interests.add(tag));
    if (item.dietary?.isVegan) diet.add('Vegan');
    if (item.dietary?.isVegetarian) diet.add('Vegetarian');
    if (item.dietary?.isProteinRich) diet.add('High protein');
    if (item.dietary?.isGlutenFree) diet.add('Gluten-free');
    if (item.style?.type) interests.add(item.style.type);
  }

  const location = preferences.shipping
    ? [preferences.shipping.city, preferences.shipping.state].filter(Boolean).join(', ')
    : '';

  const hasAnything =
    diet.size > 0 ||
    interests.size > 0 ||
    Boolean(location) ||
    orders.length > 0 ||
    state.items.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col rounded-l-3xl border-l-border/70 bg-card">
        <SheetHeader>
          <SheetTitle className="text-2xl tracking-tight">Your taste</SheetTitle>
          <SheetDescription>
            What Muse already knows from this device — bag, orders, and delivery details.
          </SheetDescription>
        </SheetHeader>

        {!hasAnything ? (
          <div className="flex flex-1 items-center justify-center px-4 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              As you chat and shop, Muse will keep a quiet record of what you like. Nothing is
              invented until you leave a signal.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {diet.size > 0 && (
              <section>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Diet
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(diet).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {interests.size > 0 && (
              <section>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(interests).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {location && (
              <section>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Delivery
                </p>
                <p className="text-sm">{preferences.shipping?.fullName}</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </section>
            )}

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Activity
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-3">
                  <p className="text-lg font-semibold tracking-tight">{state.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Saved in bag</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-3">
                  <p className="text-lg font-semibold tracking-tight">{orders.length}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
