import { COLORS, GLOBAL_STYLES } from '@/constants/theme';
import { supabase } from '@/core/supabase';
import { useRouter } from 'expo-router';
import { Activity, Calendar, LogOut, Users } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const MenuCard = ({ title, icon: Icon, onPress, color = COLORS.secondary }: any) => (
    <TouchableOpacity style={[styles.card, GLOBAL_STYLES.cardShadow]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Icon color="white" size={28} />
      </View>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Admin</Text>
          <Text style={styles.brand}>RE<Text style={{color: COLORS.primary}}>activate</Text></Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={COLORS.secondary} size={22} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

      <View style={styles.grid}>
        <MenuCard 
          title="Gestión de Clientes" 
          icon={Users} 
          color={COLORS.primary}
          onPress={() => router.push('/(dashboard)/clientes')} 
        />
        <MenuCard 
          title="Turnos del Día" 
          icon={Calendar} 
          color={COLORS.secondary}
          onPress={() => console.log('Ir a Turnos (Próximamente)')} 
        />
        <MenuCard 
          title="Reportes" 
          icon={Activity} 
          color={COLORS.text}
          onPress={() => console.log('Ir a Reportes')} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 24, backgroundColor: COLORS.surface 
  },
  greeting: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
  brand: { fontSize: 24, fontWeight: '900', color: COLORS.secondary },
  logoutBtn: { padding: 10, backgroundColor: COLORS.background, borderRadius: 50 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginHorizontal: 24, marginVertical: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingHorizontal: 24 },
  card: { 
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, 
    padding: 20, alignItems: 'center', justifyContent: 'center', height: 140 
  },
  iconBox: { 
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', 
    alignItems: 'center', marginBottom: 12 
  },
  cardText: { fontWeight: '600', color: COLORS.secondary, textAlign: 'center' }
});