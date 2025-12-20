import { Cliente } from "./Cliente";

export interface AsistenciaTurno {
  id: number;
  turno_id: number;
  cliente_id: number;
  asistio: boolean;
  created_at: string;

  cliente?: Cliente;
}