import { API_BASE_URL, api } from "@/api/client";
import { characterHomeSummaryMock } from "@/api/mocks/character-home";
import { withMockLatency } from "@/api/mocks/home";
import { toCharacterHomeSummary, type CharacterHomeSummary, type CharacterHomeSummaryDto } from "@/features/home/model";

export const USE_MOCKS = API_BASE_URL === "";

export async function getCharacterHomeSummary(signal?: AbortSignal): Promise<CharacterHomeSummary> {
  if (USE_MOCKS) return toCharacterHomeSummary(await withMockLatency(characterHomeSummaryMock, signal));
  const { data } = await api.get<CharacterHomeSummaryDto>("/home/character-summary", { signal });
  return toCharacterHomeSummary(data);
}
