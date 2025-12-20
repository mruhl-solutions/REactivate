import { Cliente } from "@/interface/Cliente";
import { Pago } from "@/interface/Pago";
import { Turno } from "@/interface/Turno";

export type NuevoCliente = Omit<Cliente, 'id' | 'created_at' | 'plan' | 'ultimo_pago'>;
export type NuevoPago = Omit<Pago, 'id' | 'created_at' | 'cliente' | 'plan'>;
export type NuevoTurno = Omit<Turno, 'id' | 'created_at' | 'tipo_sesion' | 'asistentes'>;