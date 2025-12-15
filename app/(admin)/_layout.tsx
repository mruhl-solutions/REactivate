import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Sidebar } from '../../components/Sidebar'; // Ajusta la ruta ../../

export default function AdminLayout() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>

                {/* El Sidebar solo existe en este contexto (admin) */}
                {isDesktop && (
                    <View style={styles.sidebarContainer}>
                        <Sidebar />
                    </View>
                )}

                {/* Contenido (Dashboard, Turnos, etc.) */}
                <View style={styles.contentContainer}>
                    <Slot />
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171717',
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
    },
    sidebarContainer: {
        width: 260,
        height: '100%',
        backgroundColor: '#171717',
        borderRightWidth: 1,
        borderRightColor: '#262626',
    },
    contentContainer: {
        flex: 1,
        height: '100%',
    },
});