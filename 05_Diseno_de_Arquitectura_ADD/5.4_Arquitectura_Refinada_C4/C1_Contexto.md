# C4 · Nivel 1 · Contexto

**Vista en Structurizr:** `C1_Contexto` (archivo [workspace.dsl](workspace.dsl)).

El diagrama de contexto muestra a VIVO como una caja negra: quién lo usa y con qué sistemas externos se comunica. VIVO es un **puente** entre el operador (por WhatsApp) y el RNDC. No controla a ninguno de los dos sistemas externos.

## Elementos

| Elemento | Tipo | Descripción |
|---|---|---|
| Operador autorizado | Persona | Empleado de una empresa de transporte. Solicita y consulta manifiestos por WhatsApp. |
| Administrador VIVO | Persona | Atiende incidencias, conciliaciones y casos de revisión manual. |
| **VIVO** | Sistema en alcance | Recibe, valida y registra solicitudes, las tramita ante el RNDC y notifica el estado real. |
| WhatsApp Business Platform | Sistema externo | Canal de mensajería: entrega los mensajes entrantes y envía las respuestas. |
| RNDC | Sistema externo | Registro oficial del Ministerio de Transporte. Expide y valida el manifiesto. |

## Relaciones

| Origen | Destino | Descripción | Tecnología |
|---|---|---|---|
| Operador autorizado | WhatsApp | Envía solicitudes y consulta el estado | Chat WhatsApp |
| WhatsApp | VIVO | Entrega los mensajes entrantes (webhook firmado) | HTTPS |
| VIVO | WhatsApp | Responde y envía notificaciones de estado | API HTTPS |
| VIVO | RNDC | Solicita la expedición y consulta el estado | Servicio web autorizado |
| Administrador VIVO | VIVO | Revisa casos, conciliaciones y auditoría | HTTPS |
| VIVO | Administrador VIVO | Envía alertas | Correo / mensajería |
