'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { useMemo } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Simple markdown-like formatting
function formatContent(content: string): string {
  return content
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Line breaks
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
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex-1',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-none px-4 py-2 max-w-[85%]',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <div
            className="text-sm prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
          {isStreaming && (
            <span className="inline-flex ml-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-current rounded-full typing-dot ml-1" />
              <span className="w-1.5 h-1.5 bg-current rounded-full typing-dot ml-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
