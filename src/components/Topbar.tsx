import { Bell } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";
import { TopbarUser } from "./TopbarUser";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-5 py-4 backdrop-blur lg:px-8">
      <MobileNav />

      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight lg:text-xl">
          {title}
        </h1>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="ml-auto">
        <GlobalSearch />
      </div>

      <button
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted hover:text-foreground"
      >
        <Bell size={18} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
      </button>

      <TopbarUser />
    </header>
  );
}
