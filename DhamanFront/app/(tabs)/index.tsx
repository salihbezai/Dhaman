import { Text, View, StyleSheet } from 'react-native';
 import { Link } from 'expo-router'; 
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/login" style={styles.button}>
        Go to Login screen
        Hello, {user?.username}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
