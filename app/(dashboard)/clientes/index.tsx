import { COLORS, GLOBAL_STYLES } from '@/constants/theme';
import { supabase } from '@/core/supabase';
import { Cliente } from '@/interface/Cliente';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Phone, Plus, Search, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ClientesList() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClientes = async () => {
    if (clientes.length === 0) setLoading(true); 
    let query = supabase.from('clientes').select('*').order('nombre', { ascending: true });
    if (search) query = query.ilike('nombre', `%${search}%`);
    
    const { data } = await query;
    setClientes(data || []);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchClientes() }, []));
  React.useEffect(() => { const t = setTimeout(fetchClientes, 500); return () => clearTimeout(t); }, [search]);

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity style={[styles.card, GLOBAL_STYLES.cardShadow]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><User color={COLORS.surface} size={18} /></View>
        <View style={{flex: 1}}>
          <Text style={styles.cardName}>{item.nombre}</Text>
          <Text style={styles.cardPlan}>{item.tipo_plan}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Phone size={14} color={COLORS.textLight} />
        <Text style={styles.footerText}>{item.telefono || 'Sin teléfono'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Clientes</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.searchBox}>
        <Search color={COLORS.textLight} size={20} />
        <TextInput 
          placeholder="Buscar..." style={styles.input} 
          placeholderTextColor={COLORS.textLight} value={search} onChangeText={setSearch}
        />
      </View>

      {loading ? <ActivityIndicator color={COLORS.primary} style={{marginTop: 50}} /> : (
        <FlatList
          data={clientes} keyExtractor={i => i.id} renderItem={renderItem}
          contentContainerStyle={{padding: 20}}
          ListEmptyComponent={<Text style={styles.empty}>No hay clientes.</Text>}
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, GLOBAL_STYLES.shadow]} 
        onPress={() => router.push('/(dashboard)/clientes/create')}
      >
        <Plus color="white" size={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', padding: 16, 
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border 
  },
  backBtn: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, 
    margin: 20, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.secondary },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { 
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  cardName: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  cardPlan: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderColor: COLORS.background, paddingTop: 10 },
  footerText: { color: COLORS.textLight, fontSize: 13 },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
  fab: { 
    position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, 
    borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' 
  }
});