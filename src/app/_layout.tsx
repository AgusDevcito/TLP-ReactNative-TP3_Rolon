import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { cargarNotificaciones } from '@/lib/notificaciones';

// Registra el manejador de notificaciones (cómo se muestran con la app abierta). En Expo Go no hace nada.
cargarNotificaciones();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reporte" options={{ headerShown: false }} />
        <Stack.Screen name="ajustes-app" options={{ title: 'Ajustes de la app' }} />
        {/* Pantalla previa al diálogo del sistema: modal sin botón de cerrar. */}
        <Stack.Screen name="permisos/[recurso]" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

