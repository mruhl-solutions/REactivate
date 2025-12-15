export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  fecha_pago_mes: string;
  tipo_plan: 'Mensual' | 'Trimestral' | 'Clase Suelta';
  notas_medicas?: string;
  created_at: string;
}