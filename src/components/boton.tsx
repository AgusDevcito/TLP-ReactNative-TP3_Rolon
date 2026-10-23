import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  cargando?: boolean;
  style?: ViewStyle;
};

export function Boton({ titulo, onPress, variante = 'primario', cargando, style }: Props) {
  const primario = variante === 'primario';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        pressed && styles.presionado,
        style,
      ]}>
      <View style={styles.fila}>
        {cargando && <ActivityIndicator color={primario ? '#fff' : '#208AEF'} />}
        <ThemedText type="smallBold" style={{ color: primario ? '#fff' : '#208AEF' }}>
          {titulo}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  primario: { backgroundColor: '#208AEF' },
  secundario: { borderWidth: 1.5, borderColor: '#208AEF' },
  presionado: { opacity: 0.7 },
  fila: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
});
