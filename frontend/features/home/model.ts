import { isKRW, subtractKRW, toWon, type KRW } from "@/lib/money";

export type BudgetStatus = "good" | "warning" | "danger";

export type CharacterHomeSummaryDto = {
  user: { name: string };
  coinBalance: number;
  shopBadgeCount: number;
  budget: { total: string; spent: string; status: BudgetStatus };
};

export type BudgetSummary = {
  total: KRW;
  spent: KRW;
  remaining: KRW;
  usedRatio: number;
  status: BudgetStatus;
};

export type CharacterHomeSummary = {
  userName: string;
  coinBalance: number;
  shopBadgeCount: number;
  budget: BudgetSummary;
};

export class ContractMismatchError extends Error {
  constructor(field: string) {
    super(`백엔드 계약 불일치: ${field}`);
    this.name = "ContractMismatchError";
  }
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function toCharacterHomeSummary(dto: CharacterHomeSummaryDto): CharacterHomeSummary {
  if (!isKRW(dto.budget.total)) throw new ContractMismatchError("budget.total");
  if (!isKRW(dto.budget.spent)) throw new ContractMismatchError("budget.spent");

  const total = dto.budget.total;
  const spent = dto.budget.spent;
  const totalWon = toWon(total);
  const usedRatio = totalWon > 0n ? clampRatio(Number(toWon(spent)) / Number(totalWon)) : 0;

  return {
    userName: dto.user.name,
    coinBalance: dto.coinBalance,
    shopBadgeCount: dto.shopBadgeCount,
    budget: { total, spent, remaining: subtractKRW(total, spent), usedRatio, status: dto.budget.status },
  };
}
