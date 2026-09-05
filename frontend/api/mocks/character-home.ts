import type { CharacterHomeSummaryDto } from "@/features/home/model";

export const characterHomeSummaryMock: CharacterHomeSummaryDto = {
  user: { name: "김재영" },
  coinBalance: 1250,
  shopBadgeCount: 3,
  budget: { total: "500000", spent: "320000", status: "good" },
};
