import { Bell, Settings } from "lucide-react";

export default function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container border-b-4 border-primary-container flex items-center justify-between px-6 z-50 shadow-md">
      <div className="text-primary font-headline text-2xl font-black italic uppercase tracking-tighter">
        QuizBattle
      </div>

      <nav className="hidden md:flex gap-8">
        <a
          href="#"
          className="font-bold text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          Live Battles
        </a>
        <a
          href="#"
          className="font-bold text-sm text-primary border-b-4 border-secondary-container pb-1"
        >
          Library
        </a>
        <a
          href="#"
          className="font-bold text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          Reports
        </a>
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-bright rounded-full transition-all">
          <Bell size={20} />
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-bright rounded-full transition-all">
          <Settings size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary-container border-2 border-primary overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            alt="User"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
