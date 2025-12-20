import { supabase } from '@/core/supabase';
import { Pago } from '@/interface/Pago';

export const clienteService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, planes(*)')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, planes(*), pagos(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const turnoService = {
  async getByDateRange(startIso: string, endIso: string) {
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        tipo_sesion (*),
        asistencia_turnos (
          id,
          asistio,
          clientes (id, nombre)
        )
      `)
      .gte('fecha_hora_inicio', startIso)
      .lte('fecha_hora_inicio', endIso)
      .order('fecha_hora_inicio', { ascending: true });

    if (error) throw error;
    return data;
  }
};

export const pagoService = {
  async registrarPago(pago: Omit<Pago, 'id' | 'created_at'>, clasesASumar: number) {
    const { data: nuevoPago, error: errorPago } = await supabase
      .from('pagos')
      .insert([pago])
      .select()
      .single();

    if (errorPago) throw errorPago;

    const { error: errorCliente } = await supabase.rpc('sumar_clases_cliente', {
      p_cliente_id: pago.cliente_id,
      p_cantidad: clasesASumar
    });

    if (errorCliente) {
      console.error("Error actualizando saldo de clases:", errorCliente);
    }

    return nuevoPago;
  },

  async getHistorialReciente(limit = 20) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, clientes(nombre), planes(nombre)')
      .order('fecha_pago', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

export const configService = {
  async getPlanes() {
    const { data, error } = await supabase.from('planes').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getTipoSesiones() {
    const { data, error } = await supabase.from('tipo_sesion').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  }
};