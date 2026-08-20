import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

export default function App() {

  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 할 일</Text>
      <TextInput
        style={styles.input}
        placeholder="할 일을 입력하세요"
        value={text}
        onChangeText={setText}
      />
      <Button title="추가" onPress={() => {
        if (text.trim() !== '') {
        setTodos([...todos, { id: Date.now().toString(), name: text }]);
          setText('');
        }
      }} />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  item: {
    fontSize: 18,
    paddingVertical: 6,
  }
});
