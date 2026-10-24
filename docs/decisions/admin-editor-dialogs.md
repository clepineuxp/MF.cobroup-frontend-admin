# Editores administrativos bajo demanda

Fecha: 2026-10-23. Solicitud del propietario; maestro COBROUP 1.14.0, framework frontend 1.0.

Plantillas, rutas, usuarios y medios de pago presentan la lista como vista inicial. Nuevo instancia el modal con valores iniciales; clic en tarjeta/fila abre edición precargada, con acceso por teclado. No hay un botón Editar independiente. Las restricciones actuales de permisos, validación y contratos se mantienen.

El diálogo genérico en shared/ui es independiente del negocio. Usa dialog.showModal(), foco nativo contenido, título accesible y restauración del foco/scroll al destruirse. Cancelar, Escape, X y clic fuera del rectángulo cierran cuando no hay una escritura pendiente. El formulario se instancia mediante @if y sale del DOM al cerrar.

Guardar bloquea campos, envío duplicado y cierre; éxito cierra y actualiza lista. Fallo mantiene el modal y mensaje con borrador conservado, excepto contraseñas que se limpian según la política previa. Cerrar descarta borrador, sin escribir. Las plantillas muestran carga de detalle; respuestas tardías no modifican un editor cerrado o nuevo. Si falla la consulta no se habilita edición con datos incompletos.

Activar/desactivar un medio de pago conserva su acción separada y no propaga el clic a la edición. No se cambian backend, datos, almacenamiento ni alcance offline/PWA. Evidencias de pruebas y límites en AGENTS.md.
