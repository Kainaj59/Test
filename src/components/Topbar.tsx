import { Bell } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";

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

      <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted hover:text-foreground">
        <Bell size={18} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
      </button>

      <div className="flex items-center gap-3">
        <div className="brand-gradient grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white">
          MJ
        </div>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-medium">Matt Janiak</p>
          <p className="text-xs text-muted">Studio Nexora</p>
        </div>
      </div>
    </header>
  );
}
