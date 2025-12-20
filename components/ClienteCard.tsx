import { Cliente } from '@/interface/Cliente';
import { Activity, Phone, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './StatusBadge';

export const ClienteCard = ({ cliente, onPress }: { cliente: Cliente, onPress: (id: number) => void }) => {
  return (
    <Pressable 
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]} 
      onPress={() => onPress(cliente.id)}
    >
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <User size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.name}>{cliente.nombre}</Text>
            <View style={styles.planRow}>
              <Activity size={12} color="#DC2626" />
              <Text style={styles.planName}>{cliente.tipo_plan?.nombre || 'Particular'}</Text>
            </View>
          </View>
        </View>
        <StatusBadge clases={cliente.clases_disponibles} />
      </View>

      <View style={styles.footer}>
        <View style={styles.infoBox}>
          <Phone size={14} color="#737373" />
          <Text style={styles.infoText}>{cliente.telefono || 'Sin contacto'}</Text>
        </View>
        
        <View style={styles.counterBox}>
          <Text style={styles.counterLabel}>Sesiones restantes:</Text>
          <Text style={[styles.counterNumber, { color: cliente.clases_disponibles > 0 ? '#000' : '#DC2626' }]}>
            {cliente.clases_disponibles}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#171717' },
  planRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  planName: { fontSize: 13, color: '#737373', fontWeight: '500' },
  footer: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: '#737373' },
  counterBox: { alignItems: 'flex-end' },
  counterLabel: { fontSize: 10, color: '#A3A3A3', textTransform: 'uppercase' },
  counterNumber: { fontSize: 20, fontWeight: '800' }
});