import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="max-w-2xl mx-auto pb-nav animate-fade-in">{children}</div>
      <BottomNav />
    </>
  );
}
