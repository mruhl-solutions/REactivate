import { Cliente } from '@/interface/Cliente';
import { Turno } from '@/interface/Turno';
import { format } from 'date-fns';
import { Activity, CheckCircle, Clock, Dumbbell, Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// Definimos la paleta de colores aquí o impórtala de tu archivo de constantes
const COLORS = {
    reactivate: '#E63946', // Rojo
    black: '#1D1D1D',      // Negro
    gray: '#F1FAEE',       // Fondo claro
    textDark: '#333333',
    textLight: '#888888',
    white: '#FFFFFF',
    success: '#4CAF50',    // Verde para asistencias
};

interface TurnoWithCliente extends Turno {
    cliente: Cliente;
}

interface TurnoCardProps {
    turno: TurnoWithCliente;
    onCheckIn: (id: string) => void;
}

export const TurnoCard = ({ turno, onCheckIn }: TurnoCardProps) => {
    const isCompleted = turno.asistio;

    // Configuración dinámica según actividad
    const getActivityConfig = (actividad: string) => {
        switch (actividad) {
            case 'Entreno':
                return {
                    color: COLORS.reactivate,
                    icon: Dumbbell,
                    label: 'ENTRENO'
                };
            case 'Rehab':
                return {
                    color: COLORS.black,
                    icon: Activity,
                    label: 'REHAB'
                };
            case 'Masaje':
                return {
                    color: '#666666',
                    icon: Sparkles,
                    label: 'MASAJE'
                };
            default:
                return {
                    color: '#CCCCCC',
                    icon: Clock,
                    label: 'OTRO'
                };
        }
    };

    const config = getActivityConfig(turno.actividad);
    const IconComponent = config.icon;

    return (
        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
            {/* 1. Barra Lateral de Color (Indicador) */}
            <View style={[styles.colorStrip, { backgroundColor: config.color }]} />

            {/* 2. Contenido Principal */}
            <View style={styles.contentContainer}>

                {/* Hora */}
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                        {format(new Date(turno.fecha_hora_inicio), 'HH:mm')}
                    </Text>
                    <Text style={styles.endTimeText}>
                        {format(new Date(turno.fecha_hora_fin), 'HH:mm')}
                    </Text>
                </View>

                {/* Datos del Cliente y Actividad */}
                <View style={styles.infoContainer}>
                    <View style={styles.badgeContainer}>
                        <IconComponent size={14} color={config.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.activityLabel, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>

                    <Text style={[styles.clientName, isCompleted && styles.textStrikethrough]} numberOfLines={1}>
                        {turno.cliente.nombre}
                    </Text>

                    <Text style={styles.planText} numberOfLines={1}>
                        {turno.cliente.tipo_plan || 'Sin plan'}
                    </Text>
                </View>

                {/* 3. Botón de Acción (Check-in) */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onCheckIn(turno.id)}
                    disabled={isCompleted}
                >
                    <CheckCircle
                        size={28}
                        color={isCompleted ? COLORS.success : '#E0E0E0'}
                        // Si no está completo, rellenamos o dejamos borde según prefieras
                        fill={isCompleted ? COLORS.success : 'transparent'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ESTILOS NATIVOS (Sin Tailwind)
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 16, // Márgenes laterales para que no pegue al borde de la pantalla
        height: 90,
        overflow: 'hidden', // Para que la barra lateral respete el radio del borde
        // Sombras (Elevation para Android, Shadow para iOS)
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardCompleted: {
        opacity: 0.6,
        backgroundColor: '#FAFAFA',
    },
    colorStrip: {
        width: 6,
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    timeContainer: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        marginRight: 12,
    },
    timeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    endTimeText: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4, // Espacio entre elementos verticales
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityLabel: {
        fontSize: 10,
        fontWeight: '800', // Extra bold
        letterSpacing: 0.5,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    textStrikethrough: {
        textDecorationLine: 'line-through',
        color: COLORS.textLight,
    },
    planText: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    actionButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});