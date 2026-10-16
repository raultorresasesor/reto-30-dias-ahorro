# Reto de ahorro de 30 días · Raúl Torres

Aplicación gratuita en español de México para conservar dinero con decisiones cotidianas. React 19 + Vite 7, CSS local y sin servicios de terceros. No requiere cuentas, backend, variables de entorno ni claves.

## Desarrollo

Requiere Node.js 22.12+ o 24 LTS y npm.

```sh
npm ci
npm run dev
```

Abre la ruta `/reto-30-dias-ahorro/` en la dirección que Vite muestra en la terminal (puerto 5173). En un entorno de desarrollo remoto, usa su reenvío de puertos. La aplicación no está publicada y no tiene todavía una URL pública.

En el entorno cloud actual, si la caché predeterminada no permite escritura:

```sh
npm ci --cache /tmp/reto-npm-cache
```

## Verificación

```sh
npm test
npm run build
npm run test:e2e
npm run test:production
```

Las pruebas de navegador usan Chromium instalado en `/usr/bin/chromium`. Para otro sistema, adapta `launchOptions.executablePath` en `playwright.config.js` o elimínalo y ejecuta `npx playwright install chromium`. Playwright inicia y detiene su servidor de pruebas automáticamente.

Las pruebas cubren importes inválidos, centavos, reemplazo de registros, promedio por día registrado, días fuera de orden, persistencia, categoría, reinicio con confirmación, datos corruptos, almacenamiento bloqueado, finalización, descarga PNG y tamaños de 320 a 1440 px. Se ejecutaron con Chromium y emulación móvil; falta la comprobación en dispositivos iPhone/Android reales y en el navegador interno de Instagram.

## Funcionamiento y privacidad

- Cinco niveles combinables, sin desbloqueos obligatorios.
- Cada día puede registrarse y editarse. “No” guarda la experiencia y su ahorro real sin incrementar los días completados. Para completar el reto se requieren 30 días con objetivo cumplido.
- Los importes se almacenan como centavos enteros. El promedio incluye todos los días registrados, también los de $0 o con objetivo no cumplido.
- Los datos se guardan únicamente en `localStorage`, clave `raul-torres-ahorro-v1`. No se transmiten a ningún servidor. No hay sincronización entre dispositivos ni respaldo remoto.
- Si el almacenamiento falla, se advierte al usuario. Los datos corruptos no se sobrescriben sin reinicio confirmado. Si localStorage está inaccesible desde el inicio, se permite registrar y editar en memoria con un aviso explícito: los cambios se pierden al recargar. Se aceptan importes como `1000`, `1,000` y `$1,000.00`; los separadores ambiguos se rechazan.
- El resultado se genera en PNG con Canvas. Se utiliza compartir archivos nativo cuando está disponible y descarga como alternativa. Solo incluye total, días completados y marca; no incluye notas ni categoría.
- El monograma RT es un espacio provisional de marca. Se puede sustituir por el logotipo oficial en el encabezado de `src/main.jsx` y colocar el archivo en `public/`.

## Estructura

- `src/main.jsx`: interfaz React, niveles, diálogos accesibles, persistencia y tarjeta para compartir.
- `src/model.js`: validación, recuperación, cálculos y motivación.
- `src/styles.css`: identidad visual, estilos responsive y movimiento reducido.
- `tests/model.test.js`: pruebas de lógica con Node.
- `tests/browser/app.spec.js`: pruebas funcionales con Playwright.
- `vite.config.js`, `index.html`, `package.json`, `package-lock.json`: configuración y dependencias reproducibles.

## Publicación, pendiente de autorización

```sh
npm ci
npm run build
npm run preview
```

`dist/` contiene el sitio estático listo para alojarse con HTTPS. `npm run preview` permite revisar la compilación localmente; no publica el proyecto.

El flujo `.github/workflows/pages.yml` ya está preparado. Solo tiene el disparador manual `workflow_dispatch`: subir cambios no publica automáticamente. Compila con Node 24, ejecuta las pruebas de lógica y las pruebas de navegador contra `dist/` bajo `/reto-30-dias-ahorro/`, y solo permite desplegar si pasan. GitHub usa Chromium de Playwright; la máquina cloud utiliza su Chromium instalado. No se han subido cambios, configurado Pages ni ejecutado Actions remotamente.

### Autorización y pasos para la publicación temporal

1. Autorizar la creación de un commit con la aplicación existente, sus pruebas y este flujo, y su subida a `main` de `raultorresasesor/reto-30-dias-ahorro`. Hasta ahora el remoto solo contiene el README inicial; hay que subir la aplicación completa, no únicamente el workflow.
2. En el repositorio, abrir **Settings → Pages → Build and deployment → Source → GitHub Actions**. Requiere permisos suficientes y disponibilidad de Pages en el plan/visibilidad actuales. No cambiar la visibilidad del repositorio para habilitarlo sin autorización.
3. Autorizar el despliegue temporal público. En **Actions → Publicar prueba en GitHub Pages → Run workflow**, elegir `main`. El job de despliegue utiliza únicamente `pages: write` e `id-token: write`; el build tiene `contents: read`. Si GitHub requiere aprobación del entorno `github-pages`, aprobar ese despliegue.
4. Abrir la URL HTTPS que muestre el job `deploy`. Sin dominio personalizado, la dirección esperada es `https://raultorresasesor.github.io/reto-30-dias-ahorro/`, pero no se considera disponible hasta confirmar el despliegue. No es un enlace privado: cualquiera que tenga la URL puede abrir el sitio.

### Comprobación personal en la URL pública

- Abrir el día 1, escribir una nota, ingresar `1000` o `$1,000`, seleccionar **Sí** y pulsar **Guardar mi día**.
- Confirmar que se cierra el diálogo, el día muestra una marca de completado, el resumen indica 1/30 y 3%, y el total es $1,000.00 MXN.
- Recargar y volver a abrir el día 1: deben conservarse nota, importe y respuesta. Volver a guardar el mismo importe no debe sumarlo otra vez. Cambiarlo a $1,250 debe reemplazar el total, no añadir otro registro.
- Repetir en Safari de iPhone, Chrome de Android y el navegador interno de Instagram. Si aparece un aviso de almacenamiento bloqueado, los registros solo se mantienen durante esa sesión. El guardado usa el origen HTTPS: los datos de archivos descargados, otra URL u otro navegador no se transfieren automáticamente.

No se ha validado el sitio en una URL pública ni en dispositivos reales. La ejecución del workflow en GitHub también está pendiente. La aprobación final de diseño y funcionamiento debe hacerse personalmente antes de compartir la URL desde ManyChat.

Para retirar la publicación temporal, usar **Settings → Pages → Unpublish site**, según la opción disponible en GitHub. El workflow manual no vuelve a publicar hasta ejecutarlo de nuevo. No se ha programado una fecha automática de retirada.
