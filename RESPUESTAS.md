# Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo
## Cuestionario Teórico y Ejercicios Prácticos (Partes A a F)

> **Carrera:** Tecnicatura Superior en Desarrollo de Software Multiplataforma  
> **Institución:** Instituto Politécnico Formosa (IPF)  
> **Cátedra:** Taller Complementario – React Native II  
> **Archivo de entrega:** `RESPUESTAS.md`  

---

# Parte A · ¿Qué es un permiso y por qué existe?

## A1. Conceptos

### a) ¿Qué es un permiso? ¿Qué papel cumplen la app, el sistema operativo y la persona usuaria?
Un **permiso** es un mecanismo de control de acceso y seguridad mediante el cual el sistema operativo restringe el acceso de una aplicación a recursos sensibles del dispositivo (hardware como cámara y GPS, o datos privados como contactos y fotos).
* **La App:** Es la solicitante. Declara de antemano qué recursos necesita y le pide al sistema operativo acceso a ellos en tiempo de ejecución solo cuando el usuario activa una función que lo requiere.
* **El Sistema Operativo (SO):** Es el guardián y árbitro imparcial. Gestiona la política de seguridad, muestra las ventanas de diálogo del sistema (inmunes a la manipulación de la app), registra las decisiones y bloquea o permite el flujo de datos.
* **La Persona Usuaria:** Es la dueña soberana de sus datos y de su dispositivo. Decide consciente y voluntariamente si concede, deniega, limita o revoca el acceso en cualquier momento.

### b) ¿Qué es la caja de arena (sandbox) y qué relación tiene con los permisos? ¿Qué puede hacer una app sin ningún permiso?
El **sandbox** (caja de arena) es un entorno de aislamiento estricto provisto por el kernel del sistema operativo para cada aplicación instalada. Cada app se ejecuta con un identificador de usuario único (UID), en su propio espacio de memoria y con un directorio de almacenamiento privado al cual ninguna otra app puede acceder.

**Relación con los permisos:** La caja de arena es la regla general (todo está cerrado y aislado por defecto). Los permisos son los **agujeros controlados** que el sistema operativo abre en esa caja de arena para permitir que la app se comunique con el hardware externo o acceda a información compartida del usuario.

**¿Qué puede hacer una app sin ningún permiso?**
* Ejecutar toda su lógica de negocio y cálculos en memoria.
* Mostrar vistas, animaciones, estilos y tipografías en pantalla.
* Guardar datos en su propio almacenamiento local privado (`AsyncStorage`, SQLite interno, caché privada).
* Realizar peticiones HTTP/HTTPS a servidores de Internet (en iOS sin permiso; en Android con el permiso de instalación normal `INTERNET` que no requiere diálogo).
* Utilizar selectores del sistema desacoplados (como el *Photo Picker* nativo de Android/iOS para elegir una foto sin leer la galería completa).
* Compartir contenido hacia otras apps mediante el menú nativo de Compartir (*Intent / UIActivityViewController*).

### c) Nombrá las cuatro razones por las que existen los permisos y dá un ejemplo concreto de cada una.
1. **Privacidad (Protección de datos personales):** Evitar que una app recopile información íntima sin consentimiento.  
   * *Ejemplo:* Impedir que un juego lea la lista de contactos (`READ_CONTACTS`) o el historial de ubicaciones.
2. **Seguridad e integridad del dispositivo:** Evitar acciones destructivas, espionaje o toma de control del equipo.  
   * *Ejemplo:* Bloquear el acceso al micrófono (`RECORD_AUDIO`) o cámara en segundo plano para evitar grabaciones clandestinas.
3. **Consumo de recursos (Batería, procesador y datos):** Proteger el rendimiento del hardware.  
   * *Ejemplo:* Restringir la geolocalización continua por GPS de alta precisión en segundo plano (`ACCESS_BACKGROUND_LOCATION`), la cual vaciaría la batería en pocas horas.
4. **Costo financiero y económico:** Prevenir cobros involuntarios o estafas telefónicas.  
   * *Ejemplo:* Permisos para enviar mensajes SMS premium (`SEND_SMS`) o realizar llamadas telefónicas directas (`CALL_PHONE`).

### d) En la analogía del portero del edificio, ¿quién es la visita, quién el portero y quién el dueño del departamento? ¿Qué significa que “el portero se acuerda de la respuesta”?
* **La visita:** Es la **aplicación**, que llega pidiendo entrar a una parte privada del departamento.
* **El portero:** Es el **sistema operativo** (Android / iOS), que intercepta a la visita en la entrada y no la deja pasar por la fuerza.
* **El dueño del departamento:** Es la **persona usuaria**, quien atiende el intercomunicador y dice "sí, dejalo pasar" o "no, no lo conozco".
* **"El portero se acuerda de la respuesta":** Significa que el sistema operativo **guarda en una base de datos de seguridad el veredicto del usuario**. Si el dueño dijo "no me vuelvas a molestar con esta visita" (denegación permanente / bloqueo), las próximas veces que la app intente tocar el timbre, el portero la rechaza en la puerta inmediatamente sin molestar al dueño con un nuevo diálogo.

---

## A2. Declarar y solicitar

| Pregunta | Declarar (al compilar) | Solicitar (al ejecutar) |
| :--- | :--- | :--- |
| **¿Qué se hace?** | Se avisa formalmente al sistema operativo y a la tienda qué recursos podría llegar a usar la app a lo largo de su vida útil. | Se le pide al sistema operativo que abra el acceso a un recurso puntual en tiempo de ejecución, desplegando el diálogo nativo si corresponde. |
| **¿Dónde / cómo en Android?** | En `android/app/src/main/AndroidManifest.xml` mediante etiquetas `<uses-permission android:name="..." />`. | Mediante la API de permisos en tiempo de ejecución (`ActivityCompat.requestPermissions()` o la API nativa del módulo). |
| **¿Dónde / cómo en iOS?** | En `ios/<App>/Info.plist` agregando la clave de descripción de uso (*Usage Description String* como `NSCameraUsageDescription`). | Invocando las APIs nativas del framework correspondiente (ej. `AVCaptureDevice.requestAccess(for: .video)`). |
| **¿Dónde / cómo en Expo?** | En `app.json` dentro de `expo.plugins` (o `ios.infoPlist` y `android.permissions`). | En el código TypeScript/JS llamando a las funciones o hooks de cada módulo (ej. `Location.requestForegroundPermissionsAsync()`). |
| **¿Qué pasa si se omite?** | **Android:** La solicitud falla silenciosamente o la app crashea con `SecurityException`.<br>**iOS:** Si falta el texto de propósito, la app crashea al instante al solicitar el permiso (`SIGABRT`) o Apple rechaza el binario en App Store Connect con error `ITMS-90683`. | La función que intenta acceder al hardware falla con error de permiso denegado, dejando a la app sin datos ni funcionalidad. |

---

## A3. Verdadero o falso

* **a) El diálogo de permiso lo dibuja tu app con componentes de React Native.**  
  **FALSO.** El diálogo de permiso lo dibuja exclusivamente el **Sistema Operativo** en una ventana flotante de sistema segura e inaccesible para la app. Esto se diseñó así para evitar ataques de *clickjacking*, *phishing* o superposiciones visuales engañosas.
* **b) En Expo, la fuente de verdad de los permisos es app.json (o app.config.ts), no el AndroidManifest.xml.**  
  **VERDADERO.** En el flujo gestionado de Expo (Managed Workflow), los archivos nativos son artefactos efímeros generados mediante Prebuild; la única fuente de verdad inmutable es `app.json`.
* **c) Agregar un permiso nuevo en el Info.plist se puede publicar con una actualización OTA.**  
  **FALSO.** Las actualizaciones OTA (*Over-The-Air*, como Expo Updates) únicamente pueden actualizar el código JavaScript y los assets estáticos. Cualquier modificación en `Info.plist` o `AndroidManifest.xml` altera la estructura nativa y exige compilar un nuevo binario instalable (.apk / .aab / .ipa).
* **d) Si tu código pide un permiso que no está en el manifiesto, Android igual muestra el diálogo.**  
  **FALSO.** Android verifica primero si el permiso está presente en el `AndroidManifest.xml`. Si no está declarado, el sistema **nunca muestra el diálogo** y rechaza la solicitud de inmediato.
* **e) El paquete expo-permissions es la forma recomendada de pedir permisos en SDK 57.**  
  **FALSO.** El paquete centralizado `expo-permissions` fue deprecado en SDK 41 y eliminado por completo. En SDK 57/58 la forma obligatoria y recomendada es utilizar las funciones y hooks exportados por cada paquete específico (`expo-camera`, `expo-location`, `expo-notifications`, etc.).
* **f) En iOS, las notificaciones no llevan texto de propósito en el Info.plist.**  
  **VERDADERO.** A diferencia de cámara, micrófono o ubicación, Apple no exige una clave `NSUsageDescription` para notificaciones locales/remotas; el diálogo estándar del sistema lo gestiona directamente `UserNotifications`.
* **g) Con acceso limitado a fotos, status vale 'granted' y el matiz está en accessPrivileges.**  
  **VERDADERO.** En iOS 14+, cuando el usuario selecciona solo algunas fotos, Expo retorna `granted: true`, `status: 'granted'` y `accessPrivileges: 'limited'`.
* **h) Desinstalar y reinstalar la app es la forma confiable de volver a “sin decidir” en las dos plataformas.**  
  **VERDADERO.** Al desinstalar la app, los sistemas operativos Android e iOS eliminan de sus registros de seguridad todas las autorizaciones, tokens y bloqueos previos asociados al bundle ID / paquete de la app.

---

## A4. Los estados de un permiso

### a) Diagrama de estados en Android y en iOS. ¿Cuál es la diferencia central entre las dos plataformas?

```text
ESTADOS EN ANDROID:
                   ┌────────────────┐
                   │  Sin decidir   │
                   └───────┬────────┘
                           │ (requestPermissions)
                           ▼
            ┌──────────────────────────────┐
            │ ¿Acepta o rechaza 1ra vez?   │
            └───┬──────────────────────┬───┘
   (Aceptó) │                          │ (Rechazó 1ra vez)
            ▼                          ▼
     ┌─────────────┐            ┌─────────────┐
     │  Concedido  │            │  Denegado   │◄─── (Puede volver a preguntarse)
     └─────────────┘            └──────┬──────┘
                                       │ (Rechazó 2da vez / "No volver a preguntar")
                                       ▼
                                ┌─────────────┐
                                │  Bloqueado  │───> (Solo recuperable en Ajustes)
                                └─────────────┘

ESTADOS EN iOS:
                   ┌────────────────┐
                   │  Sin decidir   │
                   └───────┬────────┘
                           │ (requestAuthorization)
                           ▼
            ┌──────────────────────────────┐
            │ ¿Acepta o deniega?           │
            └───┬──────────────────────┬───┘
   (Aceptó) │                          │ (Denegó)
            ▼                          ▼
     ┌─────────────┐            ┌─────────────┐
     │  Concedido  │            │  Bloqueado  │───> (¡iOS NUNCA vuelve a preguntar!)
     └─────────────┘            └─────────────┘
```

**Diferencia central:**  
En **iOS**, la oportunidad de diálogo con el usuario es **única y definitiva**. Si el usuario pulsa "No permitir", el permiso pasa inmediatamente a estado **bloqueado** permanente; el sistema nunca más volverá a mostrar el diálogo y la app solo puede invitar al usuario a ir a Ajustes.  
En **Android**, el sistema permite una segunda oportunidad de diálogo tras un primer rechazo, pasando a bloqueo definitivo recién cuando el usuario presiona "No permitir" por segunda vez (o marca "No volver a preguntar").

### b) Tabla de valores en Expo:

| Estado | `status` | `canAskAgain` | ¿Puede aparecer el diálogo? |
| :--- | :--- | :--- | :--- |
| **Sin decidir** | `'undetermined'` | `true` | **Sí** |
| **Concedido** | `'granted'` | `true` (o `false` s/SO) | **No** (ya lo tiene otorgado) |
| **Denegado (se puede volver a pedir)** | `'denied'` | `true` | **Sí** |
| **Bloqueado** | `'denied'` | `false` | **No** (solo yendo a Ajustes) |

---

# Parte B · Android: tipos de permisos y manifiesto

## B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
| :--- | :--- | :--- |
| `INTERNET` | **Instalación (Normal)** | Automático al instalar la app desde la tienda o APK. |
| `CAMERA` | **Tiempo de ejecución (Peligroso)** | Mediante diálogo emergente del sistema solicitado en caliente por la app. |
| `VIBRATE` | **Instalación (Normal)** | Automático al instalar la app. |
| `SYSTEM_ALERT_WINDOW` | **Especial** | La app debe enviar al usuario a la pantalla de configuración del sistema ("Mostrar sobre otras aplicaciones"). |
| `POST_NOTIFICATIONS` | **Tiempo de ejecución** (Android 13+) | Mediante diálogo emergente del sistema en tiempo de ejecución. |
| `ACCESS_NETWORK_STATE` | **Instalación (Normal)** | Automático al instalar la app. |
| `READ_CONTACTS` | **Tiempo de ejecución (Peligroso)** | Mediante diálogo emergente del sistema en tiempo de ejecución. |
| `SCHEDULE_EXACT_ALARM` | **Especial / Condicionado** | Otorgado por defecto en algunas versiones o requiere habilitación explícita en Ajustes > "Alarmas y recordatorios". |
| `RECORD_AUDIO` | **Tiempo de ejecución (Peligroso)** | Mediante diálogo emergente del sistema en tiempo de ejecución. |
| `MANAGE_EXTERNAL_STORAGE` | **Especial** | La app debe solicitar acceso redirigiendo al usuario a Ajustes > "Acceso a todos los archivos". |

---

## B2. Grupos y nombres

### a) ¿Qué es un grupo de permisos? Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, ¿cuántos diálogos ve la persona?
Un **grupo de permisos** es una agrupación lógica de permisos individuales relacionados con la misma capacidad de hardware o privacidad (por ejemplo, el grupo `LOCATION`).  
Si la app solicita ambos permisos juntos, la persona ve **UN SOLO diálogo**, el cual le permite elegir visualmente entre ubicación precisa o aproximada.

### b) ¿Qué prefijo lleva el nombre completo de un permiso? Escribí el nombre completo del permiso de cámara.
Lleva el prefijo del espacio de nombres del sistema: `android.permission.`.  
Nombre completo: `android.permission.CAMERA`.

### c) ¿Qué son los permisos de firma (*signature*)? ¿Por qué no se usan en apps comunes?
Son permisos que el sistema operativo solo otorga si la aplicación que los solicita está **firmada digitalmente con el mismo certificado criptográfico** que la aplicación que declaró el permiso (o con la clave del fabricante del dispositivo / imagen del sistema).  
No se usan en apps comunes porque una aplicación de terceros no comparte la firma digital del sistema operativo ni de otras empresas, por lo que la concesión es rechazada automáticamente por Android.

---

## B3. Leé el manifiesto

### a) ¿Qué permisos se conceden solos al instalar y cuáles hay que pedir además en tiempo de ejecución?
* **Solos al instalar (Normales):** `android.permission.INTERNET`.
* **En tiempo de ejecución (Peligrosos):** `CAMERA`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` y `READ_EXTERNAL_STORAGE` (en dispositivos con Android 12 o inferior).

### b) ¿Qué significa `android:maxSdkVersion="32"`? ¿Qué permisos reemplazan a `READ_EXTERNAL_STORAGE` desde Android 13?
Significa que esa declaración de permiso solo tendrá vigencia en dispositivos cuya versión de Android sea igual o menor a la API 32 (Android 12L). En dispositivos con Android 13 (API 33) o superior, el sistema ignora por completo esa línea.  
Desde Android 13 es reemplazado por los permisos granulares multimedia:
* `android.permission.READ_MEDIA_IMAGES`
* `android.permission.READ_MEDIA_VIDEO`
* `android.permission.READ_MEDIA_AUDIO`

### c) ¿Qué hace `tools:node="remove"`? Escribí el fragmento de `app.json` que lo genera.
Indica a la herramienta de mergeo de manifiestos de Gradle (*Manifest Merger*) que **elimine de forma definitiva ese permiso del APK final**, incluso si alguna dependencia o biblioteca externa de terceros intentó agregarlo.  
En `app.json` se genera agregándolo en `blockedPermissions`:
```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

### d) Necesitás agregar `SCHEDULE_EXACT_ALARM`, que ninguna librería declara. ¿En qué propiedad de `app.json` va?
Va en el arreglo de permisos de Android:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

### e) ¿Por qué en Expo no conviene editar este archivo a mano? ¿Funciona `blockedPermissions` en Expo Go?
No conviene editarlo a mano porque Expo utiliza una arquitectura declarativa; cada vez que se ejecuta `npx expo prebuild` (o durante la compilación en la nube), la carpeta `android` se regenera y cualquier cambio manual es sobreescrito.  
**¿Funciona `blockedPermissions` en Expo Go? NO.** Expo Go es un ejecutable previamente compilado y distribuido por las tiendas que ya incluye todos los permisos posibles habilitados en su propio manifiesto. Para que `blockedPermissions` tenga efecto real, se debe compilar una *development build* (`npx expo run:android`).

---

## B4. Así pregunta Android

### a) ¿Se puede poner texto propio dentro del diálogo de Android? Entonces, ¿dónde tenés que explicar para qué usás el permiso?
**NO**, el sistema operativo Android no permite alterar el texto ni la estructura del diálogo de permisos nativo.  
La explicación debe realizarse en la interfaz propia de la app mediante una **pantalla previa al permiso** (*pre-permission screen* o modal explicativo) que aparezca justo antes de solicitar el permiso nativo.

### b) ¿Qué diferencia hay entre “Mientras la app está en uso” y “Solo esta vez”? ¿Para qué permisos existe esta última opción?
* **"Mientras la app está en uso":** Concede acceso continuo en primer plano mientras la aplicación tenga una ventana visible para el usuario.
* **"Solo esta vez" (One-time permission):** Otorga un permiso temporal y volátil. Apenas el usuario cambia de app, apaga la pantalla o pasa la app a segundo plano durante un breve período, el permiso se revoca automáticamente.  
* **¿Para qué permisos existe?:** Para los permisos más críticos de privacidad: **Cámara**, **Micrófono** y **Ubicación**.

### c) En Android 11+, ¿qué pasa si la persona toca “No permitir” dos veces? ¿Qué valor toma `canAskAgain`?
El sistema lo interpreta como un rechazo explícito y permanente (equivalente al antiguo *"No volver a preguntar"*). El sistema suprime futuros diálogos y `canAskAgain` toma el valor **`false`**.

### d) La ubicación aproximada tiene una precisión de unos 3 km². Dá un ejemplo de función que anda bien con ella y otro de una que no.
* **Función que anda bien:** Mostrar el pronóstico del clima local o filtrar noticias por ciudad/provincia.
* **Función que NO anda bien:** Navegación GPS paso a paso en automóvil o validación de presencia en la puerta exacta de un aula del instituto.

### e) Si la persona revoca un permiso desde Ajustes mientras la app está abierta, ¿qué hace Android con el proceso de la app?
Android **destruye y mata de inmediato el proceso de la aplicación (`kill process`)**. Esto lo hace por principios de seguridad en el kernel, para evitar que objetos o hilos en memoria sigan accediendo a buffers de cámara o streams de datos que acaban de ser prohibidos.

---

## B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
| :--- | :--- | :--- |
| **Nacen los permisos en tiempo de ejecución** | Android 6.0 (API 23) | Ya no basta con declarar en el manifest; el código debe verificar `checkSelfPermission` y solicitar en caliente con `requestPermissions`. |
| **La ubicación en segundo plano pasa a ser un permiso aparte** | Android 10 (API 29) | No se puede pedir ubicación en segundo plano (`ACCESS_BACKGROUND_LOCATION`) al mismo tiempo que la de primer plano; requiere una solicitud posterior e independiente. |
| **Dos rechazos equivalen a “no volver a preguntar”** | Android 11 (API 30) | Si el usuario presiona "No permitir" dos veces, la app ya no puede mostrar el diálogo nativo y debe detectar `canAskAgain === false` para guiar a Ajustes. |
| **Ubicación precisa o aproximada** | Android 12 (API 31) | El diálogo ofrece visualmente elegir entre "Precisa" o "Aproximada". El código debe contemplar que el usuario pueda otorgar solo `ACCESS_COARSE_LOCATION`. |
| **Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`)** | Android 13 (API 33) | Las notificaciones ya no están habilitadas por defecto al instalar. Deben pedirse como permiso de tiempo de ejecución y requiere crear canales antes de solicitar. |
| **Acceso parcial a fotos y videos (“Seleccionar fotos”)** | Android 14 (API 34) | Introduce `READ_MEDIA_VISUAL_USER_SELECTED`. El usuario puede conceder acceso únicamente a un conjunto delimitado de fotos. |
| **Permiso de red local (`ACCESS_LOCAL_NETWORK`)** | Android 15 (API 35) | Restringe el escaneo y comunicación con otros dispositivos en la misma red local Wi-Fi. |

### ¿Qué es el `targetSdkVersion`? ¿A qué API apunta Expo SDK 57/58 y qué exige Google Play desde el 31 de agosto de 2026?
El **`targetSdkVersion`** es la declaración con la cual la app le indica al sistema operativo: *"he sido programada y probada bajo las reglas de comportamiento y seguridad de esta versión de Android"*.  
* Expo SDK 57/58 apunta a **API 35 (Android 15)**.
* Google Play exige anualmente que las apps nuevas y actualizaciones apunten como mínimo a la última versión estable (API 35 / Android 15 a partir de agosto de 2026) para poder ser publicadas.

---

# Parte C · iOS: textos de propósito y acceso parcial

## C1. Claves del Info.plist

| Recurso | Clave en `Info.plist` |
| :--- | :--- |
| **Cámara** | `NSCameraUsageDescription` |
| **Micrófono** | `NSMicrophoneUsageDescription` |
| **Ubicación en uso** | `NSLocationWhenInUseUsageDescription` |
| **Ubicación siempre** | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| **Fotos (leer)** | `NSPhotoLibraryUsageDescription` |
| **Fotos (solo guardar)** | `NSPhotoLibraryAddUsageDescription` |
| **Contactos** | `NSContactsUsageDescription` |
| **Face ID** | `NSFaceIDUsageDescription` |
| **Rastreo entre apps (ATT)** | `NSUserTrackingUsageDescription` |
| **Notificaciones** | *No lleva clave en Info.plist* (lo gestiona el framework `UserNotifications` en runtime). |

---

## C2. Sin texto, no hay permiso

### a) ¿Qué pasa si falta el texto de propósito y la app intenta usar la cámara? ¿Y al subir la build a App Store Connect? Mencioná el código de error.
* **Al intentar usar la cámara en el dispositivo:** La aplicación **crashea de forma fulminante e instantánea** arrojando una señal `SIGABRT` con la excepción:  
  `This app has crashed because it attempted to access privacy-sensitive data without a usage description.`
* **Al subir la build a App Store Connect:** El sistema de validación automatizada rechaza el binario de inmediato enviando un correo de error con el código:  
  **`ITMS-90683: Missing Purpose String in Info.plist`**.

### b) ¿Cuántas veces muestra iOS el diálogo de un permiso? Si la persona dice que no, ¿qué le queda a la app?
iOS muestra el diálogo del sistema **EXACTAMENTE UNA SOLA VEZ** en toda la vida útil de la instalación.  
Si la persona dice "No permitir", la app no tiene ninguna posibilidad de volver a abrir el diálogo nativo; la única alternativa que le queda es mostrar una explicación en su propia interfaz y ofrecer un botón que enlace a los ajustes del sistema mediante `Linking.openSettings()`.

### c) En el diálogo de iOS, ¿qué parte arma el sistema y cuál escribís vos? En Expo, ¿dónde se configura ese texto?
* **El sistema arma:** El título del diálogo (`"Nombre de la App" desea acceder a...`), el ícono y los botones de acción (`"No permitir"`, `"Permitir"`).
* **Vos escribís:** El **subtítulo descriptivo** del cuerpo del diálogo (el *Purpose String* que justifica la necesidad).
* **En Expo se configura:** En `app.json`, dentro de la propiedad de configuración de cada plugin (por ejemplo `expo-camera` -> `cameraPermission`), o en `expo.ios.infoPlist`.

### d) Una librería usa una API protegida que tu app nunca llama y Apple rechaza la build. ¿Por qué pasa y cómo se resuelve?
* **Por qué pasa:** Apple realiza análisis estático de código compilado buscando símbolos de APIs sensibles. Si una dependencia externa incluye código nativo que referencia la API (por ejemplo `AVCaptureDevice` o geolocalización), los robots de Apple asumen que la app usa esa capacidad y exigen su clave descriptiva en el `Info.plist`.
* **Cómo se resuelve:**  
  1. Configurando el plugin de Expo correspondiente para desactivar el sub-módulo (ej. en `expo-camera` configurar `microphonePermission: false`).  
  2. Si la librería está dividida en sub-paquetes modulares, importar únicamente el módulo que no enlace binarios innecesarios.

---

## C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada (Molde: *"Usamos tu [dato] para [beneficio concreto]"*) |
| :--- | :---: | :--- |
| *"Necesitamos tu ubicación."* | **NO** | *"Usamos tu ubicación para mostrarte las farmacias de turno más cercanas a tu posición."* |
| *"Para mejorar tu experiencia."* | **NO** | *"Usamos tu ubicación para calcular el costo y tiempo exacto de envío de tu pedido."* |
| *"Usamos tu ubicación para mostrarte las farmacias de turno más cercanas."* | **SÍ** | *(Ya cumple perfectamente la directriz de Apple).* |
| *"La app no funciona sin ubicación."* | **NO** | *"Usamos tu ubicación para registrar el punto de partida y la distancia de tu recorrido deportivo."* |
| *"Ubicación requerida por el sistema."* | **NO** | *"Usamos tu ubicación para marcar en qué sector del instituto se encuentra el desperfecto que estás reportando."* |

---

## C4. Acceso parcial y gradual

| Caso | Desde qué versión de iOS | En Expo |
| :--- | :--- | :--- |
| **Fotos limitadas (“Seleccionar fotos”)** | iOS 14 | `ImagePicker.getMediaLibraryPermissionsAsync()` devuelve `accessPrivileges: 'limited'` y `granted: true`. |
| **Ubicación aproximada (interruptor “Precisa”)** | iOS 14 | `Location.getForegroundPermissionsAsync()` devuelve el objeto con la precisión otorgada (`Location.Accuracy`). |
| **“Permitir una vez” (ubicación)** | iOS 13 | `Location.requestForegroundPermissionsAsync()` retorna `granted: true`, pero al cerrar y reabrir la app vuelve a `undetermined`. |
| **Ubicación escalonada: de “al usar la app” a “Siempre”** | iOS 13 / 14 | Primero se ejecuta `Location.requestForegroundPermissionsAsync()` y luego `Location.requestBackgroundPermissionsAsync()`. |
| **Notificaciones provisionales** | iOS 12 | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`. |
| **Rastreo entre apps (App Tracking Transparency)** | iOS 14.5 | Mediante la biblioteca `expo-tracking-transparency` invocando `requestTrackingPermissionsAsync()`. |

### ¿Qué versión mínima de iOS requiere Expo SDK 57/58? ¿Qué consecuencia práctica tiene eso sobre la tabla anterior?
Expo SDK 57/58 requiere como versión mínima **iOS 15.1**.  
**Consecuencia práctica:** Todas las funcionalidades de acceso parcial de la tabla anterior (fotos limitadas, interruptor de precisión, notificaciones provisionales) están **100% disponibles y garantizadas** en cualquier dispositivo iOS compatible, sin necesidad de escribir código defensivo para versiones antiguas.

---

## C5. Android vs iOS, lado a lado

| Aspecto | Android | iOS |
| :--- | :--- | :--- |
| **¿Dónde se declara?** | En `AndroidManifest.xml` con `<uses-permission>`. | En `Info.plist` con claves `NS...UsageDescription`. |
| **Texto en el diálogo** | Fijo del sistema (no editable por el programador). | El sistema provee título/botones y el programador escribe el texto explicativo central. |
| **Oportunidades para preguntar** | Dos oportunidades consecutivas antes del bloqueo permanente. | **Una sola oportunidad**. Si se rechaza, pasa a bloqueado. |
| **“Solo esta vez” / “Permitir una vez”** | Permiso temporal que se pierde tras breve tiempo en segundo plano o cierre. | Concedido temporalmente; se restablece a *undetermined* al cerrar la app. |
| **Notificaciones** | Requiere permiso en tiempo de ejecución (`POST_NOTIFICATIONS`) desde Android 13 y creación previa de canales. | Se solicitan con `UNUserNotificationCenter`; permite notificaciones provisionales silenciosas sin diálogo. |
| **Ubicación en segundo plano** | Permiso aparte (`ACCESS_BACKGROUND_LOCATION`) que exige guiar a Ajustes del sistema. | Diálogo en dos fases o escalonado ("Al usar la app" -> "Cambiar a siempre"). |
| **Si falta la declaración** | La llamada falla silenciosamente o arroja `SecurityException`. | **Crash inmediato en tiempo de ejecución (`SIGABRT`)** o rechazo en App Store Connect. |

---

# Parte D · Expo: una API, dos plataformas

## D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
| :--- | :--- | :--- |
| **Escanear un QR con la cámara** | `expo-camera` | `useCameraPermissions()` / `Camera.requestCameraPermissionsAsync()` |
| **Grabar video con sonido** | `expo-camera` | Cámara y Micrófono: `requestCameraPermissionsAsync()` y `requestMicrophonePermissionsAsync()` |
| **Mostrar farmacias cercanas** | `expo-location` | `useForegroundPermissions()` / `Location.requestForegroundPermissionsAsync()` |
| **Seguir un envío con la app en segundo plano** | `expo-location` + `expo-task-manager` | `Location.requestBackgroundPermissionsAsync()` |
| **Mostrar un recordatorio** | `expo-notifications` | `usePermissions()` / `Notifications.requestPermissionsAsync()` |
| **Grabar una nota de voz** | `expo-audio` (o `expo-av`) | `Audio.requestRecordingPermissionsAsync()` |
| **Galería propia dentro de la app** | `expo-media-library` | `MediaLibrary.usePermissions()` / `requestPermissionsAsync()` |
| **Publicidad personalizada entre apps (iOS)** | `expo-tracking-transparency` | `requestTrackingPermissionsAsync()` |

### Un tutorial usa `import * as Permissions from 'expo-permissions'`. ¿Qué te dice eso sobre el tutorial?
Indica que el tutorial está **obsoleto y desactualizado** (creado con versiones anteriores a Expo SDK 41). Dicho paquete centralizado fue deprecado hace años y en SDK 57/58 ya no existe; los permisos ahora se piden desde cada biblioteca individual.

---

## D2. Consultar, pedir y el hook

```typescript
// El patrón con expo-location
import * as Location from 'expo-location';

const actual = await Location.getForegroundPermissionsAsync();
const respuesta = await Location.requestForegroundPermissionsAsync();
const [permiso, pedirPermiso, consultarPermiso] = Location.useForegroundPermissions();
```

### a) ¿Qué diferencia hay entre `get...PermissionsAsync()` y `request...PermissionsAsync()`? ¿Cuál puede mostrar un diálogo?
* **`get...PermissionsAsync()`:** Es una consulta pasiva de sólo lectura. Lee el estado actual en el sistema operativo y **nunca muestra ningún diálogo**.
* **`request...PermissionsAsync()`:** Es una solicitud activa. Si el permiso está en estado preguntable, **despliega el diálogo del sistema operativo** en pantalla.

### b) El hook devuelve tres elementos. ¿Qué es cada uno? ¿Qué vale `permiso` en el primer render y qué tiene que mostrar la pantalla mientras tanto?
1. **`permiso`:** Objeto `PermissionResponse` con el estado actual del recurso (`status`, `granted`, `canAskAgain`).
2. **`pedirPermiso`:** Función asíncrona para solicitar el permiso activando el diálogo del sistema.
3. **`consultarPermiso`:** Función asíncrona para volver a leer el estado actual sin pedirlo.
* En el primer render, `permiso` vale **`null`**.
* Mientras tanto, la pantalla debe mostrar un **indicador de carga (`ActivityIndicator`)** para evitar renderizar componentes que dependen de un estado aún desconocido.

### c) Si `canAskAgain` es `false`, ¿qué pasa al llamar a `request...()`? ¿Qué problema aparece si se lo llama en un bucle?
* Al llamar a `request...()`, la función retorna **inmediatamente con `{ status: 'denied', granted: false, canAskAgain: false }` sin mostrar ningún diálogo en pantalla**.
* Si se lo llama en un bucle o dentro del cuerpo de render sin protección (como en un `useEffect` mal configurado), generará un **bucle infinito de ejecuciones asíncronas** que congelará el hilo de JavaScript y la interfaz de usuario.

---

## D3. Leé la respuesta

| Respuesta | Qué hace la app |
| :--- | :--- |
| `null` | Muestra un spinner de carga (`ActivityIndicator`); el estado se está consultando. |
| `{ status: 'granted', granted: true }` | Habilita y muestra la función nativa (ej. renderiza `CameraView`). |
| `{ status: 'undetermined', canAskAgain: true }` | Muestra la pantalla previa con el beneficio y botón "Continuar" para disparar el diálogo. |
| `{ status: 'denied', canAskAgain: true }` | Ofrece el camino alternativo y permite volver a intentar pedir el permiso si el usuario toca la función. |
| `{ status: 'denied', canAskAgain: false }` | Muestra el camino alternativo e informa que está bloqueado, mostrando el botón "Abrir Ajustes". |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Opera con las fotos seleccionadas por el usuario y ofrece opción de gestionar más fotos. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Utiliza la ubicación aproximada sin exigir coordenadas de alta precisión. |

### ¿Cuáles son los dos campos que deciden casi todo? ¿Qué pregunta responde cada uno?
1. **`granted`:** ¿Tengo autorización para acceder al recurso en este instante? (*Sí / No*).
2. **`canAskAgain`:** ¿El sistema operativo me permite mostrarle el diálogo de solicitud al usuario? (*Sí / No*).

---

## D4. Simulación del ciclo completo

### Android 14, app recién instalada, `expo-location`:

| # | Acción | `status` | `canAskAgain` | ¿Diálogo? |
| :-: | :--- | :--- | :-: | :-: |
| **1** | `getForegroundPermissionsAsync()` | `'undetermined'` | `true` | **No** |
| **2** | `requestForegroundPermissionsAsync()` → "No permitir" | `'denied'` | `true` | **Sí** |
| **3** | `requestForegroundPermissionsAsync()` → "No permitir" | `'denied'` | `false` | **Sí** |
| **4** | `requestForegroundPermissionsAsync()` | `'denied'` | `false` | **No** |
| **5** | `Linking.openSettings()` → habilita "Mientras la app está en uso" → vuelve y la app consulta | `'granted'` | `true` | **No** |
| **6** | Igual que el 5, pero la app no vuelve a consultar: ¿qué muestra? | Sigue mostrando la UI de estado bloqueado (la app no se enteró del cambio). |

### Repetición de pasos 1 a 4 en iOS:
* **¿En qué paso cambia y por qué?** Cambia en el **paso 2**. En iOS, al presionar "No permitir", el estado pasa inmediatamente a `status: 'denied'` con `canAskAgain: false`. En el paso 3, iOS **no muestra diálogo**.
* **¿Qué pasa en iOS si la persona elige “Permitir una vez” y después cierra y reabre la app?**  
  El permiso temporal expira; al reabrir la app, el estado regresa automáticamente a `status: 'undetermined'` y `canAskAgain: true`.

---

## D5. Configurar `app.json`

```json
{
  "expo": {
    "name": "EcoReciclaje",
    "slug": "eco-reciclaje",
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para escanear el código QR del contenedor de reciclaje.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos a tu posición.",
          "locationAlwaysAndWhenInUsePermission": false,
          "locationAlwaysPermission": false,
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

### ¿Por qué `expo-camera` agrega `RECORD_AUDIO` en Android aunque la app no grabe sonido?
Porque la biblioteca nativa subyacente de `expo-camera` soporta indistintamente toma de fotografías y grabación de video con audio en un único módulo. Por defecto, su manifiesto interno incluye el permiso de micrófono para que no falle al grabar video. Para impedirlo, se debe deshabilitar explícitamente con `recordAudioAndroid: false` y en `blockedPermissions`.

---

## D6. Expo Go no es tu app

### a) ¿Por qué tus textos de propósito no aparecen cuando probás en Expo Go?
Porque Expo Go es una aplicación nativa pre-empaquetada y firmada por Expo. Al ejecutarse, iOS lee las cadenas de propósito que ya están compiladas en el `Info.plist` del ejecutable de Expo Go, ignorando las configuradas en tu `app.json`.

### b) ¿Qué se puede probar en Expo Go y qué necesita una development build? Pensá en push en Android y en ubicación en segundo plano.
* **Se puede probar en Expo Go:** Flujos lógicos de permisos estándar en primer plano (cámara básica, ubicación en uso simple, selección de fotos).
* **Necesita Development Build:**
  * Notificaciones Push en Android (Firebase Cloud Messaging nativo).
  * Ubicación en segundo plano continua (`ACCESS_BACKGROUND_LOCATION` con `TaskManager`).
  * Validación real de exclusión de permisos con `blockedPermissions`.
  * Textos de propósito personalizados en iOS.

### c) Escribí los comandos para ver los archivos nativos generados y para compilar una development build en Android.
```bash
# Ver los archivos nativos generados (Android / iOS):
npx expo prebuild

# Compilar e instalar una development build local en Android:
npx expo run:android
```

### d) ¿Cómo volvés un permiso a “sin decidir” sin reinstalar, en Android (adb) y en el simulador de iOS (xcrun simctl)?
```bash
# En Android (adb):
adb shell pm reset-permissions ar.edu.ipf.mantenimiento
# O revocar uno puntual:
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA

# En el simulador de iOS (xcrun simctl):
xcrun simctl privacy booted reset all ar.edu.ipf.mantenimiento
# O reiniciar solo cámara:
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
```

---

# Parte E · Recetas: leer y corregir código

## E1. Encontrá los errores (cámara)

### Los 4 errores identificados:
1. **No maneja el estado inicial `null`:** En el primer render `permiso` es `null`, por lo que `permiso.status` arrojará un error de runtime (*Cannot read property 'status' of null*).
2. **No contempla el estado bloqueado:** Si el usuario rechazó el permiso permanentemente (`canAskAgain === false`), al pulsar el botón "Permitir" no ocurrirá nada y el usuario quedará atrapado sin saber qué hacer.
3. **El botón dice "Permitir" en lugar de "Continuar":** Confunde al usuario simulando que la app le otorga el permiso, violando la directriz de Apple.
4. **Falta el camino alternativo:** Si no hay cámara, la pantalla no ofrece ninguna forma de escribir el código del aula a mano.

### Versión corregida con los 4 estados:
```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EscanearCorregido({ onCodigo }: { onCodigo: (cod: string) => void }) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [manual, setManual] = useState('');

  // 1) Estado: Cargando
  if (!permiso) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  // 2) Estado: Concedido
  if (permiso.granted) {
    return (
      <CameraView
        style={styles.flex}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => onCodigo(data)}
      />
    );
  }

  // 3) Estado: Bloqueado
  if (!permiso.canAskAgain) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Cámara bloqueada</Text>
        <Text style={styles.texto}>
          Para escanear el QR necesitás habilitar la cámara desde los Ajustes del sistema.
        </Text>
        <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
        
        <Text style={styles.subtitulo}>O ingresá el código a mano:</Text>
        <TextInput placeholder="Código de aula" value={manual} onChangeText={setManual} style={styles.input} />
        <Button title="Usar este código" onPress={() => onCodigo(manual)} />
      </View>
    );
  }

  // 4) Estado: Preguntable
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Acceso a la cámara</Text>
      <Text style={styles.texto}>
        Usamos la cámara para leer el código QR pegado en la puerta del aula.
      </Text>
      <Button title="Continuar" onPress={pedirPermiso} />
      
      <Text style={styles.subtitulo}>Alternativa sin cámara:</Text>
      <TextInput placeholder="Código de aula" value={manual} onChangeText={setManual} style={styles.input} />
      <Button title="Usar este código" onPress={() => onCodigo(manual)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenedor: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  subtitulo: { fontSize: 16, marginTop: 16 },
  texto: { fontSize: 14, color: '#4B5563' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10 },
});
```

---

## E2. El orden importa (ubicación)

### a) ¿Qué está mal? ¿Qué ocurre en iOS y qué ocurre en Android 11+?
* **Qué está mal:** La función intenta solicitar el permiso en segundo plano (`requestBackgroundPermissionsAsync()`) **antes** de haber obtenido el permiso en primer plano (`requestForegroundPermissionsAsync()`).
* **En iOS y Android 11+:** El sistema operativo **ignora o rechaza automáticamente la petición**. Las pautas de Google y Apple prohíben estrictamente pedir acceso en segundo plano de forma directa; la app debe pedir primero primer plano y, de forma escalonada e incremental, solicitar el segundo plano en un momento posterior justificado.

### b) Función reescrita correctamente:
```typescript
import * as Location from 'expo-location';

export async function activarSeguimiento(): Promise<boolean> {
  // Paso 1: Pedir primero ubicación en uso (primer plano)
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  // Paso 2: Recién con primer plano concedido, solicitar segundo plano
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

### c) Función `obtenerUbicacion()` defensiva:
```typescript
import * as Location from 'expo-location';

export type ResultadoUbicacion = {
  latitud: number;
  longitud: number;
  aproximada: boolean;
} | null;

export async function obtenerUbicacion(): Promise<ResultadoUbicacion> {
  try {
    const estado = await Location.getForegroundPermissionsAsync();
    if (!estado.granted) return null;

    // Detección de precisión aproximada tanto en Android como en iOS
    const esAproximada =
      (estado as any).android?.accuracy === 'coarse' ||
      estado.accuracy === Location.Accuracy.Lowest ||
      estado.accuracy === Location.Accuracy.Low;

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: esAproximada ? Location.Accuracy.Balanced : Location.Accuracy.High,
    });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada: esAproximada,
    };
  } catch (error) {
    // Si falla o se rechaza, retorna null sin romper la app
    return null;
  }
}
```

### d) ¿Hace falta segundo plano para “farmacias cercanas”? ¿Qué exige Google Play si lo pedís?
* **¿Hace falta?: NO.** Para listar farmacias cercanas solo se necesita la ubicación en primer plano en el instante en que el usuario abre la pantalla.
* **¿Qué exige Google Play si lo pedís?:** Exige una auditoría rigurosa mediante el formulario de declaración de permisos, demostrando que la función principal de la app es inviable sin ubicación en segundo plano, e incluyendo un video público de demostración. Si no se justifica como función medular, Google Play rechaza y da de baja la aplicación.

---

## E3. Notificaciones mudas

### a) ¿Cuál es la causa más probable? ¿Qué hay que hacer antes de pedir el permiso?
* **Causa más probable:** En Android 13+ (API 33+), el diálogo del sistema no se despliega si la aplicación no ha creado previamente al menos un **canal de notificaciones** (*Notification Channel*).
* **Qué hay que hacer antes:** Crear el canal mediante `Notifications.setNotificationChannelAsync('reportes', { ... })` antes de invocar `requestPermissionsAsync()`.

### b) ¿Qué pasa con este permiso en Android 12 o anterior?
En Android 12 o inferior, el permiso `POST_NOTIFICATIONS` no existía como permiso en tiempo de ejecución; las notificaciones estaban **concedidas por defecto al momento de instalar la app**.

### c) ¿Qué opción de iOS permite recibir notificaciones sin diálogo? ¿Cómo detectás en código ese estado?
* **Opción:** Las **Notificaciones Provisionales** (*Provisional Authorization*).
* **Cómo se solicita:** `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`.
* **Cómo se detecta en código:** Comprobando el estado de iOS: `respuesta.ios?.status === 3` (donde 3 corresponde a `IosAuthorizationStatus.PROVISIONAL`).

### d) ¿En qué momento conviene pedir este permiso? Dá un ejemplo de buen y de mal momento.
* **Buen momento (en contexto):** Justo después de que el usuario finaliza y guarda un reporte de desperfecto, mostrando una pantalla que dice: *"¿Querés que te avisemos cuando un técnico resuelva tu reporte?"*.
* **Mal momento:** Inmediatamente al abrir la app por primera vez en la pantalla de bienvenida/splash screen, sin que el usuario comprenda el valor de la notificación.

---

## E4. Fotos sin pedir permiso

| Necesidad | Herramienta recomendada | Permiso requerido |
| :--- | :--- | :--- |
| **Elegir una foto de perfil** | Photo Picker nativo del sistema (`ImagePicker.launchImageLibraryAsync`) | **Ninguno** (opera fuera del sandbox de la app). |
| **Sacar una foto en el momento** | `expo-camera` (`CameraView`) | Permiso de Cámara (`android.permission.CAMERA`). |
| **Editor que muestra toda la galería en mosaico propio** | `expo-media-library` | `READ_MEDIA_IMAGES` (Android) / `NSPhotoLibraryUsageDescription` (iOS). |
| **Adjuntar la foto de un comprobante** | Photo Picker del sistema (`launchImageLibraryAsync`) | **Ninguno**. |

### ¿Por qué Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO`? ¿Desde cuándo? ¿Qué es “el mejor permiso”?
* **Por qué:** Para evitar que cualquier aplicación común tenga acceso indiscriminado a todas las fotos y videos privados almacenados en el teléfono.
* **Desde cuándo:** Desde agosto de 2024 para todas las apps que se publiquen o actualicen en Google Play.
* **"El mejor permiso":** **Es el que no se pide.** Si la tarea puede resolverse utilizando componentes delegados del sistema operativo (como el Photo Picker nativo), se debe evitar pedir permisos invasivos.

---

## E5. Volver de Ajustes

```typescript
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      // 1) Estaba en background o inactiva
      const estabaAfuera = /inactive|background/.test(anterior.current);

      // 2) Y ahora pasó a estar activa en primer plano
      if (estabaAfuera && nuevo === 'active') revisar();

      anterior.current = nuevo;
    });

    // 3) Función de limpieza de la suscripción
    return () => sub.remove();
  }, [revisar]);
}
```

### a) ¿Por qué los hooks de Expo no se enteran solos de que el permiso cambió en Ajustes?
Porque los hooks de Expo solo consultan el estado cuando su componente se monta en el árbol de React. Cuando el usuario se traslada a la app de Ajustes de Android/iOS y regresa, el componente de React ya estaba montado en segundo plano, por lo que no experimenta un re-render natural a menos que escuche el evento `AppState`.

### b) ¿Qué función del hook de cámara le pasarías a `useRevisarAlVolver`?
Le pasaríamos la función `consultarPermiso` (el tercer elemento de `useCameraPermissions()`).

### c) ¿Por qué no conviene guardar el estado del permiso en un store global “para siempre”?
Porque el estado de un permiso es **volátil y externo a la app**. El usuario puede ir a Ajustes en cualquier momento mientras la app está minimizada y revocar el permiso. Si la app confía ciegamente en un valor cacheado en un store global, intentará ejecutar operaciones de hardware pensando que tiene acceso, provocando fallos en la experiencia.

---

# Parte F · Buenas prácticas y tiendas

## F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
| :--- | :--- | :--- |
| **Delivery · ubicación** | En la pantalla de checkout, al tocar el botón "Usar mi ubicación actual para el envío". | Permitir ingresar manualmente la calle, número y piso en un campo de texto. |
| **Billetera virtual · cámara** | En el momento de presionar el botón "Pagar con QR". | Permitir ingresar el código de pago o alias/CBU manualmente. |
| **Red social · contactos** | Al presionar "Buscar amigos de mi agenda" en la pestaña de configuración. | Proveer un buscador manual por nombre de usuario o enlace de invitación. |
| **Mensajería · micrófono** | En el instante en que el usuario mantiene presionado el ícono del micrófono para enviar un audio. | Escribir mensajes de texto o enviar adjuntos pre-grabados. |
| **Turnos médicos · notificaciones** | Al finalizar la confirmación de la reserva de un turno. | Enviar la confirmación y recordatorio por correo electrónico o SMS. |
| **Editor de fotos · galería completa** | Únicamente si el editor ofrece un organizador de álbumes avanzado dentro de la app. | Abrir el Photo Picker del sistema para editar una foto por vez. |

### ¿Por qué pedir cuatro permisos apenas se abre la app “entrena el No permitir automático”?
Porque genera fatiga cognitiva y desconfianza en el usuario (*permission spamming*). Al ser bombardeado por cuadros de diálogo sin haber interactuado con la app ni entender el beneficio, el usuario desarrolla el reflejo de apretar "No permitir" para deshacerse de los carteles y ver el contenido de la pantalla.

---

## F2. La pantalla previa

### a) ¿Qué tres elementos tiene una buena pantalla previa al diálogo del sistema?
1. **Beneficio claro en una frase:** Explica de forma concisa qué gana el usuario al otorgar el permiso.
2. **Alternativa transparente:** Informa qué camino o método alternativo podrá usar si decide no darlo.
3. **Único botón afirmativo de avance ("Continuar"):** Un llamado a la acción claro que indica el próximo paso.

### b) ¿Por qué el botón debe decir “Continuar” y no “Permitir”?
Porque la aplicación **no tiene la facultad técnica de otorgar el permiso**. El botón de la app solo sirve para avanzar y desplegar el verdadero diálogo del sistema operativo, que es el único lugar donde el usuario otorga o no la autorización. Decir "Permitir" genera confusión y la sensación de que se le preguntó dos veces lo mismo.

### c) ¿Qué dice la pauta 5.1.1(iv) de Apple sobre botones como “Ahora no” o “Cerrar” en esa pantalla?
La pauta de Apple prohíbe interfaces que intenten adivinar o condicionar la respuesta del usuario mediante opciones engañosas de "Ahora no", "Más tarde" o "Cancelar" en pantallas previas, ya que busca evitar patrones oscuros (*dark patterns*) que dilaten la decisión soberana que corresponde tomar únicamente en el diálogo nativo del sistema.

### d) ¿Cómo cambia la pantalla si el permiso ya está bloqueado?
La pantalla cambia de un rol de preparación a un rol de **guía y recuperación**:
* Explica que el permiso ya no se puede pedir mediante diálogos del sistema.
* Muestra la **ruta de navegación textual en Ajustes** (ej. *Ajustes > Aplicaciones > Mantenimiento IPF > Permisos*).
* Cambia el botón "Continuar" por un botón directo **"Abrir Ajustes"** que invoca `Linking.openSettings()`.

---

## F3. Mínimo privilegio

* **a) Ubicación precisa o aproximada para “puntos de reciclaje de tu barrio”:**  
  **Aproximada.** Alcanza y sobra para determinar el barrio o localidad del usuario sin necesidad de vulnerar la exactitud de su domicilio real.
* **b) Ubicación “en uso” o “siempre” para “registrar una carrera con el celular en el bolsillo”:**  
  **Ubicación "en uso" con servicio en primer plano (*Foreground Service* con notificación persistente).** No requiere "siempre" en segundo plano profundo si la actividad deportiva ocurre durante una sesión activa y visible en la barra de estado.
* **c) Selector del sistema o permiso de galería para “subir la foto del DNI”:**  
  **Selector del sistema (*Photo Picker*).** No requiere declarar ni pedir ningún permiso de lectura de almacenamiento o galería; el usuario selecciona únicamente la imagen del documento de manera segura.
* **d) `expo-camera` con o sin micrófono para “escanear el QR del aula”:**  
  **Sin micrófono.** Un código QR es una imagen visual; habilitar el micrófono violaría el principio de menor privilegio y despertaría sospechas innecesarias.

---

## F4. Tiendas

### a) Nombrá dos requisitos de Google Play y dos de App Store relacionados con permisos y privacidad.
* **Google Play:**
  1. Justificación obligatoria de permisos de ubicación en segundo plano mediante video y formulario.
  2. Prohibición del uso de `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` si la app solo necesita adjuntos ocasionales (obligatoriedad del Photo Picker).
* **App Store (Apple):**
  1. Presencia obligatoria de textos de propósito detallados y contextualizados en el `Info.plist` (Rechazo bajo pauta 5.1.1).
  2. Obligatoriedad del manifiesto de privacidad `PrivacyInfo.xcprivacy` declarando el uso de APIs de huella digital (*Required Reason APIs*).

### b) ¿Qué es el manifiesto de privacidad (`PrivacyInfo.xcprivacy`) y dónde se configura en Expo?
Es un archivo estándar introducido por Apple que documenta formalmente qué datos recopila la app, si se usan para rastreo entre apps (*tracking*) y qué APIs de motivos obligatorios (*Required Reason APIs* como `UserDefaults`, `FileTimestamp`, etc.) utiliza el código propio o sus dependencias.  
En Expo se configura en `app.json` dentro de `expo.ios.privacyManifests`.

### c) ¿Qué suma Android 17 y qué va a exigir Google Play desde el 27/01/2027 a las apps que hoy piden `READ_CONTACTS`?
Android introduce el **Contact Picker nativo desacoplado del sistema** (análogo al Photo Picker).  
Google Play exigirá a partir de esa fecha que ninguna aplicación solicite el permiso invasivo `READ_CONTACTS` a menos que sea una app de libreta de direcciones o mensajería esencial; todas las demás apps deberán usar obligatoriamente el selector del sistema sin permisos.

---

## F5. Errores comunes

### a) La consola de Xcode muestra: *“This app has crashed because it attempted to access privacy-sensitive data without a usage description.”*
* **Causa:** La aplicación invocó una API protegida (ej. cámara o ubicación) en iOS sin haber declarado la clave descriptiva correspondiente (`NS...UsageDescription`) en el archivo `Info.plist`.
* **Solución:** Agregar en `app.json` el plugin correspondiente con su texto de propósito o configurar la clave en `expo.ios.infoPlist`.

### b) *“En Expo Go anda, en la build no”*: en la development build la cámara se deniega sin mostrar ningún diálogo.
* **Causa:** En la build de desarrollo, el permiso de cámara no fue declarado en el `AndroidManifest.xml` (o fue bloqueado por error en `blockedPermissions`), mientras que en Expo Go funcionaba porque Expo Go ya tiene todos los permisos declarados de fábrica.
* **Solución:** Verificar que el plugin `expo-camera` esté presente en `app.json` y que `android.permission.CAMERA` no esté incluido en `blockedPermissions`.

### c) Después de habilitar la ubicación en Ajustes, la app sigue diciendo “bloqueado”.
* **Causa:** El componente no implementó un listener de `AppState` para re-consultar el estado del permiso al volver a primer plano desde los Ajustes del sistema.
* **Solución:** Implementar el hook `useRevisarAlVolver` utilizando `AppState.addEventListener('change', ...)` para llamar a la función de consulta de permisos cuando la app vuelva a estar `'active'`.

### d) La pantalla queda en “Pidiendo permiso…” para siempre porque el código llama a `request...()` cada vez que se renderiza.
* **Causa:** Se colocó la invocación a `request...()` en el cuerpo principal del componente sin envolverla en un `useEffect` con dependencias vacías o sin asociarla al evento `onPress` de un botón.
* **Solución:** Mover la llamada a `request...()` exclusivamente dentro del callback del botón "Continuar", dejando el cuerpo del componente libre de efectos secundarios.

### e) Una app de turnos no permite entrar a ninguna pantalla si se deniegan las notificaciones.
* **Causa:** Se aplicó un patrón de diseño bloqueante e incorrecto, tratando un permiso secundario de conveniencia (notificaciones) como si fuera un requisito estructural indispensable para usar la app.
* **Solución:** Aplicar el principio de degradación elegante: si el usuario rechaza las notificaciones, permitirle seguir usando la app y ofrecerle una bandeja interna de avisos dentro de la interfaz.

---

# Parte G · Guía de Preparación para la Defensa Oral (G6)

Para rendir la defensa oral con máxima solidez técnica, estas son las explicaciones basadas directamente en el código de tu proyecto:

### 1. Mostrá el código que decide entre “Continuar” y “Abrir Ajustes”. ¿Qué campo de la respuesta lo decide?
* **En el código:** En [`src/lib/permisos.ts`](file:///C:/Users/IPF-2026/Desktop/Trabajo%20Practico%20N3%20de%20React/mantenimiento-ipf/src/lib/permisos.ts), la función `aEstado(respuesta)`:
  ```typescript
  export function aEstado(respuesta: Respuesta): EstadoPermiso {
    if (respuesta === null) return 'cargando';
    if (respuesta.granted) return 'concedido';
    if (respuesta.canAskAgain) return 'preguntable';
    return 'bloqueado';
  }
  ```
  Y en [`src/components/previo-permiso.tsx`](file:///C:/Users/IPF-2026/Desktop/Trabajo%20Practico%20N3%20de%20React/mantenimiento-ipf/src/components/previo-permiso.tsx):
  ```tsx
  if (estado === 'bloqueado') {
    return <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />;
  }
  return <Boton titulo="Continuar" onPress={continuar} />;
  ```
* **Qué campo lo decide:** El campo booleano **`canAskAgain`**. Si `granted` es `false` y `canAskAgain` es `true`, el estado es `preguntable` ("Continuar"). Si `canAskAgain` es `false`, el sistema operativo ya no permite mostrar el diálogo y el estado pasa a `bloqueado` ("Abrir Ajustes").

### 2. Revocá la cámara desde Ajustes con la app abierta y volvé. ¿Qué hace Android con la app? ¿Cómo se entera tu código del cambio?
* **Qué hace Android:** Por seguridad del sistema operativo, Android **mata de inmediato el proceso de la aplicación (`process kill`)** para purgar de memoria cualquier acceso a buffers de hardware. Al volver a abrir la app, esta se reinicia desde cero.
* **Cómo se entera tu código:** En caso de que se vuelva de Ajustes sin destrucción de proceso (o al volver a primer plano tras concederlo), el hook [`src/hooks/useRevisarAlVolver.ts`](file:///C:/Users/IPF-2026/Desktop/Trabajo%20Practico%20N3%20de%20React/mantenimiento-ipf/src/hooks/useRevisarAlVolver.ts) escucha el evento `AppState.addEventListener('change', ...)`: cuando el estado pasa de `inactive/background` a `active`, dispara la función de re-consulta pasiva y actualiza el estado en React.

### 3. ¿Por qué tu app no pide permiso para elegir una foto, pero sí para sacarla?
* **Para sacar una foto:** Se utiliza la cámara del hardware en vivo (`expo-camera` / `CameraView`), lo cual requiere acceso a los sensores del dispositivo y por ende el permiso peligroso `android.permission.CAMERA`.
* **Para elegir de la galería:** Se utiliza `ImagePicker.launchImageLibraryAsync()` con el **Photo Picker del sistema operativo**. Este componente corre en un proceso independiente del sistema: el usuario elige una única foto fuera de la app y el sistema le devuelve solo la URI temporal a la app, **sin que la app necesite permiso para leer la galería entera (`READ_MEDIA_IMAGES`)**.

### 4. ¿Qué cambia en la app si la persona elige ubicación aproximada? ¿Y si la deniega?
* **Si elige aproximada:** La función `obtenerUbicacion()` detecta `accuracy === 'coarse'`. La app oculta las coordenadas numéricas y muestra la leyenda general *"Ubicación aproximada"* respetando la privacidad.
* **Si la deniega:** La app **no se bloquea ni se cierra**. Ofrece inmediatamente el camino alternativo en [`src/app/reporte/ubicacion.tsx`](file:///C:/Users/IPF-2026/Desktop/Trabajo%20Practico%20N3%20de%20React/mantenimiento-ipf/src/app/reporte/ubicacion.tsx) para seleccionar manualmente el sector mediante chips interactivos (*Patio*, *Baños*, *Biblioteca*, *Estacionamiento*, etc.).

### 5. ¿Por qué tus textos de propósito no aparecían en Expo Go?
Porque Expo Go es un binario nativo pre-compilado distribuido a través de las tiendas que ya contiene su propio `Info.plist` con textos genéricos redactados por Expo. Los textos personalizados de `app.json` solo se incorporan al compilar una *development build* propia (`npx expo run:android` o EAS Build).

### 6. Si mañana agregás la nota de voz, ¿alcanza con publicar una actualización OTA? ¿Por qué?
**NO alcanza.** Las actualizaciones OTA (*Over-The-Air*) solo reemplazan el código JavaScript y assets en la app ya instalada. Grabar audio requiere el permiso nativo `android.permission.RECORD_AUDIO` en el `AndroidManifest.xml` y `NSMicrophoneUsageDescription` en el `Info.plist`. Todo cambio en los permisos declarados a nivel nativo **exige compilar y distribuir una nueva versión del binario (.apk / .aab / .ipa)**.

