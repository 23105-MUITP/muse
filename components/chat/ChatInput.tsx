'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  isLoading,
  voiceEnabled,
  onVoiceEnabledChange,
  placeholder = 'Ask Muse anything about what you want to buy…',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, isTranscribing, error, start, stop, setError } =
    useVoiceRecorder();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = async () => {
    setError(null);
    if (isRecording) {
      const text = await stop();
      if (text) {
        onVoiceEnabledChange(true);
        onSubmit(text);
      }
      return;
    }

    try {
      await start();
      onVoiceEnabledChange(true);
    } catch {
      setError('Microphone permission is needed for voice mode.');
    }
  };

  const busy = isLoading || isTranscribing;

  return (
    <form onSubmit={handleSubmit} className="relative px-4 pb-5 pt-2">
      <div
        className={cn(
          'muse-composer rounded-[17px] border bg-white px-4 pb-3 pt-3.5 paper-shadow transition-shadow',
          isRecording ? 'border-primary' : 'border-[#e7e2eb]'
        )}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="chat-input"
          placeholder={
            isRecording
              ? 'Listening… tap the square when you are done'
              : isTranscribing
              ? 'Hearing that…'
              : placeholder
          }
          disabled={busy || isRecording}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent text-sm leading-relaxed',
            'focus-visible:outline-none placeholder:text-[#aaa6ad]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[42px] max-h-[120px]'
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={busy}
              data-testid="voice-mic"
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] transition-colors',
                isRecording
                  ? 'border-primary bg-accent text-primary'
                  : 'border-[#e8e3ec] text-[#817a8a] hover:bg-secondary'
              )}
              aria-label={isRecording ? 'Stop listening' : 'Start voice mode'}
            >
              {isTranscribing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isRecording ? (
                <Square className="h-3 w-3 fill-current" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
              Voice
            </button>
            <button
              type="button"
              onClick={() => onVoiceEnabledChange(!voiceEnabled)}
              data-testid="voice-speaker"
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] transition-colors',
                voiceEnabled
                  ? 'border-[#cfc1fa] bg-[#f7f3ff] text-[#7859d3]'
                  : 'border-[#e8e3ec] text-[#817a8a] hover:bg-secondary'
              )}
              aria-label={voiceEnabled ? 'Mute spoken replies' : 'Speak replies'}
            >
              {voiceEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              Speak
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || busy || isRecording}
            className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-[#a184ed] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-destructive">{error}</p>
      )}
    </form>
  );
}
