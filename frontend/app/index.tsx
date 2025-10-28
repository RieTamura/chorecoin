import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || '';

export default function LoginScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoggingIn(true);
    try {
      await login(idToken);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('ログインエラー', 'ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🪙 Chore Coin</Text>
        <Text style={styles.subtitle}>お手伝いコイン</Text>
        <Text style={styles.description}>
          お手伝いをしてポイントを貯めよう！{'\n'}
          貯まったポイントでご褒美と交換できるよ✨
        </Text>

        <TouchableOpacity
          style={[styles.button, (!request || isLoggingIn) && styles.buttonDisabled]}
          onPress={() => promptAsync()}
          disabled={!request || isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Googleでログイン</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
