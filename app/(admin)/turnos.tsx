import { supabase } from '@/core/supabase';
import { TurnoConDetalles } from '@/interface/TurnoConDetalles';
import { addDays, addWeeks, endOfDay, format, getHours, isSameDay, parseISO, startOfDay, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const HORAS_OPERATIVAS = [7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20];

export default function TurnosScreen() {
    const [lunesActual, setLunesActual] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [turnos, setTurnos] = useState<TurnoConDetalles[]>([]);
    const [loading, setLoading] = useState(true);

    // --- CARGA DE DATOS DESDE SUPABASE ---
    const fetchTurnosSemana = useCallback(async () => {
        setLoading(true);
        try {
            const inicioSemanaISO = startOfDay(lunesActual).toISOString();
            const finSemanaISO = endOfDay(addDays(lunesActual, 4)).toISOString();

            const { data, error } = await supabase
                .from('turnos')
                .select(`
                    id,
                    fecha_hora_inicio,
                    tipo_sesion (
                        descripcion,
                        color_hex
                    ),
                    asistencia_turnos (
                        clientes ( nombre )
                    )
                `)
                .gte('fecha_hora_inicio', inicioSemanaISO)
                .lte('fecha_hora_inicio', finSemanaISO);

            if (error) throw error;
            setTurnos(data as any || []);
        } catch (error: any) {
            Alert.alert('Error', 'No se pudieron cargar los turnos: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [lunesActual]);

    useEffect(() => {
        fetchTurnosSemana();
    }, [fetchTurnosSemana]);

    // --- NAVEGACIÓN ---
    const cambiarSemana = (direccion: 'prev' | 'next') => {
        setLunesActual(current => direccion === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1));
    };

    const getTurnoEnCelda = (dia: Date, hora: number) => {
        return turnos.find(t => {
            const fechaTurno = parseISO(t.fecha_hora_inicio);
            return isSameDay(fechaTurno, dia) && getHours(fechaTurno) === hora;
        });
    };

    const diasSemana = Array.from({ length: 5 }).map((_, i) => addDays(lunesActual, i));

    return (
        <View style={styles.container}>
            {/* HEADER DE CONTROL */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.brandText}>REactivate</Text>
                    <Text style={styles.title}>Agenda Semanal</Text>
                    <View style={styles.weekControls}>
                        <Pressable onPress={() => cambiarSemana('prev')} style={styles.iconBtn}>
                            <ChevronLeft size={20} color="#000" />
                        </Pressable>

                        <View style={styles.dateDisplay}>
                            <CalendarIcon size={14} color="#737373" style={{ marginRight: 6 }} />
                            <Text style={styles.weekText}>
                                {format(lunesActual, "d MMM", { locale: es })} - {format(addDays(lunesActual, 4), "d MMM", { locale: es })}
                            </Text>
                        </View>

                        <Pressable onPress={() => cambiarSemana('next')} style={styles.iconBtn}>
                            <ChevronRight size={20} color="#000" />
                        </Pressable>
                    </View>
                </View>

                <Pressable style={styles.addButton} onPress={() => {}}>
                    <Plus size={20} color="white" />
                    <Text style={styles.addButtonText}>Nuevo</Text>
                </Pressable>
            </View>

            {/* GRILLA DE CALENDARIO */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#DC2626" />
                </View>
            ) : (
                <View style={styles.gridContainer}>
                    {/* CABECERA DÍAS */}
                    <View style={styles.gridHeaderRow}>
                        <View style={styles.timeColumnHeader} />
                        {diasSemana.map((dia, index) => (
                            <View key={index} style={styles.dayHeaderCell}>
                                <Text style={styles.dayName}>{format(dia, 'EEE', { locale: es })}</Text>
                                <Text style={styles.dayNumber}>{format(dia, 'd')}</Text>
                            </View>
                        ))}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {HORAS_OPERATIVAS.map((hora) => (
                            <View key={hora} style={styles.gridRow}>
                                <View style={styles.timeCell}>
                                    <Text style={styles.timeText}>{hora}:00</Text>
                                </View>

                                {diasSemana.map((dia, index) => {
                                    const turno = getTurnoEnCelda(dia, hora);
                                    const colorBase = turno?.tipo_sesion.color_hex || '#000000';
                                    
                                    return (
                                        <View key={index} style={styles.cell}>
                                            {turno ? (
                                                <Pressable 
                                                    style={[
                                                        styles.eventCard, 
                                                        { 
                                                            borderLeftColor: colorBase,
                                                            backgroundColor: colorBase + '25', // 15% de opacidad para el efecto difuminado
                                                        }
                                                    ]}
                                                >
                                                    <ScrollView style={styles.clientList} scrollEnabled={false}>
                                                        {turno.asistencia_turnos.map((asistencia, idx) => (
                                                            <Text key={idx} numberOfLines={1} style={styles.eventTitle}>
                                                                • {asistencia.clientes?.nombre}
                                                            </Text>
                                                        ))}
                                                    </ScrollView>
                                                    
                                                    <View style={[styles.typeBadge, { backgroundColor: colorBase }]}>
                                                        <Text style={styles.typeBadgeText}>
                                                            {turno.tipo_sesion.descripcion.split(' ')[0]}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            ) : (
                                                <Pressable style={styles.emptyCell} onPress={() => {}} />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    brandText: { fontSize: 10, fontWeight: '900', color: '#DC2626', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    title: { fontSize: 24, fontWeight: '800', color: '#000' },
    weekControls: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
    dateDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    weekText: { fontSize: 13, fontWeight: '700', color: '#000', textTransform: 'capitalize' },
    iconBtn: { padding: 6, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
    addButton: { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
    addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },
    
    // GRILLA
    gridContainer: { flex: 1, paddingHorizontal: 4 },
    gridHeaderRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
    timeColumnHeader: { width: 45 },
    dayHeaderCell: { flex: 1, alignItems: 'center' },
    dayName: { fontSize: 10, color: '#A3A3A3', textTransform: 'uppercase', fontWeight: '700' },
    dayNumber: { fontSize: 18, fontWeight: '800', color: '#000', marginTop: 2 },
    
    gridRow: { flexDirection: 'row', height: 95, borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
    timeCell: { width: 45, alignItems: 'center', paddingTop: 12 },
    timeText: { fontSize: 11, color: '#A3A3A3', fontWeight: '600' },
    cell: { flex: 1, padding: 3, borderRightWidth: 1, borderRightColor: '#F9F9F9' },
    emptyCell: { flex: 1 },
    
    // TARJETA DE TURNO (DIFUMINADA)
    eventCard: { 
        flex: 1, 
        borderRadius: 8, 
        padding: 6, 
        borderLeftWidth: 5, 
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    clientList: { flex: 1 },
    eventTitle: { 
        fontSize: 10, 
        fontWeight: '700', 
        color: '#1A1A1A', 
        lineHeight: 13,
        marginBottom: 2 
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    typeBadgeText: { 
        fontSize: 8, 
        fontWeight: '900', 
        color: '#FFF', 
        textTransform: 'uppercase' 
    },
});