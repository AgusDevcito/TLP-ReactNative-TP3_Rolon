import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlmacen, type EstadoReporte } from '@/lib/almacen';

const COLOR_ESTADO: Record<EstadoReporte, string> = {
  pendiente: '#D97706',
  'en curso': '#2563EB',
  resuelto: '#16A34A',
};

export default function Inicio() {
  const { reportes } = useAlmacen();

  return (
    <Pantalla>
      <Boton titulo="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />

      {reportes.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Todavía no cargaste ningún reporte. Tocá “Nuevo reporte” para informar un desperfecto.
        </ThemedText>
      ) : (
        reportes.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <ThemedView type="backgroundElement" style={styles.tarjeta}>
              <ThemedText type="smallBold">{r.titulo}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {r.aula} · {r.categoria}
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: COLOR_ESTADO[r.estado] }}>
                {r.estado}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
});
