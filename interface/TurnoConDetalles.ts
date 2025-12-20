export interface TurnoConDetalles {
    id: number;
    fecha_hora_inicio: string;
    tipo_sesion: {
        descripcion: string;
        color_hex: string;
    };
    asistencia_turnos: {
        clientes: {
            nombre: string;
        } | null;
    }[];
}