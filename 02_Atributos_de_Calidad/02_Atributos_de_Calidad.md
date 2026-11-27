# 2. Identificación de Atributos de Calidad

Identificamos los atributos de calidad a partir del contexto del problema (Punto 1):

- **Explícitos:** aparecen en las metas, los requisitos o las restricciones.
- **Implícitos:** no están escritos, pero se deducen del dominio (trámite legal, datos personales, dependencia de terceros).

Los agrupamos con la clasificación vista en clase: operacionales, estructurales y transversales.

## 2.1 Atributos identificados

### Operacionales

Cómo se comporta el sistema mientras funciona.

| Atributo | Tipo | Por qué aparece en VIVO | Ref. |
|---|---|---|---|
| Disponibilidad | Explícito | El servicio debe recibir solicitudes **24/7**, aun si el RNDC o WhatsApp fallan. | MN-01 |
| Desempeño | Explícito | Hay ráfagas de solicitudes en la madrugada, y la recepción no debe esperar al RNDC. | MN-02, 1.9 |
| Recuperabilidad | Implícito | Las solicitudes pendientes deben retomarse después de una falla. | RF-07 |
| Observabilidad | Implícito | El equipo debe ver en tiempo real la salud del sistema (logs, métricas y alertas): si el RNDC falla, cuántas solicitudes están pendientes y cuánto llevan esperando. | RF-07, RF-10 |

### Estructurales

Cómo está construido el sistema y qué tan fácil es cambiarlo.

| Atributo | Tipo | Por qué aparece en VIVO | Ref. |
|---|---|---|---|
| Interoperabilidad | Explícito | VIVO se conecta con **varios proveedores externos**: WhatsApp Business Platform (mensajería) y RNDC (servicio web oficial), cada uno con su propio contrato, formato y reglas. | RF-05, RF-08, RT-01, RT-02 |
| Configurabilidad | Explícito | VIVO debe **adaptarse a cambios** sin desplegar código nuevo. Se configuran las reglas de validación del manifiesto, las empresas y usuarios autorizados, los parámetros de integración (tiempos límite, reintentos, umbrales) y los textos de los mensajes. | MN-05 |
| Mantenibilidad | Implícito | Un equipo pequeño debe poder corregir y evolucionar el sistema. Los cambios del RNDC no deben propagarse a todo el código. | MN-05, RT-05 |
| Testabilidad | Implícito | Se debe poder probar el sistema sin depender del RNDC ni de WhatsApp reales (simuladores, pruebas de contrato), y verificar las medidas de los escenarios: 0 pérdidas y 0 accesos cruzados. | RT-01, 1.9 |

### Transversales

Aplican a todos los componentes del sistema, no a uno solo.

| Atributo | Tipo | Por qué aparece en VIVO | Ref. |
|---|---|---|---|
| Seguridad | Explícito | Cada operador solo puede ver y tramitar solicitudes de su empresa, y se manejan datos personales (Ley 1581 de 2012). Aplica en la recepción, la consulta, la integración y el almacenamiento. | RF-01, MN-03, RT-03 |
| Integridad de los datos | Explícito | No perder ni duplicar solicitudes, y nunca reportar «emitido» sin confirmación del RNDC. Cada componente que lee o cambia un estado debe respetarlo. | MN-04, RF-06 |
| Trazabilidad | Explícito | Cada solicitud debe poder seguirse de principio a fin: quién la hizo, qué estados tuvo, qué intentos se hicieron y qué respondió el RNDC. | RF-09, MN-04 |
| Usabilidad | Explícito | El operador usa un canal familiar (WhatsApp) con un flujo de captura sencillo y mensajes claros del estado real. | MN-02, RF-02 |

> **Trazabilidad vs. observabilidad:** la trazabilidad es de negocio: registra qué le pasó a cada solicitud y sirve como evidencia. La observabilidad es técnica: muestra la salud del sistema en ejecución para detectar y diagnosticar fallas.

## 2.2 Los cinco atributos más importantes

Estos cinco atributos son los **drivers de arquitectura** que guían el diseño ADD (Punto 5). Los escogimos porque cumplen a la vez cuatro condiciones:

- **Evidencia:** salen de una meta, un requisito o una restricción del Punto 1.
- **Impacto estructural:** si se ignoran, la arquitectura sería distinta.
- **Costo del fallo:** su incumplimiento es grave para el negocio.
- **Incertidumbre:** dependen de algo que VIVO no controla.

| # | Atributo | Por qué es de los más importantes | Qué obliga a diseñar |
|---|---|---|---|
| 1 | **Disponibilidad** | Es la promesa principal del servicio (24/7, MN-01). Depende del RNDC, que ha tenido intermitencias y contingencias oficiales en 2026 [F3, F4]. | Separar la recepción del trámite, cola durable, estado pendiente y corte de llamadas ante fallas. |
| 2 | **Integridad de los datos** | El error más costoso de VIVO no es la caída sino perder o duplicar una solicitud, o reportar «emitido» sin confirmación (MN-04, RF-04, RF-06). Es un riesgo legal. | Identificador interno estable, idempotencia, guardar y publicar sin pérdida, máquina de estados y conciliación antes de reintentar. |
| 3 | **Seguridad** | Varias empresas comparten el sistema y se manejan datos personales (MN-03, RT-03, Ley 1581). El número de WhatsApp no prueba por sí solo la identidad (RF-01). | Asociación usuario-empresa, autorización en cada operación, aislamiento de datos por empresa y auditoría. |
| 4 | **Interoperabilidad** | VIVO es un puente: su valor depende de integrarse bien con dos proveedores con contratos distintos, el RNDC y WhatsApp (RT-01, RT-02). | Un adaptador aislado por proveedor, traducción de contratos y clasificación de respuestas. |
| 5 | **Trazabilidad** | El manifiesto es un documento legal: VIVO debe poder demostrar qué pasó con cada solicitud (RF-09, RF-10). También es la base para conciliar respuestas inciertas del RNDC. | Historial inmutable de estados e intentos, correlacionado por el identificador interno. |

Los demás atributos no se descartan, sino que quedan cubiertos por estos cinco:

- La **configurabilidad** y la **mantenibilidad** se apoyan en el aislamiento de las integraciones (Interoperabilidad). Además, no hay evidencia de qué tan seguido cambia el RNDC como para que sean un driver propio.
- El **desempeño** se logra con la misma separación entre recepción y trámite que exige Disponibilidad. El volumen esperado es bajo (unas 1.500 solicitudes al día).
- La **observabilidad** y la **recuperabilidad** apoyan a Disponibilidad y Trazabilidad.
- La **usabilidad** se resuelve en el diseño de la conversación por WhatsApp, no en la estructura.
- La **testabilidad** es la condición para comprobar las medidas de los escenarios del Punto 3.
