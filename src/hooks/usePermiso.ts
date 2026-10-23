import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Linking } from 'react-native';

import {
  aEstado,
  consultar,
  esParcial,
  solicitar,
  type EstadoPermiso,
  type Recurso,
  type Respuesta,
} from '@/lib/permisos';

import { useRevisarAlVolver } from './useRevisarAlVolver';

export type UsoPermiso = {
  estado: EstadoPermiso;
  /** Ubicación aproximada o notificaciones provisionales. */
  parcial: boolean;
  /** Pide el permiso (puede mostrar el diálogo del sistema). Devuelve el estado resultante. */
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
  /** Vuelve a consultar sin mostrar diálogo. */
  revisar: () => Promise<void>;
};

// Espejo compartido de la última respuesta del sistema por recurso, para que todas las
// pantallas que usan el mismo permiso se enteren cuando una lo pide. No es la fuente de
// verdad: se vuelve a consultar al montar y cada vez que se vuelve de Ajustes.
const espejo: Partial<Record<Recurso, NonNullable<Respuesta>>> = {};
const oyentes = new Set<() => void>();

function guardar(recurso: Recurso, respuesta: NonNullable<Respuesta>) {
  espejo[recurso] = respuesta;
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/**
 * Hook unificado de permisos. Consulta al montar y al volver de Ajustes (AppState).
 * No pide nada por su cuenta: `pedir()` se llama solo desde un toque de la persona.
 */
export function usePermiso(recurso: Recurso): UsoPermiso {
  const respuesta = useSyncExternalStore(suscribir, () => espejo[recurso] ?? null);

  const revisar = useCallback(async () => {
    guardar(recurso, await consultar(recurso));
  }, [recurso]);

  const pedir = useCallback(async () => {
    const nueva = await solicitar(recurso);
    guardar(recurso, nueva);
    return aEstado(nueva);
  }, [recurso]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  useEffect(() => {
    revisar();
  }, [revisar]);

  useRevisarAlVolver(revisar);

  return {
    estado: aEstado(respuesta),
    parcial: esParcial(recurso, respuesta),
    pedir,
    abrirAjustes,
    revisar,
  };
}
