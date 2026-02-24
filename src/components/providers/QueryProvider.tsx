"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

type QueryProviderProps = Readonly<{
  children: React.ReactNode;
}>;

function shouldRetry(failureCount: number, error: Error): boolean {
  const message = error.message.toLowerCase();
  if (message.includes("401") || message.includes("403") || message.includes("forbidden")) {
    return false;
  }

  return failureCount < 2;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
