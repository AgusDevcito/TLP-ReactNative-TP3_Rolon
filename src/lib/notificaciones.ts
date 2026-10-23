import { Platform } from 'react-native';

export const CANAL_REPORTES = 'reportes';

type ModuloNotificaciones = typeof import('expo-notifications');

let modulo: ModuloNotificaciones | null | undefined;

/**
 * Carga `expo-notifications` de forma segura. En Expo Go el módulo nativo no existe y
 * importarlo directamente tira la app abajo; acá devolvemos `null` y la app sigue andando
 * (los avisos quedan solo en la bandeja `/avisos`). En una development build carga normal.
 */
export function cargarNotificaciones(): ModuloNotificaciones | null {
  if (modulo !== undefined) return modulo;
  try {
    modulo = require('expo-notifications') as ModuloNotificaciones;
    modulo.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    modulo = null;
  }
  return modulo;
}

export function notificacionesDisponibles(): boolean {
  return cargarNotificaciones() !== null;
}

/** En Android hay que crear el canal antes de pedir el permiso. En iOS no hace nada. */
export async function asegurarCanalReportes(): Promise<void> {
  const N = cargarNotificaciones();
  if (!N || Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CANAL_REPORTES, {
    name: 'Reportes',
    importance: N.AndroidImportance.DEFAULT,
  });
}

/** Programa una notificación local a los `segundos` indicados. No hace nada si no hay módulo. */
export async function programarAviso(titulo: string, cuerpo: string, segundos = 10): Promise<void> {
  const N = cargarNotificaciones();
  if (!N) return;
  await asegurarCanalReportes();
  await N.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: segundos,
      channelId: CANAL_REPORTES,
    },
  });
}
