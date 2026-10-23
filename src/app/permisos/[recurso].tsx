import { router, useLocalSearchParams } from 'expo-router';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { PrevioPermiso } from '@/components/previo-permiso';
import { ThemedText } from '@/components/themed-text';
import { RECURSOS, type Recurso } from '@/lib/permisos';

function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && (RECURSOS as string[]).includes(valor);
}

/** Pantalla previa (modal) al diálogo del sistema. */
export default function PantallaPrevia() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();

  if (!esRecurso(recurso)) {
    return (
      <Pantalla sinEncabezado>
        <ThemedText type="subtitle">Permiso desconocido</ThemedText>
        <ThemedText>El recurso “{String(recurso)}” no existe.</ThemedText>
        <Boton titulo="Volver" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  return (
    <Pantalla sinEncabezado>
      <PrevioPermiso recurso={recurso} alTerminar={() => router.back()} />
    </Pantalla>
  );
}
