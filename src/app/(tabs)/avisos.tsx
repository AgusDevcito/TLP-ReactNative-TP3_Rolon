import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlmacen } from '@/lib/almacen';

/** Bandeja de avisos dentro de la app: alternativa cuando no hay permiso de notificaciones. */
export default function Avisos() {
  const { avisos } = useAlmacen();

  return (
    <Pantalla>
      <Boton titulo="Ajustes de la app" variante="secundario" onPress={() => router.push('/ajustes-app')} />

      {avisos.length === 0 ? (
        <ThemedText themeColor="textSecondary">No tenés avisos todavía.</ThemedText>
      ) : (
        avisos.map((a) => (
          <ThemedView key={a.id} type="backgroundElement" style={styles.tarjeta}>
            <ThemedText type="smallBold">{a.titulo}</ThemedText>
            <ThemedText type="small">{a.cuerpo}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(a.fecha).toLocaleString()}
            </ThemedText>
          </ThemedView>
        ))
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
});
