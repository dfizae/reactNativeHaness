import type { AssetsSummaryDto } from "@/features/assets/model";

export const assetsSummaryMock: AssetsSummaryDto = {
  totalAssets: "5210000",
  accounts: [
    { accountId: "acc_101", bankName: "oo은행", balance: "408401" },
    { accountId: "acc_102", bankName: "oo은행", balance: "1740480" },
  ],
  recurringPayments: [
    { id: "sub_001", name: "넷플릭스 (멤버십)", category: "subscription", amount: "17000" },
    { id: "sub_002", name: "실손의료보험", category: "insurance", amount: "24500" },
  ],
  recentTransactions: [
    { id: "tx_001", merchant: "스타벅스 강남점", occurredAt: "2026-08-24T09:10:00+09:00", category: "식비", amount: "-12000" },
    { id: "tx_002", merchant: "서울교통공사", occurredAt: "2026-08-24T08:12:00+09:00", category: "교통", amount: "-1250" },
    { id: "tx_003", merchant: "하네스 코퍼레이션", occurredAt: "2026-08-23T10:00:00+09:00", category: "월급", amount: "2500000" },
  ],
};
