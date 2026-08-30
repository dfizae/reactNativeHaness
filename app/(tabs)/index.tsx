import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <View className="gap-2 py-6">
        <Text className="text-h1">홈</Text>
        <Text className="text-body-sm text-muted-foreground">
          화면은 design/figma-map.json의 노드를 대조해 구현합니다.
        </Text>
      </View>
      <View className="rounded-xl border border-border bg-card p-4">
        <Text className="text-label text-muted-foreground">토큰 적용 확인</Text>
        <Text className="text-amount-md tabular-nums">0원</Text>
      </View>
    </SafeAreaView>
  );
}
