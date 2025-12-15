import { Cliente } from "./Cliente";

export interface Turno {
  id: string;
  cliente_id: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  actividad: 'Entreno' | 'Rehabilitacion' | 'Masaje';
  asistio: boolean;
  clientes?: Cliente; 
}