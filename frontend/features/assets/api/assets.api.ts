import { API_BASE_URL, api } from "@/api/client";
import { assetsSummaryMock } from "@/api/mocks/assets";
import { withMockLatency } from "@/api/mocks/home";
import { toAssetsSummary, type AssetsSummary, type AssetsSummaryDto } from "@/features/assets/model";

export const USE_MOCKS = API_BASE_URL === "";

export async function getAssetsSummary(signal?: AbortSignal): Promise<AssetsSummary> {
  if (USE_MOCKS) return toAssetsSummary(await withMockLatency(assetsSummaryMock, signal));
  const { data } = await api.get<AssetsSummaryDto>("/assets/summary", { signal });
  return toAssetsSummary(data);
}
