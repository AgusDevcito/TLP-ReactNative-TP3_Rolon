import { useEffect, useRef, useState } from 'react';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { usePermiso } from '@/hooks/usePermiso';
import { BENEFICIOS, caminoAjustes, NOMBRES, type Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  /** Se llama al terminar el flujo (permiso concedido, o ya se mostró el diálogo). Opcional. */
  alTerminar?: () => void;
};

/**
 * Explicación previa al diálogo del sistema: beneficio en una frase y un único botón.
 * No tiene “Ahora no” ni “Cerrar” (pauta 5.1.1(iv) de Apple).
 * Si el permiso está bloqueado, el botón pasa a ser “Abrir Ajustes”.
 */
export function PrevioPermiso({ recurso, alTerminar }: Props) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const [pidiendo, setPidiendo] = useState(false);
  const terminado = useRef(false);

  const terminar = () => {
    if (terminado.current) return;
    terminado.current = true;
    alTerminar?.();
  };

  // Si el permiso ya está concedido (por ejemplo, al volver de Ajustes), no hay nada que explicar.
  useEffect(() => {
    if (estado === 'concedido') terminar();
  }, [estado]);

  const continuar = async () => {
    setPidiendo(true);
    await pedir();
    setPidiendo(false);
    terminar();
  };

  if (estado === 'bloqueado') {
    return (
      <>
        <ThemedText type="subtitle">{NOMBRES[recurso]} bloqueado</ThemedText>
        <ThemedText>{BENEFICIOS[recurso]}</ThemedText>
        <ThemedText themeColor="textSecondary">
          El permiso está bloqueado, así que el sistema ya no nos deja preguntarte. Para habilitarlo andá a:
        </ThemedText>
        <ThemedText type="smallBold">{caminoAjustes(recurso)}</ThemedText>
        <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      </>
    );
  }

  return (
    <>
      <ThemedText type="subtitle">{NOMBRES[recurso]}</ThemedText>
      <ThemedText>{BENEFICIOS[recurso]}</ThemedText>
      <ThemedText themeColor="textSecondary">
        Después te va a aparecer un aviso del sistema. Podés cambiar tu decisión cuando quieras desde Ajustes.
      </ThemedText>
      <Boton titulo="Continuar" onPress={continuar} cargando={pidiendo || estado === 'cargando'} />
    </>
  );
}
