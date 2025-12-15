import { supabase } from '@/core/supabase';
import { usePathname, useRouter } from 'expo-router';
import { Calendar, Home, LogOut, Users } from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

const MENU_ITEMS = [
  { name: 'Panel de control', icon: Home, path: '/(admin)' },
  { name: 'Clientes', icon: Users, path: '/(admin)/clientes' },
  { name: 'Turnos', icon: Calendar, path: '/(admin)/turnos' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // --- FUNCIÓN DE LOGOUT ---
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logoText}>
          <Text style={styles.logoHighlight}>RE</Text>activate
        </Text>
        <Text style={styles.tagline}>BIENESTAR Y ENTRENAMIENTO</Text>
      </View>

      <View style={styles.navContainer}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={({ pressed }) => [
                styles.menuItem,
                isActive && styles.menuItemActive,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Icon
                size={20}
                color={isActive ? '#FFFFFF' : '#A3A3A3'}
              />
              <Text style={[
                styles.menuText,
                isActive && styles.menuTextActive
              ]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 3. Footer / Logout */}
      <View style={styles.footerContainer}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          <LogOut size={20} color="#A3A3A3" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>

    </View>
  );
};

// --- ESTILOS NATIVOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
    padding: 24,
    width: '100%',
    height: '100%',
  },
  // Header
  header: {
    marginBottom: 40,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: '#DC2626',
  },
  tagline: {
    color: '#525252',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Navegación
  navContainer: {
    flexDirection: 'column',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: '#DC2626',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#A3A3A3',
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Footer
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#A3A3A3',
  },
});