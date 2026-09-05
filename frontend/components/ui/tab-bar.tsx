import type { Tabs } from "expo-router";
import { Calculator, ChartColumn, House, User, Wallet, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

const TAB_ICONS: Record<string, LucideIcon> = {
  index: House,
  assets: Wallet,
  budget: Calculator,
  report: ChartColumn,
  mypage: User,
};

const MIN_BOTTOM_INSET = 20;

function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-start justify-between border-t border-border bg-card px-6 pt-1.5"
      style={{ paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET) }}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        if (!(route.name in TAB_ICONS)) return null;
        const options = descriptors[route.key]?.options;
        const focused = state.index === index;
        const label = typeof options?.title === "string" ? options.title : route.name;
        const icon = TAB_ICONS[route.name] as LucideIcon;

        const handlePress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={handlePress}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            hitSlop={8}
            className="min-w-touch flex-col items-center gap-0.5 py-1 active:opacity-80"
          >
            <View className={cn("rounded-full px-2.5 py-0.5", focused && "bg-secondary")}>
              <Icon as={icon} size={22} className={focused ? "text-primary" : "text-muted-foreground"} />
            </View>
            <Text className={cn("text-caption", focused ? "text-primary" : "text-muted-foreground")}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { TabBar };
export type { TabBarProps };
