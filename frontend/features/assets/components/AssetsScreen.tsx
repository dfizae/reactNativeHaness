import { useQuery } from "@tanstack/react-query";
import { CreditCard, Film, Landmark, Menu, ShieldAlert, WifiOff, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { assetsSummaryQueryOptions } from "@/features/assets/api/queries";
import type {
  AccountItem,
  AssetsSummary,
  RecurringCategory,
  RecurringPayment,
  TransactionItem,
} from "@/features/assets/model";
import { formatKRW } from "@/lib/money";
import { cn } from "@/lib/utils";

type AssetTab = "account" | "card" | "loan";

const ASSET_TABS: { key: AssetTab; label: string }[] = [
  { key: "account", label: "계좌" },
  { key: "card", label: "카드" },
  { key: "loan", label: "대출" },
];

const RECURRING_ICONS: Record<RecurringCategory, LucideIcon> = {
  subscription: Film,
  insurance: ShieldAlert,
};

function AssetsScreen() {
  const summary = useQuery(assetsSummaryQueryOptions());

  return (
    <View className="flex-1 bg-background">
      {summary.isPending ? <AssetsSkeleton /> : null}
      {summary.isError ? (
        <View className="flex-1 justify-center">
          <EmptyState
            icon={WifiOff}
            title="정보를 불러오지 못했어요"
            description="연결 상태를 확인한 뒤 다시 시도해 주세요."
            action={{ label: "다시 시도", onPress: () => summary.refetch(), disabled: summary.isFetching }}
          />
        </View>
      ) : null}
      {summary.isSuccess ? <AssetsContent summary={summary.data} /> : null}
    </View>
  );
}

function AssetsContent({ summary }: { summary: AssetsSummary }) {
  const [activeTab, setActiveTab] = React.useState<AssetTab>("account");

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="flex-row items-center justify-between px-6 py-3">
        <Text className="text-h1" accessibilityRole="header">
          자산관리
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="메뉴"
          hitSlop={8}
          className="h-touch w-10 items-center justify-center rounded-full active:bg-accent"
        >
          <Icon as={Menu} size={24} className="text-foreground" />
        </Pressable>
      </View>
      <View className="gap-1 px-6">
        <Text className="text-caption text-muted-foreground">내 총 자산</Text>
        <Text className="text-amount-lg tabular-nums">{formatKRW(summary.totalAssets)}</Text>
      </View>
      <View className="flex-row gap-2 px-6 pt-4" accessibilityRole="tablist">
        {ASSET_TABS.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              className={cn(
                "h-10 flex-1 items-center justify-center rounded-lg",
                selected ? "bg-primary" : "bg-muted active:bg-accent"
              )}
            >
              <Text className={cn("text-label", selected ? "text-primary-foreground" : "text-muted-foreground")}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {activeTab === "account" ? (
        <AccountSection accounts={summary.accounts} />
      ) : (
        <EmptyState
          icon={activeTab === "card" ? CreditCard : Landmark}
          title={activeTab === "card" ? "연결된 카드가 없어요" : "연결된 대출이 없어요"}
          description="자산을 연결하면 여기에 표시돼요."
        />
      )}
      <RecurringSection payments={summary.recurringPayments} />
      <TransactionsSection transactions={summary.recentTransactions} />
    </ScrollView>
  );
}

function AccountSection({ accounts }: { accounts: AccountItem[] }) {
  return (
    <View className="gap-3 px-6 pt-4">
      <Text className="text-h3" accessibilityRole="header">
        입출금 계좌
      </Text>
      {accounts.length === 0 ? (
        <EmptyState icon={Landmark} title="연결된 계좌가 없어요" description="자산을 연결하면 여기에 표시돼요." />
      ) : (
        accounts.map((account) => (
          <View
            key={account.accountId}
            className="flex-row items-center justify-between rounded-lg bg-secondary p-4"
          >
            <View className="gap-1">
              <Text className="text-label">{account.bankName}</Text>
              <Text className="text-amount-sm tabular-nums">{formatKRW(account.balance)}</Text>
            </View>
            <Button
              size="sm"
              className="rounded-full px-4"
              accessibilityLabel={`${account.bankName} ${formatKRW(account.balance)} 송금`}
            >
              <Text>송금</Text>
            </Button>
          </View>
        ))
      )}
    </View>
  );
}

function SectionHeader({ title, linkLabel }: { title: string; linkLabel: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-h3" accessibilityRole="header">
        {title}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${title} ${linkLabel}`} hitSlop={8}>
        <Text className="text-caption text-primary">{linkLabel}</Text>
      </Pressable>
    </View>
  );
}

function RecurringSection({ payments }: { payments: RecurringPayment[] }) {
  return (
    <View className="gap-3 px-6 pt-6">
      <SectionHeader title="이번 달 정기결제 예정" linkLabel="관리" />
      {payments.map((payment) => (
        <View key={payment.id} className="flex-row items-center justify-between py-1">
          <View className="flex-row items-center gap-3">
            <View className="h-icon-tile w-icon-tile items-center justify-center rounded-md bg-muted" accessible={false}>
              <Icon as={RECURRING_ICONS[payment.category]} size={18} className="text-foreground" />
            </View>
            <Text className="text-label">{payment.name}</Text>
          </View>
          <Text className="text-amount-sm tabular-nums">{formatKRW(payment.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

function TransactionsSection({ transactions }: { transactions: TransactionItem[] }) {
  return (
    <View className="gap-3 px-6 pt-6">
      <SectionHeader title="최근 거래 내역" linkLabel="전체보기" />
      {transactions.map((tx) => (
        <View key={tx.id} className="flex-row items-center justify-between py-1">
          <View className="gap-1">
            <Text className="text-label">{tx.merchant}</Text>
            <Text className="text-caption text-muted-foreground">{tx.subLabel}</Text>
          </View>
          <Text
            className={cn(
              "text-amount-sm tabular-nums",
              tx.direction === "withdrawal" ? "text-destructive" : "text-positive"
            )}
          >
            {formatKRW(tx.amount, { sign: "always" })}
          </Text>
        </View>
      ))}
    </View>
  );
}

function AssetsSkeleton() {
  return (
    <View className="flex-1 gap-4 px-6 pt-3" accessibilityLabel="불러오는 중" accessible>
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </View>
      <View className="gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-48" />
      </View>
      <View className="flex-row gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </View>
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </View>
  );
}

export { AssetsScreen };
