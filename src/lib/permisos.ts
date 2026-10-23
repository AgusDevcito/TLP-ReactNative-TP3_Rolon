import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { asegurarCanalReportes, cargarNotificaciones } from './notificaciones';

/** Recursos protegidos que usa la app. Las fotos de la galería no figuran: usan el selector del sistema, sin permiso. */
/** Valor de IosAuthorizationStatus.PROVISIONAL de expo-notifications. */
const IOS_PROVISIONAL = 3;

/** Respuesta para cuando el módulo de notificaciones no existe (Expo Go): no se puede pedir ni cambiar. */
const NO_DISPONIBLE = { status: 'denied', granted: false, canAskAgain: false, expires: 'never' } as const;

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones';

export const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones'];

/** Los cuatro estados que ve la interfaz. */
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

/** Forma mínima común a todas las respuestas de permisos de Expo. */
export type Respuesta = {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
} | null;

/**
 * Traduce una respuesta de Expo a uno de los cuatro estados.
 * Decide con dos campos: `granted` (¿ya lo tengo?) y `canAskAgain` (¿puede aparecer el diálogo?).
 */
export function aEstado(respuesta: Respuesta): EstadoPermiso {
  if (respuesta === null) return 'cargando';
  if (respuesta.granted) return 'concedido';
  if (respuesta.canAskAgain) return 'preguntable';
  return 'bloqueado';
}

/**
 * Matiz de un permiso concedido: ubicación aproximada (Android) o notificaciones provisionales (iOS).
 * Las fotos limitadas no aplican: la app no pide acceso a la galería.
 */
export function esParcial(recurso: Recurso, respuesta: Respuesta): boolean {
  if (!respuesta || !respuesta.granted) return false;
  const r = respuesta as any;
  if (recurso === 'ubicacion') return r.android?.accuracy === 'coarse';
  if (recurso === 'notificaciones') {
    return Platform.OS === 'ios' && r.ios?.status === IOS_PROVISIONAL;
  }
  return false;
}

/** Consulta el estado actual. Nunca muestra un diálogo. */
export async function consultar(recurso: Recurso): Promise<NonNullable<Respuesta>> {
  switch (recurso) {
    case 'camara':
      return Camera.getCameraPermissionsAsync();
    case 'ubicacion':
      return Location.getForegroundPermissionsAsync();
    case 'notificaciones':
      return cargarNotificaciones()?.getPermissionsAsync() ?? NO_DISPONIBLE;
  }
}

/** Pide el permiso. Puede mostrar el diálogo del sistema; llamarla solo desde un toque de la persona. */
export async function solicitar(recurso: Recurso): Promise<NonNullable<Respuesta>> {
  switch (recurso) {
    case 'camara':
      return Camera.requestCameraPermissionsAsync();
    case 'ubicacion':
      return Location.requestForegroundPermissionsAsync();
    case 'notificaciones':
      // En Android 13+ el diálogo no aparece si todavía no existe un canal.
      await asegurarCanalReportes();
      return cargarNotificaciones()?.requestPermissionsAsync() ?? NO_DISPONIBLE;
  }
}

export const NOMBRES: Record<Recurso, string> = {
  camara: 'Cámara',
  ubicacion: 'Ubicación',
  notificaciones: 'Notificaciones',
};

/** Beneficio en una frase, para la pantalla previa al diálogo del sistema. */
export const BENEFICIOS: Record<Recurso, string> = {
  camara: 'Usamos la cámara para leer el QR del aula y sacar la foto del desperfecto.',
  ubicacion: 'Usamos tu ubicación para marcar en qué sector del instituto está el desperfecto.',
  notificaciones: 'Te avisamos cuando se resuelva tu reporte.',
};

/** Qué pasa si la persona no lo concede (se muestra en la pantalla previa y en el panel). */
export const ALTERNATIVAS: Record<Recurso, string> = {
  camara: 'Podés escribir el código del aula a mano o elegir la foto desde la galería.',
  ubicacion: 'Podés elegir el sector a mano.',
  notificaciones: 'Los avisos aparecen en la bandeja de la app.',
};

/** Ruta de Ajustes del sistema, por plataforma. */
export function caminoAjustes(recurso: Recurso): string {
  const nombre = NOMBRES[recurso];
  return Platform.OS === 'ios'
    ? `Ajustes > Mantenimiento IPF > ${nombre}`
    : `Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > ${nombre}`;
}

