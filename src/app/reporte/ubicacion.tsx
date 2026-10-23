import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useAlmacen } from '@/lib/almacen';
import { ALTERNATIVAS } from '@/lib/permisos';
import { obtenerUbicacion } from '@/lib/ubicacion';

export const SECTORES = ['Patio', 'Estacionamiento', 'Pasillo', 'Entrada', 'Baños', 'Biblioteca'];

export default function Ubicacion() {
  const { borrador } = useAlmacen();
  const permiso = usePermiso('ubicacion');
  const [buscando, setBuscando] = useState(false);
  const [quiereUsar, setQuiereUsar] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const marcar = async () => {
    setBuscando(true);
    setMensaje('');
    const pos = await obtenerUbicacion();
    setBuscando(false);
    if (pos) actualizarBorrador({ ubicacion: pos });
    else setMensaje('No pudimos leer tu ubicación. Elegí el sector a mano.');
  };

  // Si la persona concedió la ubicación desde la pantalla previa, marcarla ahora.
  useEffect(() => {
    if (quiereUsar && permiso.estado === 'concedido') {
      setQuiereUsar(false);
      marcar();
    }
  }, [quiereUsar, permiso.estado]);

  const usarUbicacion = () => {
    if (permiso.estado === 'concedido') {
      marcar();
      return;
    }
    setQuiereUsar(true);
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'ubicacion' } });
  };

  const u = borrador.ubicacion;

  return (
    <Pantalla>
      <Boton titulo="Usar mi ubicación actual" onPress={usarUbicacion} cargando={buscando} />

      {u &&
        (u.aproximada ? (
          // Aproximada: no se muestran coordenadas exactas.
          <ThemedText>Ubicación aproximada</ThemedText>
        ) : (
          <ThemedText>
            Ubicación marcada: {u.latitud.toFixed(5)}, {u.longitud.toFixed(5)}
          </ThemedText>
        ))}
      {mensaje !== '' && <ThemedText themeColor="textSecondary">{mensaje}</ThemedText>}
      {permiso.estado !== 'concedido' && permiso.estado !== 'cargando' && (
        <ThemedText type="small" themeColor="textSecondary">
          {ALTERNATIVAS.ubicacion}
        </ThemedText>
      )}

      <ThemedText type="smallBold">Sector del problema</ThemedText>
      <View style={styles.fila}>
        {SECTORES.map((s) => {
          const activo = borrador.sector === s;
          return (
            <Pressable
              key={s}
              onPress={() => actualizarBorrador({ sector: activo ? undefined : s })}
              style={[styles.chip, activo && styles.chipActivo]}>
              <ThemedText type="smallBold" style={{ color: activo ? '#fff' : '#208AEF' }}>
                {s}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Boton titulo="Listo" variante="secundario" onPress={() => router.back()} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#208AEF',
  },
  chipActivo: { backgroundColor: '#208AEF' },
});
