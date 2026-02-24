import { DashboardShell } from "@/components/layout/DashboardShell";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
