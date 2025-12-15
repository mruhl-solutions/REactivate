// app/(dashboard)/clientes.tsx
import { supabase } from '@/core/supabase';
import { Cliente } from '@/interface/Cliente';
import { Phone, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (data) setClientes(data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between border border-gray-100">
      <View>
        <Text className="text-lg font-bold text-brand-dark">{item.nombre}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded mr-2">
            {item.tipo_plan}
          </Text>
          <Text className="text-xs text-gray-400">Vence: {item.fecha_pago_mes}</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-green-50 p-3 rounded-full">
        <Phone size={18} color="#16A34A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-light">
      <View className="p-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-brand-dark">Clientes</Text>
        <TouchableOpacity className="bg-brand-red p-2 rounded-full">
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="large" color="#DC2626" className="mt-10" />
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-400 mt-10">No hay clientes aún</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}