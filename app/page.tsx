import { Chat } from "../components/chat/chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-4xl h-[calc(100vh-2rem)] bg-card rounded-lg shadow-lg overflow-hidden">
        <Chat />
      </div>
    </main>
  );
} 