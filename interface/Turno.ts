import { AsistenciaTurno } from "./AsistenciaTurno";
import { TipoSesion } from "./TipoSesion";

export interface Turno {
  id: number;
  tipo_sesion_id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  created_at: string;

  tipo_sesion?: TipoSesion;
  asistentes?: AsistenciaTurno[];
}