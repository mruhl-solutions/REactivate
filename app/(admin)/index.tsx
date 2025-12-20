import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { AlertCircle, Calendar, CalendarPlus, CheckCircle, ChevronRight, Clock, UserPlus, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../core/supabase';

// --- CONFIGURACIÓN ---
const CAPACIDAD_DIARIA = 12;

interface DashboardMetrics {
    turnosHoy: number;
    turnosLibres: number;
    clientesActivos: number;
    sinSesiones: number; // Reemplaza pagos vencidos
}

interface ProximoTurno {
    id: number;
    fecha_hora_inicio: string;
    tipo_sesion: {
        descripcion: string;
        color_hex: string;
    };
    asistencia_turnos: {
        clientes: { nombre: string; } | null;
    }[];
}

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        turnosHoy: 0, turnosLibres: 0, clientesActivos: 0, sinSesiones: 0,
    });
    const [proximosTurnos, setProximosTurnos] = useState<ProximoTurno[]>([]);

    const isWideScreen = Dimensions.get('window').width > 1024;

    const fetchDashboardData = useCallback(async () => {
        try {
            if (!refreshing) setLoading(true);
            const hoy = new Date();
            const inicioDia = startOfDay(hoy).toISOString();
            const finDia = endOfDay(hoy).toISOString();

            const [turnosCount, totalClientes, sinClases, agendaFutura] = await Promise.all([
                supabase.from('turnos').select('*', { count: 'exact', head: true }).gte('fecha_hora_inicio', inicioDia).lte('fecha_hora_inicio', finDia),
                supabase.from('clientes').select('*', { count: 'exact', head: true }),
                supabase.from('clientes').select('*', { count: 'exact', head: true }).lte('clases_disponibles', 0),
                supabase.from('turnos').select(`
                    id, 
                    fecha_hora_inicio, 
                    tipo_sesion(descripcion, color_hex),
                    asistencia_turnos(clientes(nombre))
                `)
                .gte('fecha_hora_inicio', new Date().toISOString())
                .order('fecha_hora_inicio', { ascending: true })
                .limit(8)
            ]);

            const ocupados = turnosCount.count || 0;
            setMetrics({
                turnosHoy: ocupados,
                turnosLibres: Math.max(0, CAPACIDAD_DIARIA - ocupados),
                clientesActivos: totalClientes.count || 0,
                sinSesiones: sinClases.count || 0,
            });
            setProximosTurnos(agendaFutura.data as any || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} tintColor="#DC2626" />}
        >
            {/* 1. HEADER */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.brandText}>REactivate</Text>
                    <Text style={styles.dashboardTitle}>Panel General</Text>
                    <Text style={styles.dateText}>{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</Text>
                </View>
                <View style={styles.headerBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Operativo</Text>
                </View>
            </View>

            {/* 2. KPI STRIP */}
            <View style={styles.kpiStrip}>
                <KPIItem label="Turnos Hoy" value={metrics.turnosHoy} icon={Calendar} color="#DC2626" bg="#FEF2F2" />
                <View style={styles.divider} />
                <KPIItem label="Libres" value={metrics.turnosLibres} icon={CheckCircle} color="#059669" bg="#ECFDF5" />
                <View style={styles.divider} />
                <KPIItem label="Socios" value={metrics.clientesActivos} icon={Users} color="#171717" bg="#F5F5F5" />
                <View style={styles.divider} />
                <KPIItem
                    label="Sin Saldo"
                    value={metrics.sinSesiones}
                    icon={AlertCircle}
                    color={metrics.sinSesiones > 0 ? "#DC2626" : "#171717"}
                    bg={metrics.sinSesiones > 0 ? "#FEF2F2" : "#F5F5F5"}
                    isAlert={metrics.sinSesiones > 0}
                    onPress={() => router.push('/(admin)/clientes')}
                />
            </View>

            {/* 3. LAYOUT PRINCIPAL */}
            <View style={[styles.mainLayout, !isWideScreen && styles.mainLayoutColumn]}>

                {/* AGENDA INMEDIATA */}
                <View style={styles.leftColumn}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Clock size={18} color="#525252" />
                            <Text style={styles.cardTitle}>Agenda Inmediata</Text>
                        </View>
                        <Pressable onPress={() => router.push('/(admin)/turnos')}>
                            <Text style={styles.linkText}>Ver completa</Text>
                        </Pressable>
                    </View>

                    {loading ? <ActivityIndicator color="#DC2626" style={{ margin: 20 }} /> : (
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.th, { width: 60 }]}>HORA</Text>
                                <Text style={[styles.th, { flex: 1 }]}>CLIENTES</Text>
                                <Text style={[styles.th, { width: 100 }]}>ACTIVIDAD</Text>
                                <Text style={[styles.th, { width: 20 }]}></Text>
                            </View>

                            {proximosTurnos.length === 0 ? (
                                <Text style={styles.emptyText}>No hay turnos próximos.</Text>
                            ) : (
                                proximosTurnos.map((t, i) => {
                                    const colorBase = t.tipo_sesion.color_hex;
                                    return (
                                        <View key={t.id} style={[styles.tr, i === proximosTurnos.length - 1 && { borderBottomWidth: 0 }]}>
                                            <Text style={styles.timeCell}>{format(parseISO(t.fecha_hora_inicio), 'HH:mm')}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.clientCell} numberOfLines={1}>
                                                    {t.asistencia_turnos.map(a => a.clientes?.nombre).join(', ') || 'Sin clientes'}
                                                </Text>
                                            </View>
                                            <View style={[styles.badge, { backgroundColor: colorBase + '20' }]}>
                                                <Text style={[styles.badgeText, { color: colorBase === '#F8FAFC' ? '#000' : colorBase }]}>
                                                    {t.tipo_sesion.descripcion.split(' ')[0]}
                                                </Text>
                                            </View>
                                            <ChevronRight size={16} color="#D4D4D4" />
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}
                </View>

                {/* ACCIONES RÁPIDAS */}
                <View style={styles.rightColumn}>
                    <View style={styles.actionCard}>
                        <Text style={styles.sidebarTitle}>Acciones Rápidas</Text>
                        <Pressable style={styles.actionBtn} onPress={() => router.push('/(admin)/clientes')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F5F5F5' }]}>
                                <UserPlus size={20} color="#171717" />
                            </View>
                            <View>
                                <Text style={styles.actionBtnText}>Nuevo Cliente</Text>
                                <Text style={styles.actionBtnSub}>Registrar socio</Text>
                            </View>
                        </Pressable>

                        <Pressable style={styles.actionBtn} onPress={() => router.push('/(admin)/turnos')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                                <CalendarPlus size={20} color="#DC2626" />
                            </View>
                            <View>
                                <Text style={styles.actionBtnText}>Crear Turno</Text>
                                <Text style={styles.actionBtnSub}>Agendar sesión</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const KPIItem = ({ label, value, icon: Icon, color, bg, isAlert, onPress }: any) => (
    <Pressable onPress={onPress} style={styles.kpiItem}>
        <View style={[styles.miniIcon, { backgroundColor: bg }]}>
            <Icon size={18} color={color} />
        </View>
        <View>
            <Text style={[styles.kpiValue, isAlert && { color: color }]}>{value}</Text>
            <Text style={styles.kpiLabel}>{label}</Text>
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    scrollContent: { padding: 20, paddingTop: 60 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    brandText: { fontSize: 10, fontWeight: '900', color: '#DC2626', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    dashboardTitle: { fontSize: 26, fontWeight: '800', color: '#111827' },
    dateText: { fontSize: 14, color: '#6B7280', textTransform: 'capitalize' },
    headerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
    liveText: { fontSize: 12, fontWeight: '700', color: '#047857' },

    kpiStrip: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.02, elevation: 2, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F3F4F6' },
    kpiItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    miniIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    kpiValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
    kpiLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: -2 },
    divider: { width: 1, height: 35, backgroundColor: '#F3F4F6' },

    mainLayout: { flexDirection: 'row', gap: 20 },
    mainLayoutColumn: { flexDirection: 'column' },

    leftColumn: { flex: 2.5, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
    linkText: { fontSize: 13, color: '#DC2626', fontWeight: '700' },

    table: { width: '100%' },
    tableHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    th: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1 },
    tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#FAFAFA' },
    timeCell: { width: 60, fontSize: 14, fontWeight: '800', color: '#111827' },
    clientCell: { fontSize: 14, fontWeight: '700', color: '#374151' },
    badge: { width: 90, paddingVertical: 5, borderRadius: 6, alignItems: 'center', marginRight: 10 },
    badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    emptyText: { textAlign: 'center', padding: 40, color: '#9CA3AF' },

    rightColumn: { flex: 1, gap: 20 },
    actionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    sidebarTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
    actionBtnSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
});