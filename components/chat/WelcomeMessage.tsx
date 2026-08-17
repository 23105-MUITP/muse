'use client';

import { Shirt, Sparkles, UtensilsCrossed, Coffee } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { usePreferences } from '@/hooks/usePreferences';

interface WelcomeMessageProps {
  onSampleQuery: (query: string) => void;
}

const sampleQueries = [
  {
    icon: UtensilsCrossed,
    query: 'Vegan snacks under ₹300',
    label: 'Find my perfect snack',
  },
  {
    icon: Shirt,
    query: 'Light ethnic wear for summer',
    label: 'Build a summer look',
  },
  {
    icon: Coffee,
    query: 'Protein-rich breakfast options',
    label: 'Start the morning well',
  },
  {
    icon: Sparkles,
    query: 'Casual wear under ₹1000',
    label: 'Shop by occasion',
  },
];

export function WelcomeMessage({ onSampleQuery }: WelcomeMessageProps) {
  const { preferences } = usePreferences();
  const firstName = preferences.shipping?.fullName?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col items-center px-2 text-center animate-rise-in">
      <BrandMark size={74} pulse className="mb-1" />

      <h1 className="mt-6 text-[34px] font-medium leading-[1.15] tracking-[-0.04em]">
        <span className="text-[#a184eb]">Hello{firstName ? `, ${firstName}` : ''}</span>
        <br />
        What can I find for you?
      </h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[#8c8790]">
        Tell me naturally. I&apos;ll handle the filtering, matching and reasoning.
      </p>

      <p className="mt-8 w-full max-w-[800px] text-left text-[11px] text-[#777]">
        <span className="mr-1 text-primary">✦</span>
        <span className="font-medium text-[#59535f]">Suggested prompts</span>
      </p>
      <div className="mt-3 grid w-full max-w-[800px] grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {sampleQueries.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => onSampleQuery(item.query)}
            className="group rounded-[13px] border border-[#ebe7ef] bg-white px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#cfc1fa] paper-shadow"
          >
            <item.icon className="mb-3 h-4 w-4 text-[#8b6de2]" />
            <span className="block text-[13px] font-medium">{item.label}</span>
            <span className="mt-1 block text-[12px] leading-relaxed text-[#8c8790]">
              “{item.query}”
            </span>
            <span className="mt-3 block text-[11px] font-semibold text-[#775bd0] group-hover:underline">
              Try it →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
