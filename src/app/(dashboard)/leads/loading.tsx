import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-80 w-full" />
    </section>
  );
}
