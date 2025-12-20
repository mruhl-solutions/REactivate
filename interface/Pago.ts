import { Cliente } from "./Cliente";
import { TipoPlan } from "./TipoPlan";

export interface Pago {
  id: number;
  cliente_id: number;
  plan_id: number;
  monto: number;
  fecha_pago: string;
  mes_correspondiente: string;
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  created_at: string;

  // Relaciones
  cliente?: Cliente;
  plan?: TipoPlan;
}