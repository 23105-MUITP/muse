import { ChatContainer } from '@/components/chat/ChatContainer';
import { CheckoutSheet } from '@/components/checkout/CheckoutSheet';

export default function Home() {
  return (
    <main className="relative flex h-screen overflow-hidden muse-stage">
      <ChatContainer />
      <CheckoutSheet />
    </main>
  );
}
