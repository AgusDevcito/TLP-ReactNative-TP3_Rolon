import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useAlmacen } from '@/lib/almacen';

export default function Foto() {
  const { borrador } = useAlmacen();
  const camara = usePermiso('camara');
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [quiereSacar, setQuiereSacar] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<CameraView>(null);

  // Si la persona concedió la cámara desde la pantalla previa, abrir la cámara ahora.
  useEffect(() => {
    if (quiereSacar && camara.estado === 'concedido') {
      setQuiereSacar(false);
      setCamaraAbierta(true);
    }
  }, [quiereSacar, camara.estado]);

  const sacarFoto = () => {
    if (camara.estado === 'concedido') {
      setCamaraAbierta(true);
      return;
    }
    // Pantalla previa antes del diálogo del sistema (o la explicación de bloqueado).
    setQuiereSacar(true);
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
  };

  // Elegir de la galería usa el selector del sistema: no necesita permiso.
  const elegirDeGaleria = async () => {
    setError('');
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!r.canceled) actualizarBorrador({ fotoUri: r.assets[0].uri });
  };

  const tomar = async () => {
    try {
      const foto = await ref.current?.takePictureAsync({ quality: 0.7 });
      if (foto) actualizarBorrador({ fotoUri: foto.uri });
      setCamaraAbierta(false);
    } catch {
      setError('No se pudo sacar la foto. Probá de nuevo o elegí una de la galería.');
      setCamaraAbierta(false);
    }
  };

  if (camaraAbierta && camara.estado === 'concedido') {
    return (
      <View style={styles.flex}>
        <CameraView ref={ref} style={styles.flex} facing="back" />
        <View style={styles.barra}>
          <Boton titulo="Tomar foto" onPress={tomar} />
        </View>
      </View>
    );
  }

  return (
    <Pantalla>
      {borrador.fotoUri ? (
        <Image source={{ uri: borrador.fotoUri }} style={styles.foto} contentFit="cover" />
      ) : (
        <ThemedText themeColor="textSecondary">Todavía no adjuntaste ninguna foto.</ThemedText>
      )}
      <Boton titulo="Sacar foto" onPress={sacarFoto} />
      <Boton titulo="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />
      {error !== '' && <ThemedText style={{ color: '#DC2626' }}>{error}</ThemedText>}
      {borrador.fotoUri && <Boton titulo="Listo" variante="secundario" onPress={() => router.back()} />}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  foto: { width: '100%', height: 260, borderRadius: Spacing.three },
  barra: { position: 'absolute', bottom: Spacing.five, left: Spacing.four, right: Spacing.four },
});
