import { useRouter } from 'expo-router';
import { Activity, AlertCircle, Calendar, PlusCircle, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Control</Text>
          <Text style={styles.headerSubtitle}>
            Resumen operativo de <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>REactivate</Text>
          </Text>
        </View>

        {/* Botón CTA */}
        <Pressable 
          onPress={() => router.push('/agenda')}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.8 }
          ]}
        >
          <PlusCircle size={20} color="white" />
          <Text style={styles.ctaText}>Nuevo Turno</Text>
        </Pressable>
      </View>

      {/* --- KPI CARDS (Métricas) --- */}
      <View style={styles.kpiContainer}>
        
        {/* Card 1: Turnos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}> 
              <Calendar size={24} color="#DC2626" />
            </View>
            <Text style={styles.kpiValue}>12</Text>
          </View>
          <Text style={styles.kpiLabel}>Turnos hoy</Text>
        </View>

        {/* Card 2: Clientes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F5F5' }]}> 
              <Users size={24} color="#171717" />
            </View>
            <Text style={styles.kpiValue}>85</Text>
          </View>
          <Text style={styles.kpiLabel}>Clientes activos</Text>
        </View>

        {/* Card 3: Alertas (Borde rojo) */}
        <View style={[styles.card, styles.cardAlert]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}> 
              <AlertCircle size={24} color="#DC2626" />
            </View>
            <Text style={[styles.kpiValue, { color: '#DC2626' }]}>4</Text>
          </View>
          <Text style={styles.kpiLabel}>Pagos vencidos</Text>
        </View>

      </View>

      {/* --- SECCIÓN INFERIOR --- */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#DC2626" />
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            El flujo de actividad se cargará aquí al conectar la base de datos.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

// --- ESTILOS NATIVOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 24,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#171717',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#737373',
  },
  ctaButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    // Sombra suave
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  // KPI Styles
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    // Sombras card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    padding: 10,
    borderRadius: 8,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#171717',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#737373',
    fontWeight: '500',
  },
  // Section Styles
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#A3A3A3',
    textAlign: 'center',
  },
});