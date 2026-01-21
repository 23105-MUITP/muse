'use client';

import { Button } from '@/components/ui/button';
import { Utensils, Shirt } from 'lucide-react';

interface WelcomeMessageProps {
  onSampleQuery: (query: string) => void;
}

const sampleQueries = [
  {
    icon: Utensils,
    query: 'Vegan snacks under ₹300',
    category: 'food',
  },
  {
    icon: Shirt,
    query: 'Light ethnic wear for summer',
    category: 'fashion',
  },
  {
    icon: Utensils,
    query: 'Protein-rich breakfast options',
    category: 'food',
  },
  {
    icon: Shirt,
    query: 'Casual wear under ₹1000',
    category: 'fashion',
  },
];

export function WelcomeMessage({ onSampleQuery }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      <img src="/lumin.png" alt="lumin logo" className="w-16 h-16 object-contain mb-4" />
      <h1 className="text-2xl font-bold mb-8">lumin</h1>

      <div className="w-full max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleQueries.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-3 px-4 text-left"
              onClick={() => onSampleQuery(item.query)}
            >
              <item.icon className="w-4 h-4 mr-2 shrink-0 text-primary" />
              <span className="text-sm">{item.query}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
