export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  plan_id: number;
  clases_disponibles: number;
  notas_medicas?: string;
  tipo_plan?: {
    nombre: string;
    clases_totales: number;
  };
}