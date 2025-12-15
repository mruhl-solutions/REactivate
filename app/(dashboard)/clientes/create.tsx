import { COLORS, GLOBAL_STYLES } from '@/constants/theme';
import { supabase } from '@/core/supabase';
import { Stack, useRouter } from 'expo-router';
import { FileText, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

export default function CreateCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', tipo_plan: 'Entreno', notas_medicas: '' });

  const handleSave = async () => {
    if (!form.nombre.trim()) return Alert.alert('Error', 'Nombre obligatorio');
    setLoading(true);
    const { error } = await supabase.from('clientes').insert({ ...form, fecha_pago_mes: new Date().toISOString() });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else { router.back(); }
  };

  const PlanOption = ({ label, value }: any) => (
    <TouchableOpacity 
      style={[styles.planChip, form.tipo_plan === value && styles.planChipActive]}
      onPress={() => setForm({ ...form, tipo_plan: value })}
    >
      <Text style={[styles.planText, form.tipo_plan === value && styles.planTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={{color: COLORS.primary}}>Cancelar</Text></TouchableOpacity>
        <Text style={styles.title}>Nuevo Cliente</Text>
        <View style={{width: 50}} />
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.label}>Datos Personales</Text>
        
        <View style={styles.inputBox}>
          <User size={20} color={COLORS.textLight} />
          <TextInput 
            style={styles.input} placeholder="Nombre completo" 
            value={form.nombre} onChangeText={t => setForm({...form, nombre: t})}
          />
        </View>

        <View style={styles.inputBox}>
          <Phone size={20} color={COLORS.textLight} />
          <TextInput 
            style={styles.input} placeholder="Teléfono" keyboardType="phone-pad"
            value={form.telefono} onChangeText={t => setForm({...form, telefono: t})}
          />
        </View>

        <Text style={styles.label}>Plan</Text>
        <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
          <PlanOption label="Entreno" value="Entreno" />
          <PlanOption label="Rehab" value="Rehab" />
          <PlanOption label="Masaje" value="Masaje" />
        </View>

        <Text style={styles.label}>Observaciones</Text>
        <View style={[styles.inputBox, {alignItems: 'flex-start', height: 100}]}>
          <FileText size={20} color={COLORS.textLight} style={{marginTop: 5}} />
          <TextInput 
            style={[styles.input, {height: '100%'}]} placeholder="Notas médicas..." multiline
            value={form.notas_medicas} onChangeText={t => setForm({...form, notas_medicas: t})}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, GLOBAL_STYLES.shadow]} 
          onPress={handleSave} disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>GUARDAR CLIENTE</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', padding: 16, 
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border 
  },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 8, marginTop: 10 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, 
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, gap: 10, marginBottom: 15
  },
  input: { flex: 1, fontSize: 16, color: COLORS.secondary },
  planChip: { 
    flex: 1, padding: 12, borderWidth: 1, borderColor: COLORS.border, 
    borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.surface 
  },
  planChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  planText: { color: COLORS.secondary, fontWeight: '500' },
  planTextActive: { color: 'white', fontWeight: 'bold' },
  saveBtn: { backgroundColor: COLORS.secondary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});