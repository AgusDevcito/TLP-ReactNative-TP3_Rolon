import * as Location from 'expo-location';

export type Posicion = {
  latitud: number;
  longitud: number;
  /** true si la ubicación es aproximada (Android: permiso coarse; iOS: precisión baja). */
  aproximada: boolean;
};

/** Si la precisión reportada es peor que esto (en metros), se considera aproximada. */
const UMBRAL_APROXIMADA_M = 1000;

/**
 * Devuelve las coordenadas actuales o `null` si no hay permiso o falla la lectura.
 * Nunca lanza: la app sigue funcionando con el sector elegido a mano.
 * No pide el permiso: eso lo hace el flujo con pantalla previa.
 */
export async function obtenerUbicacion(): Promise<Posicion | null> {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const aproximadaAndroid = permiso.android?.accuracy === 'coarse';
    const precision = pos.coords.accuracy ?? 0;

    return {
      latitud: pos.coords.latitude,
      longitud: pos.coords.longitude,
      aproximada: aproximadaAndroid || precision > UMBRAL_APROXIMADA_M,
    };
  } catch {
    return null;
  }
}
