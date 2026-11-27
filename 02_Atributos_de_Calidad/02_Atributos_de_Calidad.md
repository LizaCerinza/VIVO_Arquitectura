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
| Archivabilidad | Implícito | Las solicitudes, el historial de estados y la auditoría deben **conservarse** durante el tiempo que exija la normativa. Después se archivan en almacenamiento secundario o se eliminan, sobre todo los datos personales. | RF-09, RT-03, SP-03 |
| Usabilidad | Explícito | El operador usa un canal familiar (WhatsApp) con un flujo de captura sencillo y mensajes claros del estado real. | MN-02, RF-02 |

> **Trazabilidad vs. observabilidad:** la trazabilidad es de negocio: registra qué le pasó a cada solicitud y sirve como evidencia. La observabilidad es técnica: muestra la salud del sistema en ejecución para detectar y diagnosticar fallas.

## 2.2 Los cinco atributos más importantes

| # | Atributo | Por qué es de los más importantes |
|---|---|---|
| 1 | **Disponibilidad** | Es la promesa principal del servicio (24/7). El mayor riesgo es depender de terceros que VIVO no controla, y eso obliga a separar la recepción del trámite. |
| 2 | **Interoperabilidad** | Todo el valor de VIVO depende de comunicarse bien con varios proveedores. Cada uno necesita su propio punto de integración, aislado del resto del sistema. |
| 3 | **Seguridad** | Un acceso cruzado entre empresas expondría datos personales y permitiría tramitar a nombre de otra empresa: es un riesgo legal y de confianza. |
| 4 | **Trazabilidad** | El manifiesto es un documento legal. VIVO debe poder demostrar qué pasó con cada solicitud, sobre todo cuando la respuesta del RNDC es incierta. |
| 5 | **Archivabilidad** | Los datos del trámite deben conservarse por obligación legal, pero no pueden crecer sin control ni guardar datos personales más tiempo del permitido. Esto define cómo se almacenan, se archivan y se eliminan. |

Los demás atributos no se descartan, sino que quedan cubiertos por estos cinco o se tratan como transversales:

- La **integridad de los datos** y la **usabilidad**, como la seguridad, son transversales: se exigen en todos los componentes y en todos los escenarios.
- La **observabilidad** y la **recuperabilidad** apoyan a Disponibilidad y Trazabilidad.
- La **configurabilidad** y la **mantenibilidad** se logran al aislar las integraciones y sacar las reglas del código, que es lo que pide Interoperabilidad.
- La **testabilidad** es la condición para comprobar las medidas de los escenarios del Punto 3.
- El **desempeño** se atiende con la misma separación entre recepción y trámite que exige Disponibilidad.
