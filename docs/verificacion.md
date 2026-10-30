# Verificación de la entrega

Validación realizada el 29 de octubre de 2026, según la fecha de trabajo del usuario.

| Comprobación | Resultado |
| --- | --- |
| Compilación de producción con Vite | Correcta, genera `dist/` |
| Pruebas de dominio | 5 aprobadas |
| Pruebas de navegador Chromium | 11 aprobadas |
| Lectura real de Render desde navegador | Inicio y colecciones correctos, sin API simulada |
| Dependencias npm | 0 vulnerabilidades reportadas tras la instalación final |
| Revisión visual de inicio | Capturas de escritorio 1440 px y móvil 390 px revisadas |
| Desbordamiento horizontal móvil | No detectado a 390 px |

Las pruebas de navegador incluyen consulta y ficha, sesión y retorno a la ruta solicitada, rechazo de acceso por rol, error del servidor, escritorio y móvil, acceso a estadísticas y administración, creación de depósito con metadatos, confirmación del envío, errores de campo de Laravel, devolución con observaciones y confirmación del nivel de acceso para publicar. Las escrituras se interceptaron con respuestas simuladas y no modificaron Render.

Para ejecutar opcionalmente la lectura real desde PowerShell:

```powershell
$env:RUN_LIVE_API_READS = '1'
npm.cmd run test:e2e
```

Sin esta variable, la comprobación de Render se omite y las otras diez pruebas usan respuestas simuladas. Se utilizó un Chromium ya instalado mediante `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

Pendiente de aceptación con el equipo: acceso y escrituras contra Render con cuentas reales de cada rol; prueba real de carga y descarga de archivos autorizados; arranque con Docker (no disponible en el entorno); comparación visual de las pantallas restantes de Figma, cuya consulta detallada alcanzó la cuota del plan. Las capturas de prueba son locales y están excluidas de Git.
