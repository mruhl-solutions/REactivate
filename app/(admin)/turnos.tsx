import { addDays, addWeeks, endOfDay, format, getHours, isSameDay, parseISO, setHours, startOfDay, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// --- 1. CONFIGURACIÓN Y TIPOS ---

const HORAS_OPERATIVAS = [7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20];

export interface Turno {
    id: string;
    fecha_hora_inicio: string; // ISO String
    actividad: 'Entrenamiento' | 'Rehabilitacion' | 'Masaje';
    asistio: boolean;
    clientes: {
        nombre: string;
    } | null;
}

const getSmartDate = (dayOffset: number, hour: number) => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const targetDay = addDays(startOfCurrentWeek, dayOffset);
    const targetDate = setHours(targetDay, hour);
    return targetDate.toISOString();
};

const MOCK_TURNOS: Turno[] = [
    {
        id: '1',
        fecha_hora_inicio: getSmartDate(0, 9), // Lunes 9:00
        actividad: 'Entrenamiento',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    },
    {
        id: '2',
        fecha_hora_inicio: getSmartDate(0, 14), // Lunes 14:00
        actividad: 'Rehabilitacion',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    },
    {
        id: '3',
        fecha_hora_inicio: getSmartDate(1, 10), // Martes 10:00
        actividad: 'Entrenamiento',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    },
    {
        id: '4',
        fecha_hora_inicio: getSmartDate(2, 16), // Miércoles 16:00
        actividad: 'Masaje',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    },
    {
        id: '5',
        fecha_hora_inicio: getSmartDate(3, 8), // Jueves 8:00
        actividad: 'Entrenamiento',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    },
    {
        id: '6',
        fecha_hora_inicio: getSmartDate(4, 18), // Viernes 18:00
        actividad: 'Rehabilitacion',
        asistio: true,
        clientes: { nombre: 'Matias Ruhl' }
    }
];

export default function TurnosScreen() {
    // Estado para controlar qué semana estamos viendo (siempre empieza en Lunes)
    const [lunesActual, setLunesActual] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 2. CARGA DE DATOS ---
    const fetchTurnosSemana = useCallback(async () => {
        setLoading(true);
        try {
            // --- MODO MOCK ACTIVADO ---
            // Simulamos un pequeño delay de red
            await new Promise(resolve => setTimeout(resolve, 600));

            // Filtramos los MOCK_TURNOS para que solo muestre los de la semana seleccionada
            // (Esto simula la query .gte .lte de Supabase)
            const inicioSemana = startOfDay(lunesActual);
            const finSemana = endOfDay(addDays(lunesActual, 4)); // Viernes

            const turnosFiltrados = MOCK_TURNOS.filter(t => {
                const fecha = parseISO(t.fecha_hora_inicio);
                return fecha >= inicioSemana && fecha <= finSemana;
            });

            setTurnos(turnosFiltrados);

            /* // --- CÓDIGO ORIGINAL SUPABASE (DESCOMENTAR CUANDO ESTÉS LISTO) ---
            const inicioSemanaISO = startOfDay(lunesActual).toISOString();
            const finSemanaISO = endOfDay(addDays(lunesActual, 4)).toISOString();

            const { data, error } = await supabase
                .from('turnos')
                .select(`
                  id,
                  fecha_hora_inicio,
                  actividad,
                  asistio,
                  clientes ( nombre )
                `)
                .gte('fecha_hora_inicio', inicioSemanaISO)
                .lte('fecha_hora_inicio', finSemanaISO);

            if (error) throw error;
            setTurnos(data as any); 
            */

        } catch (error: any) {
            Alert.alert('Error', 'No se pudieron cargar los turnos: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [lunesActual]);

    useEffect(() => {
        fetchTurnosSemana();
    }, [fetchTurnosSemana]);

    // --- 3. NAVEGACIÓN ENTRE SEMANAS ---
    const cambiarSemana = (direccion: 'prev' | 'next') => {
        setLunesActual(current =>
            direccion === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
        );
    };

    // --- 4. RENDERIZADO DE CELDAS ---

    // Función helper para encontrar el turno en una celda específica
    const getTurnoEnCelda = (dia: Date, hora: number) => {
        return turnos.find(t => {
            const fechaTurno = parseISO(t.fecha_hora_inicio);
            return isSameDay(fechaTurno, dia) && getHours(fechaTurno) === hora;
        });
    };

    // Función para obtener color según actividad
    const getColorActividad = (actividad: string) => {
        switch (actividad) {
            case 'Rehab': return { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' }; // Azul
            case 'Masaje': return { bg: '#F3E8FF', border: '#9333EA', text: '#6B21A8' }; // Violeta
            default: return { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' }; // Rojo (Entreno)
        }
    };

    // Generamos los 5 días de la semana (Lunes a Viernes)
    const diasSemana = Array.from({ length: 5 }).map((_, i) => addDays(lunesActual, i));

    return (
        <View style={styles.container}>

            {/* HEADER DE CONTROL */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agenda Semanal</Text>
                    <View style={styles.weekControls}>
                        <Pressable onPress={() => cambiarSemana('prev')} style={styles.iconBtn}>
                            <ChevronLeft size={20} color="#525252" />
                        </Pressable>

                        <View style={styles.dateDisplay}>
                            <CalendarIcon size={16} color="#737373" style={{ marginRight: 8 }} />
                            <Text style={styles.weekText}>
                                {format(lunesActual, "d MMM", { locale: es })} - {format(addDays(lunesActual, 4), "d MMM", { locale: es })}
                            </Text>
                        </View>

                        <Pressable onPress={() => cambiarSemana('next')} style={styles.iconBtn}>
                            <ChevronRight size={20} color="#525252" />
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
                    onPress={() => Alert.alert('Próximamente', 'Formulario de Creación de Turno')}
                >
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
                    {/* CABECERA DE DÍAS (Lun - Vie) */}
                    <View style={styles.gridHeaderRow}>
                        <View style={styles.timeColumnHeader} /> {/* Espacio vacío para la columna de hora */}
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

                                {/* COLUMNA DE HORA */}
                                <View style={styles.timeCell}>
                                    <Text style={styles.timeText}>{hora}:00</Text>
                                </View>

                                {/* CELDAS DE LOS DÍAS */}
                                {diasSemana.map((dia, index) => {
                                    const turno = getTurnoEnCelda(dia, hora);
                                    const estilos = turno ? getColorActividad(turno.actividad) : null;

                                    return (
                                        <View key={index} style={styles.cell}>
                                            {turno ? (
                                                <Pressable style={[styles.eventCard, { backgroundColor: estilos?.bg, borderColor: estilos?.border }]}>
                                                    <Text numberOfLines={1} style={[styles.eventTitle, { color: estilos?.text }]}>
                                                        {turno.clientes?.nombre || 'Cliente'}
                                                    </Text>
                                                    <Text style={[styles.eventType, { color: estilos?.text }]}>
                                                        {turno.actividad}
                                                    </Text>
                                                </Pressable>
                                            ) : (
                                                // Celda Vacía
                                                <Pressable
                                                    style={({ pressed }) => [styles.emptyCell, pressed && { backgroundColor: '#F5F5F5' }]}
                                                    onPress={() => Alert.alert('Crear', `Crear turno el ${format(dia, 'EEEE')} a las ${hora}:00`)}
                                                />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                        {/* Espacio extra al final del scroll */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

// --- 5. ESTILOS NATIVOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // HEADER
    header: {
        paddingTop: 40, // Espacio para status bar
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#171717',
    },
    weekControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    weekText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#171717',
        textTransform: 'capitalize',
    },
    iconBtn: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    addButton: {
        backgroundColor: '#DC2626',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },

    // GRILLA
    gridContainer: {
        flex: 1,
        padding: 8,
    },
    gridHeaderRow: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingBottom: 8,
    },
    timeColumnHeader: {
        width: 50, // Ancho fijo para la columna de horas
    },
    dayHeaderCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 10,
        color: '#737373',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 2,
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#171717',
    },

    // FILAS DE LA GRILLA
    gridRow: {
        flexDirection: 'row',
        height: 70, // Altura ajustada
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    timeCell: {
        width: 50,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 8,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
    },
    timeText: {
        fontSize: 11,
        color: '#737373',
        fontWeight: '500',
    },
    cell: {
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
        padding: 2,
    },
    emptyCell: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    // TARJETA DE EVENTO (TURNO)
    eventCard: {
        flex: 1,
        borderRadius: 4,
        padding: 4,
        borderLeftWidth: 3,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    eventType: {
        fontSize: 9,
        opacity: 0.8,
    },
});