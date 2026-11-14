# SRICU-ULS — Frontend

Interfaz del Sistema de Repositorio Inteligente de Conocimiento Universitario de la Universidad Luterana Salvadoreña. Implementada con **Vue 3, Quasar 2, Vue Router 4, Pinia y Axios**, según el documento de segundo avance. Vite genera una SPA estática con rutas hash, compatible con hosting estático.

## Ejecutar en Windows

Requiere Node.js 22.12 o superior (recomendado Node 24) y npm.

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abrir la dirección local indicada por Vite, normalmente `http://localhost:5173`. En PowerShell se usa `npm.cmd` para evitar restricciones de ejecución de `npm.ps1`. En Linux y macOS usar `npm`.

El valor predeterminado de `VITE_API_URL` apunta a `https://sricu-uls-api.onrender.com/api`. Para un backend local, cambiarlo en `.env` y reiniciar Vite:

```dotenv
VITE_API_URL=http://localhost:8000/api
VITE_MAX_UPLOAD_MB=20
```

`VITE_MAX_UPLOAD_MB` debe coincidir con `MAX_UPLOAD_KB / 1024` en Laravel. El servidor valida definitivamente tipos, tamaño, permisos y estados. Las variables `VITE_*` son públicas; no almacenar contraseñas o secretos en ellas. El backend debe admitir el origen del frontend mediante CORS, los métodos utilizados y las cabeceras `Authorization`, `Accept` y `Content-Type`. Las credenciales las proporciona el administrador; no hay cuentas ni contraseñas precargadas en este repositorio.

## Funciones

- Inicio con envíos recientes obtenidos de la API.
- Consulta paginada con búsqueda por título y descripción; filtros de autoría, fechas, categoría, tipo, palabra clave y colección; ordenamiento y limpieza de filtros.
- Colecciones con sus conteos públicos reales, ficha de recursos, referencia bibliográfica y descarga autorizada de archivos.
- Inicio y cierre de sesión mediante tokens de Laravel Sanctum, recuperación del perfil con `/me`, rutas privadas y navegación según rol. El token se almacena en `sessionStorage` de la pestaña.
- Depósitos de documentos y proyectos: metadatos, autores, licencia, descripción técnica, adjuntos, borrador y envío a revisión.
- Revisión con aprobación o devolución y observaciones, publicación con nivel de acceso y retiro con motivo.
- Administración de autores, categorías, colecciones, palabras clave y licencias; usuarios y roles para administradores.
- Estadísticas por periodo y consulta paginada de auditoría para gestores y administradores.
- Estados de carga, fallos de conexión, validaciones de Laravel, ausencia de resultados y confirmación de operaciones destructivas.
- Diseño adaptable a escritorio y móvil, navegación con teclado, etiquetas e iconos Material Icons servidos localmente.

La interfaz utiliza búsqueda por texto y filtros. La opción de búsqueda semántica fue retirada del frontend; el endpoint opcional del backend permanece sin cambios.

## Roles y rutas

| Área | Ruta | Acceso |
| --- | --- | --- |
| Consulta | `/#/`, `/#/explorar`, `/#/comunidades`, `/#/novedades` | Público |
| Ficha | `/#/recursos/:id` | Según visibilidad del recurso |
| Depósitos | `/#/depositos`, `/#/depositos/nuevo` | Depositante, gestor, administrador |
| Revisión | `/#/revision` | Revisor, administrador |
| Publicación | `/#/publicacion` | Gestor, administrador |
| Estadísticas | `/#/estadisticas` | Gestor, administrador |
| Catálogos | `/#/administracion` | Gestor, administrador |
| Usuarios | Pestaña de administración | Administrador |
| Auditoría | `/#/auditoria` | Gestor, administrador |

La autorización efectiva siempre corresponde a Laravel. La interfaz refleja las políticas consultadas del backend.

## Compilación y Docker

```powershell
npm.cmd run build
npm.cmd run preview
```

El resultado se genera en `dist/`. Puede publicarse en cualquier servicio de archivos estáticos. La URL de la API se incorpora al compilar; cambiarla requiere recompilar.

```powershell
docker compose up --build -d
```

Abrir `http://localhost:8080`. Compose construye únicamente el frontend y lo sirve con Nginx; Laravel y PostgreSQL se mantienen en el repositorio backend. Para apuntar a un Laravel expuesto desde el equipo anfitrión, usar su URL accesible **desde el navegador**, por ejemplo `http://localhost:8000/api`. No usar el nombre interno de un contenedor como URL pública.

## Pruebas

```powershell
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Las pruebas de dominio comprueban propiedad, roles, estados, tipos de archivo, límites y enlaces externos. Las pruebas en Chromium comprueban navegación pública, sesión y destino de retorno, rechazo por rol, validaciones, fallo del servidor, depósito y adaptación móvil. Usan una API simulada y no escriben en Render. Para reutilizar un navegador compatible ya instalado, definir `PLAYWRIGHT_CHROMIUM_EXECUTABLE` con la ruta de su ejecutable. La configuración selecciona automáticamente `npm.cmd` en Windows y `npm` en Linux y macOS.

## Estructura

```text
src/
  components/    Componentes de presentación y estados asíncronos
  pages/         Vistas públicas, depósitos y administración
  services/      Cliente Axios, errores y descargas
  stores/        Sesión y catálogos con Pinia
  domain.js      Estados, permisos y validaciones compartidas
  router.js      Rutas y controles de acceso
  styles.css     Paleta y diseño adaptable
tests/           Pruebas de dominio y navegador
docs/            Contrato OpenAPI y decisiones de integración
```

## Referencias y límites

- [Wireframes del equipo](https://www.figma.com/design/utFfEMfEqIsvQAGJxToDzk/SRID-ULS-%E2%80%94-Wireframes-web-desktop-y-flujos?node-id=0-1): el diseño detallado y la captura de inicio se consultaron. Las consultas de otras pantallas quedaron limitadas por la cuota del plan Figma; estas se construyeron con los requisitos del documento y los componentes compartidos. Su comparación visual completa queda pendiente.
- [Documentación API](https://sricu-uls-api.onrender.com/api/documentation) y [backend](https://github.com/jr5406536-svg/Backend_sricu-uls). Se conserva una copia del contrato en `docs/openapi.yaml`; consultar el servidor para cambios posteriores.
- Se usa SRICU-ULS, como el documento y la API; el wireframe utiliza SRID. Confirmar la denominación definitiva con el equipo.
- La API no incluye comunidades jerárquicas, migración por lotes, respaldos, configuración institucional, registro público ni recuperación automática de contraseña. Se usa el catálogo real de colecciones; no se presentan operaciones inexistentes como implementadas.
- `/stats` y `/audit-logs` requieren gestor o administrador, aunque el wireframe presenta estadísticas públicas.
- La API no filtra por propietario. Mis depósitos recorre las páginas visibles y pagina los registros propios localmente; para un catálogo grande conviene incorporar un endpoint de depósitos propios en Laravel.
- Los formularios de acceso y gestión necesitan cuentas reales para una prueba integral contra Render. Las pruebas automatizadas usan respuestas simuladas. Docker requiere una verificación adicional en un equipo con Docker disponible.
- El equipo debe completar el canal de soporte y aprobar las políticas institucionales antes de publicar.

## Preparar el repositorio

`node_modules`, `dist`, `.env` y resultados de pruebas están excluidos mediante `.gitignore`. Subir código fuente, `package-lock.json`, documentación y configuración. No se han creado commits ni se ha subido el proyecto a ningún repositorio remoto.
# Frontend_sricu-uls
# Frontend_sricu-uls
# Frontend_sricu-uls
# Frontend_sricu-uls
# Frontend_sricu-uls
