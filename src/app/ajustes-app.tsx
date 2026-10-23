import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { setAvisosActivados, useAlmacen } from '@/lib/almacen';
import { notificacionesDisponibles } from '@/lib/notificaciones';
import { ALTERNATIVAS } from '@/lib/permisos';

export default function AjustesApp() {
  const { avisosActivados } = useAlmacen();
  const { estado } = usePermiso('notificaciones');
  const [quiereActivar, setQuiereActivar] = useState(false);
  const disponible = notificacionesDisponibles();

  // El interruptor solo está encendido si la persona lo quiere Y el permiso sigue concedido.
  const encendido = avisosActivados && estado === 'concedido';

  // Si se concedió el permiso después de tocar el interruptor, se activa recién ahora.
  useEffect(() => {
    if (quiereActivar && estado === 'concedido') {
      setAvisosActivados(true);
      setQuiereActivar(false);
    }
  }, [quiereActivar, estado]);

  const alternar = (valor: boolean) => {
    if (!valor) {
      setQuiereActivar(false);
      setAvisosActivados(false);
      return;
    }
    if (estado === 'concedido') {
      setAvisosActivados(true);
      return;
    }
    // El permiso se pide recién acá, al activar el interruptor, con pantalla previa.
    setQuiereActivar(true);
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
  };

  return (
    <Pantalla>
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <View style={styles.fila}>
          <ThemedText type="smallBold" style={styles.texto}>
            Avisarme cuando se resuelva mi reporte
          </ThemedText>
          <Switch value={encendido} onValueChange={alternar} disabled={!disponible} />
        </View>
        {!disponible && (
          <ThemedText type="small" themeColor="textSecondary">
            Las notificaciones no están disponibles en Expo Go; se prueban en una development build. Los avisos
            aparecen en la bandeja.
          </ThemedText>
        )}
        {estado === 'bloqueado' && (
          <ThemedText type="small" themeColor="textSecondary">
            Las notificaciones están bloqueadas. {ALTERNATIVAS.notificaciones}
          </ThemedText>
        )}
      </ThemedView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  texto: { flex: 1 },
});
