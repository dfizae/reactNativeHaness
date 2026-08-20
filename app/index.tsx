import { useState } from "react";
import { Button, FlatList, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Todo {
  id: string;
  name: string;
}

export default function HomeScreen() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    if (text.trim() === "") {
      return;
    }
    setTodos((prev) => [...prev, { id: Date.now().toString(), name: text }]);
    setText("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <Text className="mb-4 text-2xl font-semibold">나의 할 일</Text>
      <TextInput
        className="mb-2 rounded-lg border border-slate-300 p-2.5"
        placeholder="할 일을 입력하세요"
        value={text}
        onChangeText={setText}
      />
      <Button title="추가" onPress={addTodo} />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text className="py-1.5 text-lg">{item.name}</Text>
        )}
      />
    </SafeAreaView>
  );
}
