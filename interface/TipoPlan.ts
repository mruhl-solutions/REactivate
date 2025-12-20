export interface TipoPlan {
  id: number;
  nombre: '1 Sesión' | '2 veces por semana' | '3 veces por semana';
  clases_totales: number;
  precio_sugerido: number;
}