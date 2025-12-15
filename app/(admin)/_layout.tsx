import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Sidebar } from '../../components/Sidebar';

export default function AdminLayout() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    return (
        <View style={styles.container}>
            {/* Contenedor Flex Horizontal */}
            <View style={styles.mainWrapper}>

                {/* COLUMNA IZQUIERDA: Sidebar Fijo */}
                {isDesktop && (
                    <View style={styles.sidebarContainer}>
                        <Sidebar />
                    </View>
                )}

                {/* COLUMNA DERECHA: Contenido Dinámico */}
                <View style={styles.contentContainer}>
                    {/* Slot renderiza index.tsx, clientes/index.tsx, turnos.tsx, etc. */}
                    {/* SIN TABS, SOLO CONTENIDO */}
                    <Slot />
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171717', // Fondo base oscuro
    },
    mainWrapper: {
        flex: 1,
        flexDirection: 'row', // Esto pone el Sidebar al lado del contenido
        height: '100%',
        backgroundColor: '#F5F5F5', // Fondo del área de trabajo
    },
    sidebarContainer: {
        width: 260, // Ancho fijo estándar
        height: '100%',
        backgroundColor: '#171717',
        borderRightWidth: 1,
        borderRightColor: '#262626',
        zIndex: 10,
    },
    contentContainer: {
        flex: 1, // Toma todo el espacio restante
        height: '100%',
        position: 'relative',
        overflow: 'hidden', // Evita scroll doble
    },
});