import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

export const getServerQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    }),
);

export default getServerQueryClient;
