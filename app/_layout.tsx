import { Slot } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Sidebar } from '../components/Sidebar'; // Asegúrate que el Sidebar tampoco use Tailwind

export default function RootLayout() {
  const { width } = useWindowDimensions();
  // Definimos "Desktop" como cualquier pantalla mayor a 768px
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      
      {/* Contenedor Principal */}
      <View style={styles.mainContainer}>
        
        {/* Renderizado Condicional del Sidebar */}
        {isDesktop && (
          <View style={styles.sidebarContainer}>
            <Sidebar />
          </View>
        )}

        {/* Área de Contenido Dinámico */}
        <View style={styles.contentContainer}>
          <Slot screenOptions={{ headerShown: false }} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717', // Brand Dark
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row', // Disposición horizontal
    backgroundColor: '#F5F5F5',
  },
  sidebarContainer: {
    width: 260, // Ancho fijo del sidebar
    height: '100%',
    backgroundColor: '#171717',
    borderRightWidth: 1,
    borderRightColor: '#262626',
  },
  contentContainer: {
    flex: 1, // Ocupa el resto del espacio
    height: '100%',
    position: 'relative',
  },
});