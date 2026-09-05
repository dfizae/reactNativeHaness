import { useQuery } from "@tanstack/react-query";
import { Store, WifiOff } from "lucide-react-native";
import * as React from "react";
import { Image, Pressable, View } from "react-native";

import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { characterHomeSummaryQueryOptions } from "@/features/home/api/queries";
import type { BudgetStatus, BudgetSummary, CharacterHomeSummary } from "@/features/home/model";
import { formatAmountInput, formatKRW } from "@/lib/money";

const roomImage = require("../../../design/figma-assets/room-character.png");

const STATUS_META: Record<BudgetStatus, { label: string; className: string }> = {
  good: { label: "좋아요!", className: "text-positive" },
  warning: { label: "주의!", className: "text-warning" },
  danger: { label: "위험!", className: "text-destructive" },
};

function CharacterHomeScreen() {
  const summary = useQuery(characterHomeSummaryQueryOptions());

  return (
    <View className="flex-1 bg-background">
      {summary.isPending ? <CharacterHomeSkeleton /> : null}
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
      {summary.isSuccess ? <CharacterHomeContent summary={summary.data} /> : null}
    </View>
  );
}

function CharacterHomeContent({ summary }: { summary: CharacterHomeSummary }) {
  return (
    <>
      <CharacterHomeHeader
        userName={summary.userName}
        coinBalance={summary.coinBalance}
        shopBadgeCount={summary.shopBadgeCount}
      />
      <View className="flex-1 gap-4 px-6 pb-4 pt-2">
        <View className="flex-1 overflow-hidden rounded-2xl bg-muted">
          <Image
            source={roomImage}
            resizeMode="cover"
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel="캐릭터가 있는 내 방"
          />
        </View>
        <BudgetCard budget={summary.budget} />
      </View>
    </>
  );
}

type CharacterHomeHeaderProps = {
  userName: string;
  coinBalance: number;
  shopBadgeCount: number;
};

function CharacterHomeHeader({ userName, coinBalance, shopBadgeCount }: CharacterHomeHeaderProps) {
  const shopLabel = shopBadgeCount > 0 ? `상점, 새 소식 ${shopBadgeCount}개` : "상점";

  return (
    <View className="flex-row items-center justify-between px-6 py-3">
      <View className="gap-1">
        <Text className="text-caption text-muted-foreground">환영합니다</Text>
        <Text className="text-h2" accessibilityRole="header">
          {userName}님, 안녕하세요!
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View
          className="flex-row items-center gap-1.5 rounded-full bg-muted py-1 pl-1.5 pr-3"
          accessibilityLabel={`보유 코인 ${formatAmountInput(String(coinBalance))}개`}
          accessible
        >
          <View className="h-5 w-5 items-center justify-center rounded-full bg-warning" accessible={false}>
            <Text className="text-caption text-warning-foreground">C</Text>
          </View>
          <Text className="text-label tabular-nums">{formatAmountInput(String(coinBalance))}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={shopLabel}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full bg-muted active:bg-accent"
        >
          <Icon as={Store} size={20} className="text-foreground" />
          {shopBadgeCount > 0 ? (
            <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1">
              <Text className="text-caption text-destructive-foreground">{shopBadgeCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function BudgetCard({ budget }: { budget: BudgetSummary }) {
  const status = STATUS_META[budget.status];
  const usedPercent = Math.round(budget.usedRatio * 100);

  return (
    <View className="gap-2 rounded-2xl bg-primary p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-label text-primary-foreground">이번 달 남은 예산</Text>
        <Text className={`text-caption ${status.className}`}>{status.label}</Text>
      </View>
      <Text className="text-amount-lg text-primary-foreground tabular-nums">{formatKRW(budget.remaining)}</Text>
      <Text className="text-caption text-primary-foreground/70 tabular-nums">
        총 예산 {formatKRW(budget.total)} 중 {formatKRW(budget.spent)} 사용
      </Text>
      <View
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/25"
        accessibilityRole="progressbar"
        accessible
        accessibilityLabel={`예산 사용률 ${usedPercent}%`}
        accessibilityValue={{ min: 0, max: 100, now: usedPercent }}
      >
        <View className="h-full rounded-full bg-positive" style={{ width: `${usedPercent}%` }} accessible={false} />
      </View>
    </View>
  );
}

function CharacterHomeSkeleton() {
  return (
    <View className="flex-1" accessibilityLabel="불러오는 중" accessible>
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="gap-1">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-7 w-44" />
        </View>
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </View>
      </View>
      <View className="flex-1 gap-4 px-6 pb-4 pt-2">
        <Skeleton className="flex-1 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </View>
    </View>
  );
}

export { CharacterHomeScreen };
