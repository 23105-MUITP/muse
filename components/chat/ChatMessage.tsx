'use client';

import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/brand/BrandMark';
import { useMemo } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function formatContent(content: string): string {
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const formattedContent = useMemo(() => formatContent(content), [content]);
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <div className="mt-0.5 flex-shrink-0">
          <BrandMark size={28} />
        </div>
      )}

      <div className={cn('min-w-0 flex-1', isUser ? 'text-right' : 'text-left')}>
        {isUser ? (
          <div className="ml-auto inline-block max-w-[85%] rounded-[18px] rounded-tr-md bg-[#19171d] px-4 py-3 text-left text-white">
            <div
              className="text-sm leading-relaxed [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        ) : (
          <div className="max-w-[min(100%,42rem)] pt-0.5 text-left">
            <p className="mb-1.5 text-[11px] font-medium text-[#8b6de2]">Muse</p>
            <div
              className="text-sm leading-relaxed text-foreground [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            {isStreaming && (
              <span className="ml-1 inline-flex align-middle">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                <span className="typing-dot ml-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                <span className="typing-dot ml-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
