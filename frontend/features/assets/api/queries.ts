import { queryOptions } from "@tanstack/react-query";

import { getAssetsSummary } from "@/features/assets/api/assets.api";

export const assetsKeys = {
  all: ["assets"] as const,
  summary: () => [...assetsKeys.all, "summary"] as const,
};

export function assetsSummaryQueryOptions() {
  return queryOptions({
    queryKey: assetsKeys.summary(),
    queryFn: ({ signal }) => getAssetsSummary(signal),
    staleTime: 30_000,
  });
}
