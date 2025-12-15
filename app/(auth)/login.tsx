import { COLORS, GLOBAL_STYLES } from '@/constants/theme';
import { supabase } from '@/core/supabase';
import { router, Stack } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(admin)');
    }

    setLoading(false);
  }

  return (
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>RE<Text style={{ color: COLORS.secondary }}>activate</Text></Text>
          <Text style={styles.subtitle}>Bienestar y Entrenamiento</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputBox}>
            <Mail color={COLORS.textLight} size={20} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputBox}>
            <Lock color={COLORS.textLight} size={20} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              autoCapitalize="none"
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, GLOBAL_STYLES.shadow]}
            onPress={signIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>INGRESAR</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: COLORS.surface },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 40, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
  form: { gap: 20 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: 12, padding: 15, borderWidth: 1, borderColor: COLORS.border, gap: 10
  },
  input: { flex: 1, fontSize: 16, color: COLORS.secondary },
  button: {
    backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});