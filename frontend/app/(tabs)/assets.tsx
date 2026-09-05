import { Wallet } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";

export default function AssetsRoute() {
  return (
    <SafeAreaView className="flex-1 bg-background px-6" edges={["top"]}>
      <Text className="py-4 text-h1" accessibilityRole="header">
        자산관리
      </Text>
      <EmptyState icon={Wallet} title="아직 구현 전이에요" description="design.pen의 assets 아트보드 기준으로 구현될 화면이에요." />
    </SafeAreaView>
  );
}
