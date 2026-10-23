import { router } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { notificacionesDisponibles } from '@/lib/notificaciones';
import { ALTERNATIVAS, NOMBRES, RECURSOS, type EstadoPermiso, type Recurso } from '@/lib/permisos';

const TEXTO_ESTADO: Record<EstadoPermiso, string> = {
  cargando: 'Consultando…',
  concedido: 'Concedido',
  preguntable: 'Sin decidir: se puede pedir',
  bloqueado: 'Bloqueado: hay que habilitarlo en Ajustes',
};

const COLOR_ESTADO: Record<EstadoPermiso, string> = {
  cargando: '#6B7280',
  concedido: '#16A34A',
  preguntable: '#D97706',
  bloqueado: '#DC2626',
};

function matiz(recurso: Recurso): string {
  if (recurso === 'ubicacion') return 'Ubicación aproximada: no se muestran coordenadas exactas.';
  return 'Notificaciones provisionales (se entregan sin sonido, en silencio).';
}

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, parcial, abrirAjustes } = usePermiso(recurso);

  // En Expo Go no existe el módulo nativo de notificaciones: no es un bloqueo del usuario.
  if (recurso === 'notificaciones' && !notificacionesDisponibles()) {
    return (
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <ThemedText type="smallBold">
          {NOMBRES[recurso]} · {Platform.OS}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: COLOR_ESTADO.cargando }}>
          No disponible en Expo Go
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Se prueban en una development build. Mientras tanto, los avisos aparecen en la bandeja de la app.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.tarjeta}>
      <ThemedText type="smallBold">
        {NOMBRES[recurso]} · {Platform.OS}
      </ThemedText>
      <ThemedText type="smallBold" style={{ color: COLOR_ESTADO[estado] }}>
        {TEXTO_ESTADO[estado]}
      </ThemedText>
      {parcial && (
        <ThemedText type="small" themeColor="textSecondary">
          Parcial · {matiz(recurso)}
        </ThemedText>
      )}
      {estado !== 'concedido' && (
        <ThemedText type="small" themeColor="textSecondary">
          Si no lo concedés: {ALTERNATIVAS[recurso]}
        </ThemedText>
      )}
      {estado === 'preguntable' && (
        <Boton
          titulo="Pedir permiso"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      )}
      {estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />}
    </ThemedView>
  );
}

/** Panel con el estado de cada permiso. Se actualiza solo al volver de Ajustes. */
export default function Permisos() {
  return (
    <Pantalla>
      {RECURSOS.map((r) => (
        <FilaPermiso key={r} recurso={r} />
      ))}
      <ThemedText type="small" themeColor="textSecondary">
        Elegir una foto de la galería no necesita permiso: usa el selector del sistema.
      </ThemedText>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
});
