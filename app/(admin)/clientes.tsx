import { ClienteCard } from '@/components/ClienteCard';
import { supabase } from '@/core/supabase';
import { Cliente } from '@/interface/Cliente';
import { Plus, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const fetchClientes = useCallback(async () => {
  try {
    if (!refreshing) setLoading(true);

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id,
        nombre,
        telefono,
        clases_disponibles,
        plan_id,
        tipo_plan:tipo_plan (
            nombre,
            cant_mensual
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
        console.error("Error Supabase:", error);
        throw error;
    }

    setClientes(data || []);
  } catch (error: any) {
    Alert.alert('Error de Conexión', error.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [refreshing]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>REactivate</Text>
          <Text style={styles.sectionTitle}>Panel de Clientes</Text>
        </View>
        <Pressable style={styles.fab} onPress={() => {}}>
          <Plus size={24} color="#FFF" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ClienteCard cliente={item} onPress={(id) => console.log('Editando:', id)} />
          )}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClientes(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Search size={40} color="#D4D4D4" />
              <Text style={styles.emptyText}>No hay clientes en el sistema.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  brandTitle: { fontSize: 12, fontWeight: '900', color: '#DC2626', textTransform: 'uppercase', letterSpacing: 2 },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: '#000' },
  fab: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: '#A3A3A3', fontSize: 15 }
});