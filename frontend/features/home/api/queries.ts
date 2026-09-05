import { queryOptions } from "@tanstack/react-query";

import { getCharacterHomeSummary } from "@/features/home/api/character-home.api";

export const homeKeys = {
  all: ["home"] as const,
  characterSummary: () => [...homeKeys.all, "character-summary"] as const,
};

export function characterHomeSummaryQueryOptions() {
  return queryOptions({
    queryKey: homeKeys.characterSummary(),
    queryFn: ({ signal }) => getCharacterHomeSummary(signal),
    staleTime: 30_000,
  });
}
