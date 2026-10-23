import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { simularResolucion, useAlmacen } from '@/lib/almacen';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reportes } = useAlmacen();
  const [aviso, setAviso] = useState('');

  const reporte = reportes.find((r) => r.id === id);

  // Validar el id: mensaje si no existe.
  if (!reporte) {
    return (
      <Pantalla>
        <ThemedText type="subtitle">Reporte no encontrado</ThemedText>
        <ThemedText themeColor="textSecondary">No existe ningún reporte con el id “{String(id)}”.</ThemedText>
      </Pantalla>
    );
  }

  const simular = async () => {
    const via = await simularResolucion(reporte.id);
    setAviso(
      via === 'notificacion'
        ? 'Te va a llegar una notificación en unos 10 segundos. También quedó en Avisos.'
        : 'Quedó un aviso en la pestaña Avisos.',
    );
  };

  return (
    <Pantalla>
      <ThemedText type="subtitle">{reporte.titulo}</ThemedText>
      <ThemedText type="smallBold">Estado: {reporte.estado}</ThemedText>
      <ThemedText>
        {reporte.aula} · {reporte.categoria}
      </ThemedText>
      {reporte.descripcion !== '' && <ThemedText>{reporte.descripcion}</ThemedText>}
      {reporte.fotoUri && <Image source={{ uri: reporte.fotoUri }} style={styles.foto} contentFit="cover" />}
      <ThemedText themeColor="textSecondary">
        {reporte.sector
          ? `Sector: ${reporte.sector}`
          : reporte.ubicacion
            ? reporte.ubicacion.aproximada
              ? 'Ubicación aproximada'
              : `Ubicación: ${reporte.ubicacion.latitud.toFixed(5)}, ${reporte.ubicacion.longitud.toFixed(5)}`
            : 'Sin ubicación'}
      </ThemedText>
      {reporte.estado !== 'resuelto' && <Boton titulo="Simular resolución" onPress={simular} />}
      {aviso !== '' && <ThemedText themeColor="textSecondary">{aviso}</ThemedText>}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 220, borderRadius: Spacing.three },
});
