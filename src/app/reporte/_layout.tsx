import { Stack } from 'expo-router';

export default function ReporteLayout() {
  return (
    <Stack>
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo reporte' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear QR del aula' }} />
      <Stack.Screen name="foto" options={{ title: 'Foto del desperfecto' }} />
      <Stack.Screen name="ubicacion" options={{ title: 'Ubicación' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle del reporte' }} />
    </Stack>
  );
}
