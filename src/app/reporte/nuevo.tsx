import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { actualizarBorrador, agregarReporte, CATEGORIAS, limpiarBorrador, useAlmacen } from '@/lib/almacen';

/** Formulario de reporte. No pide ningún permiso al abrirse: cada uno se pide al tocar su función. */
export default function NuevoReporte() {
  const { borrador } = useAlmacen();
  const [error, setError] = useState('');

  const guardar = () => {
    if (!borrador.titulo.trim() || !borrador.aula.trim()) {
      setError('Completá al menos el título y el aula.');
      return;
    }
    agregarReporte({
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim(),
      aula: borrador.aula.trim(),
      categoria: borrador.categoria,
      fotoUri: borrador.fotoUri,
      ubicacion: borrador.ubicacion,
      sector: borrador.sector,
    });
    limpiarBorrador();
    router.dismissTo('/');
  };

  return (
    <Pantalla>
      <Campo placeholder="Título" value={borrador.titulo} onChangeText={(titulo) => actualizarBorrador({ titulo })} />
      <Campo
        placeholder="Descripción"
        multiline
        value={borrador.descripcion}
        onChangeText={(descripcion) => actualizarBorrador({ descripcion })}
        style={styles.multilinea}
      />
      <Campo placeholder="Aula" value={borrador.aula} onChangeText={(aula) => actualizarBorrador({ aula })} />
      <Boton titulo="Escanear QR del aula" variante="secundario" onPress={() => router.push('/reporte/escanear')} />

      <ThemedText type="smallBold">Categoría</ThemedText>
      <View style={styles.fila}>
        {CATEGORIAS.map((c) => {
          const activa = borrador.categoria === c;
          return (
            <Pressable
              key={c}
              onPress={() => actualizarBorrador({ categoria: c })}
              style={[styles.chip, activa && styles.chipActivo]}>
              <ThemedText type="smallBold" style={{ color: activa ? '#fff' : '#208AEF' }}>
                {c}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Boton titulo="Adjuntar foto" variante="secundario" onPress={() => router.push('/reporte/foto')} />
      {borrador.fotoUri && <Image source={{ uri: borrador.fotoUri }} style={styles.foto} contentFit="cover" />}

      <Boton titulo="Marcar ubicación" variante="secundario" onPress={() => router.push('/reporte/ubicacion')} />
      {(borrador.sector || borrador.ubicacion) && (
        <ThemedText type="small" themeColor="textSecondary">
          {borrador.sector ? `Sector: ${borrador.sector}` : 'Ubicación marcada'}
          {borrador.ubicacion?.aproximada ? ' · aproximada' : ''}
        </ThemedText>
      )}

      {error !== '' && <ThemedText style={{ color: '#DC2626' }}>{error}</ThemedText>}
      <Boton titulo="Guardar reporte" onPress={guardar} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  multilinea: { minHeight: 90, textAlignVertical: 'top' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#208AEF',
  },
  chipActivo: { backgroundColor: '#208AEF' },
  foto: { width: '100%', height: 200, borderRadius: Spacing.three },
});
