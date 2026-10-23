import { useSyncExternalStore } from 'react';

import { programarAviso } from './notificaciones';
import { consultar } from './permisos';
import type { Posicion } from './ubicacion';

export type CategoriaReporte = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';

export const CATEGORIAS: CategoriaReporte[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaReporte;
  estado: EstadoReporte;
  fotoUri?: string;
  /** Coordenadas, solo si la ubicación se concedió con precisión suficiente. */
  ubicacion?: Posicion;
  /** Sector elegido a mano (alternativa si se deniega la ubicación). */
  sector?: string;
  creado: number;
};

export type Aviso = { id: string; titulo: string; cuerpo: string; fecha: number };

/** Reporte en edición: lo comparten /reporte/nuevo, escanear, foto y ubicacion. */
export type Borrador = {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaReporte;
  fotoUri?: string;
  ubicacion?: Posicion;
  sector?: string;
};

const BORRADOR_VACIO: Borrador = { titulo: '', descripcion: '', aula: '', categoria: 'electricidad' };

type Datos = { reportes: Reporte[]; avisos: Aviso[]; avisosActivados: boolean; borrador: Borrador };

// Almacenamiento en memoria: se pierde al cerrar la app. Alcanza para el TP.
let datos: Datos = { reportes: [], avisos: [], avisosActivados: false, borrador: BORRADOR_VACIO };
const oyentes = new Set<() => void>();

function actualizar(cambio: Partial<Datos>) {
  datos = { ...datos, ...cambio };
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function useAlmacen(): Datos {
  return useSyncExternalStore(suscribir, () => datos);
}

export function obtenerReporte(id: string): Reporte | undefined {
  return datos.reportes.find((r) => r.id === id);
}

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function agregarReporte(r: Omit<Reporte, 'id' | 'estado' | 'creado'>): Reporte {
  const reporte: Reporte = { ...r, id: nuevoId(), estado: 'pendiente', creado: Date.now() };
  actualizar({ reportes: [reporte, ...datos.reportes] });
  return reporte;
}

export function agregarAviso(titulo: string, cuerpo: string) {
  const aviso: Aviso = { id: nuevoId(), titulo, cuerpo, fecha: Date.now() };
  actualizar({ avisos: [aviso, ...datos.avisos] });
}

export function actualizarBorrador(cambio: Partial<Borrador>) {
  actualizar({ borrador: { ...datos.borrador, ...cambio } });
}

export function limpiarBorrador() {
  actualizar({ borrador: BORRADOR_VACIO });
}

export function setAvisosActivados(valor: boolean) {
  actualizar({ avisosActivados: valor });
}

/**
 * Botón de prueba "Simular resolución": marca el reporte como resuelto y avisa.
 * Con permiso de notificaciones, programa una notificación local a los 10 segundos.
 * Sin permiso, el aviso queda solo en la bandeja `/avisos`.
 */
export async function simularResolucion(id: string): Promise<'notificacion' | 'bandeja'> {
  const reporte = obtenerReporte(id);
  if (!reporte) return 'bandeja';

  actualizar({
    reportes: datos.reportes.map((r) => (r.id === id ? { ...r, estado: 'resuelto' as const } : r)),
  });

  const titulo = 'Reporte resuelto';
  const cuerpo = `Se resolvió: ${reporte.titulo} (${reporte.aula}).`;

  const permiso = await consultar('notificaciones');
  if (datos.avisosActivados && permiso.granted) {
    await programarAviso(titulo, cuerpo, 10);
    // Además queda registrado en la bandeja.
    agregarAviso(titulo, cuerpo);
    return 'notificacion';
  }
  agregarAviso(titulo, cuerpo);
  return 'bandeja';
}


