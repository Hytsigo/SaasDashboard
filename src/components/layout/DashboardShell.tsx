import Link from "next/link";
import { Menu } from "lucide-react";

import { LogoutButton } from "@/components/layout/LogoutButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-3 sm:px-4">
          <p className="text-sm font-semibold sm:text-base">SaaS Dashboard</p>
          <div className="hidden items-center gap-4 md:flex">
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

          <div className="flex items-center gap-2 md:hidden">
            <LogoutButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-xs">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 grid gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}
