import {
  LayoutDashboard,
  Bot,
  Users,
  MessagesSquare,
  FileText,
  Plug,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Agents IA", icon: Bot },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/dashboard/content", label: "Contenus", icon: FileText },
  { href: "/dashboard/integrations", label: "Intégrations", icon: Plug },
  { href: "/dashboard/settings", label: "Réglages", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
