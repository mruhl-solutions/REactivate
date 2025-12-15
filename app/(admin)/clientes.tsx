import { supabase } from '@/core/supabase';
import { useRouter } from 'expo-router';
import { AlertCircle, Calendar, CheckCircle, Phone, Plus, Search, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

// --- 1. INTERFACES (Tipado fuerte) ---
export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    tipo_plan: string;
    fecha_pago_mes: string; // Formato YYYY-MM-DD
    notas_medicas?: string;
    created_at: string;
}

export default function ClientesScreen() {
    const router = useRouter();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- 2. LÓGICA DE DATOS ---
    const fetchClientes = useCallback(async () => {
        try {
            // Si es un refresh manual, no mostramos el spinner de carga completa
            if (!refreshing) setLoading(true);

            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nombre', { ascending: true }); // Orden alfabético

            if (error) throw error;

            setClientes(data || []);
        } catch (error: any) {
            Alert.alert('Error', 'No se pudieron cargar los clientes: ' + error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    // Cargar al montar el componente
    useEffect(() => {
        fetchClientes();
    }, []);

    // Función para refresh manual (pull to refresh)
    const onRefresh = () => {
        setRefreshing(true);
        fetchClientes();
    };

    // --- 3. HELPER: Calcular Estado del Pago ---
    const getEstadoPago = (fechaVencimiento: string) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);

        // Si la fecha es inválida o no existe
        if (!fechaVencimiento) return { texto: 'Sin datos', color: '#9CA3AF', bg: '#F3F4F6' };

        // Comparamos fechas
        if (vencimiento < hoy) {
            return { texto: 'Vencido', color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle };
        } else {
            return { texto: 'Al día', color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle };
        }
    };

    // --- 4. COMPONENTE DE TARJETA (RenderItem) ---
    const renderItem = ({ item }: { item: Cliente }) => {
        const estado = getEstadoPago(item.fecha_pago_mes);
        const StatusIcon = estado.icon || AlertCircle;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    {/* Avatar Placeholder y Nombre */}
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <User size={20} color="#525252" />
                        </View>
                        <View>
                            <Text style={styles.userName}>{item.nombre}</Text>
                            <Text style={styles.userPlan}>{item.tipo_plan || 'Sin plan'}</Text>
                        </View>
                    </View>

                    {/* Badge de Estado */}
                    <View style={[styles.badge, { backgroundColor: estado.bg }]}>
                        <StatusIcon size={12} color={estado.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: estado.color }]}>{estado.texto}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Phone size={14} color="#9CA3AF" />
                        <Text style={styles.footerText}>{item.telefono || 'Sin teléfono'}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Calendar size={14} color="#9CA3AF" />
                        <Text style={styles.footerText}>Vence: {item.fecha_pago_mes || 'N/A'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    // --- 5. RENDER PRINCIPAL ---
    return (
        <View style={styles.container}>

            {/* HEADER DE LA VISTA */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Clientes</Text>
                    <Text style={styles.subtitle}>Gestiona tu base de alumnos</Text>
                </View>

                {/* BOTÓN NUEVO CLIENTE (Sin acción por ahora) */}
                <Pressable
                    style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
                    onPress={() => Alert.alert('Próximamente', 'Aquí abriremos el formulario de carga.')}
                >
                    <Plus size={20} color="white" />
                    <Text style={styles.addButtonText}>Nuevo Cliente</Text>
                </Pressable>
            </View>

            {/* LISTA DE CLIENTES */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#DC2626" />
                </View>
            ) : (
                <FlatList
                    data={clientes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Search size={48} color="#D4D4D4" />
                            <Text style={styles.emptyText}>No hay clientes registrados aún.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

// --- 6. ESTILOS NATIVOS (Sin Tailwind) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Gris claro de fondo
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Header
    header: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#171717',
    },
    subtitle: {
        fontSize: 14,
        color: '#737373',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#DC2626', // Rojo REactivate
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    // Lista
    listContent: {
        padding: 24,
    },
    // Card Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#171717',
    },
    userPlan: {
        fontSize: 12,
        color: '#737373',
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    // Badge de estado
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        gap: 16, // Espacio entre items del footer
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        color: '#737373',
        marginLeft: 4, // Polyfill manual para gap en versiones viejas
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#A3A3A3',
    },
});