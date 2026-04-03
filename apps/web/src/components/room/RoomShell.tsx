export function RoomShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-transparent px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] flex-col rounded-[28px] border border-white/10 bg-[var(--panel)] backdrop-blur-xl md:min-h-[calc(100vh-3rem)]">
        {children}
      </div>
    </main>
  );
}
