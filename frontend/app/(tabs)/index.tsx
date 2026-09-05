import { SafeAreaView } from "react-native-safe-area-context";

import { CharacterHomeScreen } from "@/features/home/components/CharacterHomeScreen";

export default function HomeRoute() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <CharacterHomeScreen />
    </SafeAreaView>
  );
}
