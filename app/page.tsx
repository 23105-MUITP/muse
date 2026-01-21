import { ChatContainer } from '@/components/chat/ChatContainer';
import { CartSheet } from '@/components/cart/CartSheet';

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/lumin.png"
              alt="lumin logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-semibold text-lg">lumin</span>
          </div>
          <div className="flex items-center gap-3">
            <CartSheet />
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </main>
  );
}
