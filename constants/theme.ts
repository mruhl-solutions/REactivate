import { StyleSheet } from "react-native";

export const COLORS = {
  primary: '#DC2626',      // Rojo Marca (Acciones principales)
  secondary: '#111827',    // Negro (Textos fuertes, fondos oscuros)
  background: '#F9FAFB',   // Gris muy claro (Fondos de pantalla)
  surface: '#FFFFFF',      // Blanco (Tarjetas, Inputs)
  text: '#374151',         // Gris oscuro (Texto párrafo)
  textLight: '#9CA3AF',    // Gris claro (Placeholders, subtítulos)
  border: '#E5E7EB',       // Líneas divisorias
  success: '#10B981',      // Verdes
  textGray: '#6B7280',   // Texto secundario
  textDark: '#111827',   // Texto principal
  warning: '#F59E0B',      // Amarillos
  danger: '#EF4444',       // Rojos de error
  black: '#1D1D1D',      // Negro fondo
  white: '#FFFFFF',
  reactivate: '#E63946',
};

export const GLOBAL_STYLES = StyleSheet.create({
  shadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  }
});