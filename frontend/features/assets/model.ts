import { getKSTParts } from "@/lib/date";
import { isKRW, signOfKRW, type KRW } from "@/lib/money";

export type RecurringCategory = "subscription" | "insurance";

export type AssetsSummaryDto = {
  totalAssets: string;
  accounts: { accountId: string; bankName: string; balance: string }[];
  recurringPayments: { id: string; name: string; category: RecurringCategory; amount: string }[];
  recentTransactions: { id: string; merchant: string; occurredAt: string; category: string; amount: string }[];
};

export type AccountItem = {
  accountId: string;
  bankName: string;
  balance: KRW;
};

export type RecurringPayment = {
  id: string;
  name: string;
  category: RecurringCategory;
  amount: KRW;
};

export type TransactionItem = {
  id: string;
  merchant: string;
  subLabel: string;
  amount: KRW;
  direction: "deposit" | "withdrawal";
};

export type AssetsSummary = {
  totalAssets: KRW;
  accounts: AccountItem[];
  recurringPayments: RecurringPayment[];
  recentTransactions: TransactionItem[];
};

export class ContractMismatchError extends Error {
  constructor(field: string) {
    super(`백엔드 계약 불일치: ${field}`);
    this.name = "ContractMismatchError";
  }
}

function assertKRW(value: string, field: string): KRW {
  if (!isKRW(value)) throw new ContractMismatchError(field);
  return value;
}

function formatTransactionSubLabel(occurredAt: string, category: string): string {
  const { month, day } = getKSTParts(occurredAt);
  return `${month}월 ${day}일 · ${category}`;
}

export function toAssetsSummary(dto: AssetsSummaryDto): AssetsSummary {
  return {
    totalAssets: assertKRW(dto.totalAssets, "totalAssets"),
    accounts: dto.accounts.map((account) => ({
      accountId: account.accountId,
      bankName: account.bankName,
      balance: assertKRW(account.balance, "accounts.balance"),
    })),
    recurringPayments: dto.recurringPayments.map((payment) => ({
      id: payment.id,
      name: payment.name,
      category: payment.category,
      amount: assertKRW(payment.amount, "recurringPayments.amount"),
    })),
    recentTransactions: dto.recentTransactions.map((tx) => {
      const amount = assertKRW(tx.amount, "recentTransactions.amount");
      return {
        id: tx.id,
        merchant: tx.merchant,
        subLabel: formatTransactionSubLabel(tx.occurredAt, tx.category),
        amount,
        direction: signOfKRW(amount) < 0 ? ("withdrawal" as const) : ("deposit" as const),
      };
    }),
  };
}
