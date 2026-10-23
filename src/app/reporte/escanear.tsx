import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Pantalla } from '@/components/pantalla';
import { PrevioPermiso } from '@/components/previo-permiso';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador } from '@/lib/almacen';
import { ALTERNATIVAS } from '@/lib/permisos';

/** Escáner de QR con los cuatro estados del permiso de cámara. */
export default function Escanear() {
  const { estado } = usePermiso('camara');
  const [codigo, setCodigo] = useState('');
  const leido = useRef(false);

  const usarCodigo = (valor: string) => {
    const aula = valor.trim();
    if (!aula) return;
    actualizarBorrador({ aula });
    router.back();
  };

  // 1) cargando
  if (estado === 'cargando') {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // 2) concedido
  if (estado === 'concedido') {
    return (
      <View style={styles.flex}>
        <CameraView
          style={styles.flex}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (leido.current) return;
            leido.current = true;
            usarCodigo(data);
          }}
        />
        <ThemedText type="small" style={styles.guia}>
          Apuntá al QR pegado en la puerta del aula.
        </ThemedText>
      </View>
    );
  }

  // 3) preguntable  y  4) bloqueado: explicación con "Continuar" o aviso con "Abrir Ajustes",
  // más el camino alternativo: escribir el código del aula a mano.
  return (
    <Pantalla>
      <PrevioPermiso recurso="camara" />
      <ThemedText type="smallBold">Sin cámara</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {ALTERNATIVAS.camara}
      </ThemedText>
      <Campo placeholder="Código del aula" value={codigo} onChangeText={setCodigo} />
      <Boton titulo="Usar este código" variante="secundario" onPress={() => usarCodigo(codigo)} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guia: {
    position: 'absolute',
    bottom: Spacing.five,
    alignSelf: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
});
