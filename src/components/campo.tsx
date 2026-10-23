import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Campo(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[styles.campo, { color: theme.text, backgroundColor: theme.backgroundElement }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  campo: { padding: Spacing.three, borderRadius: Spacing.three, fontSize: 16 },
});
