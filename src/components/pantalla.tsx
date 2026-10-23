import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type Props = { children: ReactNode; sinEncabezado?: boolean };

/** Contenedor con scroll y márgenes. `sinEncabezado` agrega el margen superior de la zona segura (modales). */
export function Pantalla({ children, sinEncabezado }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={styles.fondo}>
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingTop: Spacing.four + (sinEncabezado ? insets.top : 0), paddingBottom: Spacing.six + insets.bottom },
        ]}>
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
