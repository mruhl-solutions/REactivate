import { format, parseISO } from 'date-fns';
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
    pagosVencidos: number;
}

interface ProximoTurno {
    id: string;
    fecha_hora_inicio: string;
    actividad: string;
    clientes: { nombre: string; tipo_plan: string } | null;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Detectar ancho de pantalla para responsive simple
    const screenWidth = Dimensions.get('window').width;
    const isWideScreen = screenWidth > 1024;

    const [metrics, setMetrics] = useState<DashboardMetrics>({
        turnosHoy: 0, turnosLibres: 0, clientesActivos: 0, pagosVencidos: 0,
    });

    const [proximosTurnos, setProximosTurnos] = useState<ProximoTurno[]>([]);

    const fetchDashboardData = useCallback(async () => {
        try {
            if (!refreshing) setLoading(true);
            const hoy = new Date();
            const hoyISO = hoy.toISOString();
            const inicioDia = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
            const finDia = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();
            const fechaHoySimple = new Date().toISOString().split('T')[0];

            // Consultas paralelas para velocidad
            const [turnosHoy, totalClientes, pagosVencidos, agendaFutura] = await Promise.all([
                supabase.from('turnos').select('*', { count: 'exact', head: true }).gte('fecha_hora_inicio', inicioDia).lte('fecha_hora_inicio', finDia),
                supabase.from('clientes').select('*', { count: 'exact', head: true }),
                supabase.from('clientes').select('*', { count: 'exact', head: true }).lt('fecha_pago_mes', fechaHoySimple),
                supabase.from('turnos').select('id, fecha_hora_inicio, actividad, clientes(nombre, tipo_plan)').gte('fecha_hora_inicio', hoyISO).order('fecha_hora_inicio', { ascending: true }).limit(8)
            ]);

            const ocupados = turnosHoy.count || 0;
            setMetrics({
                turnosHoy: ocupados,
                turnosLibres: Math.max(0, CAPACIDAD_DIARIA - ocupados),
                clientesActivos: totalClientes.count || 0,
                pagosVencidos: pagosVencidos.count || 0,
            });
            setProximosTurnos(agendaFutura.data as any || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useEffect(() => { fetchDashboardData(); }, []);

    const getActivityColor = (actividad: string) => {
        switch (actividad) {
            case 'Rehab': return { bg: '#DBEAFE', text: '#1E40AF' }; // Azul
            case 'Masaje': return { bg: '#F3E8FF', text: '#6B21A8' }; // Violeta
            default: return { bg: '#FEE2E2', text: '#991B1B' }; // Rojo
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} />}
        >

            {/* 1. HEADER COMPACTO CON FECHA */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.dashboardTitle}>Panel General</Text>
                    <Text style={styles.dateText}>{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</Text>
                </View>
                <View style={styles.headerBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Operativo</Text>
                </View>
            </View>

            {/* 2. STRIP DE MÉTRICAS (Fila Horizontal Densa) */}
            <View style={styles.kpiStrip}>
                <KPIItem label="Turnos Hoy" value={metrics.turnosHoy} icon={Calendar} color="#DC2626" bg="#FEF2F2" />
                <View style={styles.divider} />
                <KPIItem label="Disponibles" value={metrics.turnosLibres} icon={CheckCircle} color="#059669" bg="#ECFDF5" />
                <View style={styles.divider} />
                <KPIItem label="Clientes Activos" value={metrics.clientesActivos} icon={Users} color="#171717" bg="#F5F5F5" />
                <View style={styles.divider} />
                <KPIItem
                    label="Pagos Vencidos"
                    value={metrics.pagosVencidos}
                    icon={AlertCircle}
                    color={metrics.pagosVencidos > 0 ? "#DC2626" : "#171717"}
                    bg={metrics.pagosVencidos > 0 ? "#FEF2F2" : "#F5F5F5"}
                    isAlert={metrics.pagosVencidos > 0}
                    onPress={() => router.push('/(admin)/clientes')}
                />
            </View>

            {/* 3. LAYOUT PRINCIPAL (Split View) */}
            <View style={[styles.mainLayout, !isWideScreen && styles.mainLayoutColumn]}>

                {/* COLUMNA IZQUIERDA: AGENDA (70%) */}
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
                            {/* Encabezado de Tabla */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.th, { width: 60 }]}>HORA</Text>
                                <Text style={[styles.th, { flex: 1 }]}>CLIENTE</Text>
                                <Text style={[styles.th, { width: 100 }]}>ACTIVIDAD</Text>
                                <Text style={[styles.th, { width: 40 }]}></Text>
                            </View>

                            {proximosTurnos.length === 0 ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: '#A3A3A3' }}>No hay turnos próximos hoy.</Text>
                                </View>
                            ) : (
                                proximosTurnos.map((t, i) => {
                                    const colors = getActivityColor(t.actividad);
                                    return (
                                        <View key={t.id} style={[styles.tr, i === proximosTurnos.length - 1 && { borderBottomWidth: 0 }]}>
                                            <Text style={styles.timeCell}>{format(parseISO(t.fecha_hora_inicio), 'HH:mm')}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.clientCell}>{t.clientes?.nombre}</Text>
                                                <Text style={styles.planCell}>{t.clientes?.tipo_plan}</Text>
                                            </View>
                                            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                                                <Text style={[styles.badgeText, { color: colors.text }]}>{t.actividad}</Text>
                                            </View>
                                            <ChevronRight size={16} color="#D4D4D4" />
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}
                </View>

                {/* COLUMNA DERECHA: PANEL DE ACCIONES (30%) */}
                <View style={styles.rightColumn}>

                    {/* Tarjeta de Acciones Rápidas */}
                    <View style={styles.actionCard}>
                        <Text style={styles.sidebarTitle}>Acciones Rápidas</Text>

                        <Pressable style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                                <UserPlus size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.actionBtnText}>Registrar Cliente</Text>
                                <Text style={styles.actionBtnSub}>Nuevo socio</Text>
                            </View>
                        </Pressable>

                        <Pressable style={styles.actionBtn}>
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

// Subcomponente simple para los KPIs
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
    container: { flex: 1, backgroundColor: '#F3F4F6' }, // Gris un poco más oscuro para contraste
    scrollContent: { padding: 20 },

    // HEADER
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    dashboardTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
    dateText: { fontSize: 14, color: '#6B7280', textTransform: 'capitalize' },
    headerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
    liveText: { fontSize: 12, fontWeight: '700', color: '#047857' },

    // KPI STRIP (Barra horizontal compacta)
    kpiStrip: {
        flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 20,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2,
        alignItems: 'center', justifyContent: 'space-between'
    },
    kpiItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' },
    miniIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    divider: { width: 1, height: 30, backgroundColor: '#E5E7EB' },

    // MAIN LAYOUT
    mainLayout: { flexDirection: 'row', gap: 20 },
    mainLayoutColumn: { flexDirection: 'column' }, // Para móviles

    // COLUMNA IZQUIERDA
    leftColumn: { flex: 2.5, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    linkText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },

    // TABLA
    table: { width: '100%' },
    tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 10 },
    th: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 },
    tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    timeCell: { width: 60, fontSize: 14, fontWeight: '700', color: '#374151' },
    clientCell: { fontSize: 14, fontWeight: '600', color: '#111827' },
    planCell: { fontSize: 12, color: '#6B7280' },
    badge: { width: 80, paddingVertical: 4, borderRadius: 4, alignItems: 'center', marginRight: 10 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    // COLUMNA DERECHA (Panel)
    rightColumn: { flex: 1, gap: 20 },

    // Action Card
    actionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, elevation: 2 },
    sidebarTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
    actionBtnSub: { fontSize: 11, color: '#9CA3AF' },
});