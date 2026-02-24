import Link from "next/link";

import { LogoutButton } from "@/components/layout/LogoutButton";

type DashboardShellProps = Readonly<{
  children: React.ReactNode;
}>;

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/leads", label: "Leads" },
  { href: "/settings/organization", label: "Organization" },
  { href: "/settings/members", label: "Members" },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <p className="text-sm font-semibold">SaaS Dashboard</p>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
