# Decisiones de integración

Las fuentes del proyecto son el documento local de segundo avance, el wireframe Figma y el contrato de la API. Se extrajeron del documento los requisitos de tecnología, funcionalidad y presentación; su contenido se trató como referencia del proyecto, separado de las instrucciones del usuario.

El documento especifica Vue 3, Quasar, Vue Router, Pinia, Axios, Sanctum y Docker Compose. La paleta utilizada es principal `#173B63`, acción `#2869A6`, fondo `#F3F6FA`, superficie `#FFFFFF`, éxito `#25845B`, advertencia `#B7791F`, error `#B42318`, texto `#233244` y borde `#D2DCE7`.

Inicio conserva la estructura consultada de Figma: cabecera institucional de 76 px, navegación de 50 px, título, búsqueda destacada, tres accesos de exploración, envíos recientes y pie. Se adapta a pantallas pequeñas con columnas apiladas. La sigla, los conteos y los recursos se alinean con el documento y el servidor; las cifras ilustrativas del wireframe no se presentan como reales. No hay imágenes o SVG estáticos en el diseño de inicio que requieran descarga.

Los catálogos se reciben como `{ data: [...] }`; los recursos y usuarios paginados incluyen `meta`; las fichas se reciben como `{ data: {...} }`. Login entrega `access_token` y `user`, y el perfil se recupera con `GET /me`. Las descargas usan Axios con Bearer y respuesta binaria, evitando exponer el token en enlaces.

Los estados son `borrador`, `revision`, `observado`, `aprobado`, `publicado`, `retirado`. El endpoint de revisión recibe `decision: aprobado|devuelto`; la devolución genera el estado `observado`. Publicar recibe `access_level: publico|autenticado|restringido`. Retirar exige `reason`.

La API limita archivos a PDF, DOC, DOCX, ODT, PPT, PPTX, ZIP y TXT; `MAX_UPLOAD_KB` vale 20480 por defecto. Los proyectos exigen `technical_description`. Las colecciones exponen `published_count`. El actor de auditoría se devuelve como cadena `user`.

Las cuentas reales no se modificaron durante la implementación. Las escrituras se verifican mediante pruebas de navegador con interceptación de API. La lectura pública real se comprobó en recursos y colecciones. Una aceptación final requiere probar con cuentas de cada rol, CORS del origen de despliegue y archivos autorizados de prueba.
