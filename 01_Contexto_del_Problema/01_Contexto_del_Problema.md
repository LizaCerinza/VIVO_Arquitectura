# 1. Contexto del Problema

## 1.1 Contexto y necesidad del negocio

VIVO es la solución que proponemos para que las empresas de transporte de carga gestionen sus solicitudes de **manifiestos electrónicos de carga** a través de **WhatsApp**. El proceso actual obliga al operador a recopilar la información del viaje (remesas, vehículo, conductor, origen/destino, valores), verificar condiciones, tramitar la expedición ante el **Registro Nacional de Despachos de Carga (RNDC)** del Ministerio de Transporte y avisar el resultado a quien lo pidió, normalmente saltando entre varios sistemas y canales.

El negocio espera:

- Recibir solicitudes **24/7** por un canal que los operadores ya usan (WhatsApp).
- Reducir el tiempo y los errores de digitación en el trámite.
- Dar al usuario **visibilidad del estado real** de su solicitud.

La mayor dificultad de arquitectura es la **dependencia de servicios externos que VIVO no controla**. VIVO controla la recepción, el registro y el seguimiento, pero no la disponibilidad del RNDC ni sus validaciones. La empresa de transporte expide el manifiesto a través del RNDC, que ofrece integración mediante servicios web [F2, F5]. Se han reportado episodios públicos de lentitud e intermitencia: en mayo de 2026 el Ministerio informó una afectación por solicitudes anómalas y en septiembre de 2026 activó un plan oficial de contingencia [F3, F4]. Por eso la continuidad debe diseñarse **sin suponer que el servicio externo siempre responde**.

## 1.2 Problema de arquitectura

> ¿Cómo lograr que VIVO reciba y administre solicitudes de manifiestos de forma **segura** y con **tiempos de respuesta razonables**, incluso cuando el RNDC o WhatsApp fallan, **sin perder ni duplicar** registros y **sin atribuirse una emisión que todavía no está confirmada** oficialmente?

## 1.3 Metas del negocio

| ID | Meta del negocio | Atributos de calidad asociados |
|---|---|---|
| MN-01 | Ofrecer recepción de solicitudes 24/7 por WhatsApp, aun con fallas del RNDC. | Disponibilidad, recuperabilidad |
| MN-02 | Reducir el tiempo que el operador dedica a tramitar un manifiesto (meta propuesta: −50 % frente al proceso manual). | Desempeño, usabilidad |
| MN-03 | Proteger la información de cada empresa y cumplir la Ley 1581 de 2012 (protección de datos personales). | Seguridad, privacidad, legalidad |
| MN-04 | Garantizar que el estado informado sea verídico: nunca reportar «emitido» sin confirmación del RNDC. | Integridad, confiabilidad |
| MN-05 | Adaptarse a cambios normativos o técnicos del RNDC sin rehacer el sistema. | Modificabilidad, interoperabilidad |

## 1.4 Usuarios y actores

| Actor | Tipo | Relación con VIVO | Volumen estimado (supuesto) |
|---|---|---|---|
| Operador autorizado | Usuario primario | Envía y consulta solicitudes desde WhatsApp en nombre de una empresa de transporte. | 300 operadores (≈ 60 empresas × 5) |
| Empresa de transporte | Cliente / responsable legal | Responsable de la expedición del manifiesto conforme a la normativa. | 60 empresas en el primer año |
| Administrador VIVO | Usuario interno | Consulta incidencias, conciliaciones, seguimiento y auditoría; no sustituye las autorizaciones de la empresa. | 3–5 personas |
| WhatsApp Business Platform | Sistema externo | Transporta mensajes (webhooks) y notificaciones. Dependencia externa. | — |
| RNDC (MinTransporte) | Sistema externo | Sistema oficial donde se registra y valida el manifiesto. Dependencia externa. | — |

## 1.5 Alcance y exclusiones

| Incluye | No incluye |
|---|---|
| Recepción de datos y validación inicial de la solicitud. | Gestión de flotas, rutas, GPS o costos de transporte. |
| Identificación del usuario y verificación de su empresa. | Facturación, cartera, pagos y suscripciones. |
| Registro, seguimiento y control de estados. | Reemplazar el RNDC o expedir documentos oficiales por cuenta propia. |
| Integración autorizada con el RNDC, manejo de fallas y conciliación. | Automatizar contingencias oficiales sin verificar su habilitación. |
| Notificación del resultado por WhatsApp. | Trámites del RNDC distintos al manifiesto de carga. |

## 1.6 Flujo funcional resumido

1. Un operador autorizado inicia la solicitud por WhatsApp.
2. VIVO identifica al usuario, verifica su empresa y solicita los datos requeridos.
3. Registra la solicitud con un identificador interno y valida que esté completa.
4. Cuando corresponde, envía el trámite al RNDC por el mecanismo autorizado.
5. Registra el resultado: confirmado, rechazado, pendiente o pendiente de conciliación.
6. Informa al usuario el estado real. Solo presenta el manifiesto como emitido si existe confirmación oficial.

> **Límite:** si el Ministerio activa un procedimiento oficial de contingencia, la empresa aplica las reglas vigentes de ese procedimiento. VIVO no inventa rutas alternativas ni genera por sí mismo un manifiesto oficial [F4].

## 1.7 Requerimientos funcionales

| ID | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-01 | Identificar al remitente y verificar su autorización para actuar por una empresa. | Alta |
| RF-02 | Capturar y validar los datos necesarios para preparar la solicitud. | Alta |
| RF-03 | Relacionar la solicitud con la empresa autorizada y los registros previos exigibles (remesas, vehículo, conductor). | Alta |
| RF-04 | Guardar la solicitud y asignarle un identificador interno único. | Alta |
| RF-05 | Solicitar el trámite al RNDC exclusivamente por el mecanismo autorizado. | Alta |
| RF-06 | Consultar y actualizar el estado del trámite sin crear registros duplicados. | Alta |
| RF-07 | Administrar solicitudes pendientes durante fallas o respuestas inciertas. | Alta |
| RF-08 | Notificar por WhatsApp confirmaciones, rechazos y estados pendientes. | Media |
| RF-09 | Conservar historial de cambios de estado, intentos y responsables. | Media |
| RF-10 | Permitir a personal autorizado revisar casos que exigen atención manual. | Media |

## 1.8 Restricciones y supuestos

| ID | Tipo | Descripción |
|---|---|---|
| RT-01 | Restricción (externa) | El manifiesto solo es válido si lo registra el RNDC; su integración exige credenciales y requisitos técnicos del Ministerio [F2, F5]. |
| RT-02 | Restricción (externa) | El canal de usuario es WhatsApp Business Platform; se aceptan sus políticas, plantillas y límites de mensajería. |
| RT-03 | Restricción (legal) | Tratamiento de datos personales de conductores y propietarios conforme a la Ley 1581 de 2012. |
| RT-04 | Restricción (operativa) | No enviar solicitudes masivas ni reintentar sin control: no saturar la integración oficial. |
| RT-05 | Restricción (equipo) | Equipo pequeño (2–4 desarrolladores): la arquitectura debe ser operable sin una plataforma compleja. |
| SP-01 | Supuesto | VIVO es un servicio de gestión de solicitudes con recepción 24/7. |
| SP-02 | Por validar | Credenciales, condiciones del servicio web vigente y permisos de cada empresa ante el RNDC. |
| SP-03 | Por validar | Volumen real, concurrencia, presupuesto, disponibilidad contratada y retención de datos. |

## 1.9 Estadísticas y métricas de uso relevantes

Como VIVO es una propuesta, **no hay datos históricos propios**. Planteamos un modelo de carga con supuestos explícitos que se validarán con el negocio antes de aprobar la arquitectura:

| Indicador | Valor estimado / meta | Fuente o razonamiento |
|---|---|---|
| Empresas y operadores | 60 empresas, 300 operadores | Supuesto del primer año (SP-03). |
| Solicitudes por día | ≈ 1.500 manifiestos/día (≈ 25 por empresa) | Supuesto de operación. |
| Mensajes WhatsApp por solicitud | 10–15 mensajes (captura conversacional) | Flujo de 1.6 → ≈ 20.000 mensajes/día. |
| Hora pico | 40 % del volumen entre 5:00–9:00 a. m. (despachos tempranos) → ≈ 150 solicitudes/h, ráfagas de 50 eventos simultáneos | Supuesto; base de la prueba EC-02. |
| Latencia de recepción | p95 ≤ 3 s para registrar y confirmar internamente, sin contar la entrega de WhatsApp | Meta propuesta. |
| Disponibilidad de recepción | ≥ 99,5 % mensual del canal de entrada de VIVO (medida aparte de la del RNDC) | Meta propuesta. |
| Integridad | 0 solicitudes aceptadas perdidas; 0 manifiestos marcados como emitidos sin evidencia | Criterio en pruebas de falla controlada. |
| Accesos no autorizados | 100 % de intentos entre empresas rechazados y auditados | Criterio de prueba (EC-03). |
| Fallas del RNDC | Episodios públicos de intermitencia en 2026; contingencia oficial activada | [F3, F4]; justifica el desacoplamiento. |
| Otros indicadores operativos | % de rechazo del RNDC, antigüedad de pendientes, tiempo de conciliación | Línea base por levantar en piloto. |

> **Nota para el comité:** los volúmenes son supuestos de diseño, no mediciones. Lo que importa arquitectónicamente es que (a) el pico es concentrado en la madrugada, (b) la dependencia externa es intermitente y (c) el error de mayor costo no es la lentitud sino **perder o duplicar** una solicitud o reportar un estado falso.
