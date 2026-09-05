import { SafeAreaView } from "react-native-safe-area-context";

import { AssetsScreen } from "@/features/assets/components/AssetsScreen";

export default function AssetsRoute() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <AssetsScreen />
    </SafeAreaView>
  );
}
