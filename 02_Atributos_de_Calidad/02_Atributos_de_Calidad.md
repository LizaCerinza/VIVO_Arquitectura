# 2. Identificación de Atributos de Calidad

## 2.1 Método

Seguimos el enfoque visto en clase (*Características de Arquitectura*, Richards & Ford): las características se descubren de tres fuentes:

1. **Preocupaciones del dominio:** las metas del negocio (MN).
2. **Requisitos:** los requerimientos funcionales (RF), las restricciones (RT) y las métricas (sección 1.9).
3. **Conocimiento implícito del dominio:** lo que nadie escribe pero se sabe del contexto (dependencia del RNDC, datos personales, trámite legal).

Un atributo es **explícito** si aparece en el enunciado o en los requisitos. Es **implícito** si lo deducimos del dominio. Para que sea una característica de arquitectura debe cumplir los tres criterios de clase:

- (a) Es una consideración de diseño independiente del dominio.
- (b) Influye en la estructura.
- (c) Es crítica para el éxito.

## 2.2 Relación entre la descripción del problema y los atributos de calidad

| # | Fragmento del problema (sección 1) | Ref. | Atributo de calidad | Tipo |
|---|---|---|---|---|
| 1 | «Recibir solicitudes **24/7** por WhatsApp, aun con fallas del RNDC» | MN-01, SP-01 | Disponibilidad | Explícito |
| 2 | «El RNDC ha tenido episodios de **lentitud e intermitencia**; se activó un plan de contingencia» | 1.1, [F3, F4] | Disponibilidad / tolerancia a fallas | Implícito |
| 3 | «Las operaciones pendientes deben **retomarse** tras una interrupción» | RF-07 | Recuperabilidad | Implícito |
| 4 | «**Ráfagas de 50 eventos** simultáneos en la hora pico; p95 ≤ 3 s para registrar» | 1.9 | Desempeño | Explícito |
| 5 | «Reducir el **tiempo** que el operador dedica al trámite» | MN-02 | Desempeño / usabilidad | Explícito |
| 6 | «Verificar su autorización para **actuar por una empresa**» | RF-01, MN-03 | Seguridad (autenticación y autorización) | Explícito |
| 7 | «Datos personales de conductores y propietarios: **Ley 1581 de 2012**» | RT-03 | Seguridad / privacidad / legalidad | Explícito |
| 8 | «El número de WhatsApp **no demuestra** que el remitente pueda actuar por la empresa» | ADR-004 | Seguridad | Implícito |
| 9 | «Integración **exclusivamente por el mecanismo autorizado** del RNDC» | RF-05, RT-01 | Interoperabilidad | Explícito |
| 10 | «Mensajes y notificaciones por **WhatsApp Business Platform**» | RT-02, RF-08 | Interoperabilidad | Explícito |
| 11 | «Adaptarse a **cambios normativos o técnicos** del RNDC sin rehacer el sistema» | MN-05 | Modificabilidad | Explícito |
| 12 | «**Nunca** reportar emitido sin confirmación; **sin duplicar** registros» | MN-04, RF-06 | Integridad / confiabilidad | Explícito |
| 13 | «Conservar **historial** de estados, intentos y responsables» | RF-09 | Auditabilidad / trazabilidad | Explícito |
| 14 | «Revisar casos que exigen **atención manual**; antigüedad de pendientes» | RF-10, 1.9 | Observabilidad / soportabilidad | Implícito |
| 15 | «Canal **familiar** para el operador; captura conversacional de datos» | 1.1, RF-02 | Usabilidad | Explícito |
| 16 | «60 empresas el primer año, **posible crecimiento**» | 1.4, SP-03 | Escalabilidad | Implícito |
| 17 | «Equipo **pequeño** (2–4 desarrolladores), operable sin plataforma compleja» | RT-05 | Simplicidad / factibilidad (costo) | Explícito |
| 18 | «Ajustes frecuentes de reglas y validaciones del RNDC deben **llegar rápido a producción**» | MN-05 | Desplegabilidad | Implícito |

## 2.3 Priorización de mayor a menor importancia

Para ordenar usamos el criterio del **árbol de utilidad** (Bass, Clements & Kazman). Cada atributo se califica en dos ejes, Alto (A), Medio (M) o Bajo (B):

- **Importancia para el negocio:** qué tanto afecta el éxito si falla.
- **Impacto en la arquitectura:** qué tanto obliga a cambiar la estructura.

Los pares (A,A) van primero. Luego se aplica el consejo de clase: mantener la lista corta y no diseñar para todo (el anti-patrón del *Vasa*).

| Prioridad | Atributo | Negocio | Arquitectura | ¿Cumple a, b, c? | Justificación | Decisión |
|---|---|---|---|---|---|---|
| **1** | **Disponibilidad** | A | A | Sí | El riesgo principal es la caída de un tercero (RNDC) que VIVO no controla. Si la recepción depende de él, el servicio 24/7 no existe. | **Top 5** · EC-01 |
| **2** | **Seguridad** | A | A | Sí | Un acceso cruzado entre empresas expone datos personales y permite tramitar a nombre de otro. Es un riesgo legal (Ley 1581). | **Top 5** · EC-03 |
| **3** | **Desempeño** | A | A | Sí | Las ráfagas de la madrugada y la lentitud del RNDC obligan a separar la recepción del procesamiento. | **Top 5** · EC-02 |
| **4** | **Interoperabilidad** | A | M | Sí | Dos dependencias externas con contratos propios (RNDC y WhatsApp) que exigen adaptadores dedicados. | **Top 5** |
| **5** | **Modificabilidad** | M | A | Sí | Las reglas y servicios del RNDC cambian. Aislar la integración evita que el cambio se propague. | **Top 5** |
| 6 | Integridad / confiabilidad | A | A | Sí | No perder ni duplicar solicitudes ni reportar estados falsos. | **Transversal:** se exige como medida en EC-01 y en ADR-002 y ADR-005. |
| 7 | Recuperabilidad | M | M | Sí | Retomar pendientes tras una falla. | Cubierto por Disponibilidad (cola durable, reintento). |
| 8 | Auditabilidad / trazabilidad | A | B | Parcial | Historial de estados e intentos. | Cubierto por Seguridad (táctica *Auditoría*). |
| 9 | Observabilidad / soportabilidad | M | M | Sí | Ver circuito abierto, pendientes y conciliaciones. | Soporte de EC-01 (monitor de salud). |
| 10 | Simplicidad / factibilidad | M | M | Sí | Equipo pequeño. | Restricción que justifica monolito modular (ADR-001). |
| 11 | Usabilidad | A | B | No (b) | Flujo conversacional claro. | Se resuelve en el diseño de la conversación, no en la estructura. |
| 12 | Escalabilidad | M | B | No (c) | Unas 1.500 solicitudes al día es un volumen bajo. | Se revisa si el volumen crece. |
| 13 | Desplegabilidad | B | M | No (c) | Cambios del adaptador frecuentes pero acotados. | Pipeline CI/CD estándar. |

> **Trade-offs reconocidos («la arquitectura menos mala»):**
> - Más seguridad (autorización en cada operación, cifrado) añade latencia a la recepción, lo que tensiona el desempeño.
> - Más disponibilidad (cola, reintentos) añade complejidad y consistencia eventual, lo que tensiona la simplicidad.
> - Proteger la integridad (conciliar antes de reintentar) puede alargar el tiempo de emisión, lo que tensiona el desempeño percibido.

## 2.4 Los cinco atributos seleccionados

| # | Atributo | Pregunta que debe responder la arquitectura |
|---|---|---|
| 1 | Disponibilidad | ¿Sigue VIVO recibiendo y conservando solicitudes cuando el RNDC falla? |
| 2 | Seguridad | ¿Puede un usuario ver o tramitar algo de una empresa que no le corresponde? |
| 3 | Desempeño | ¿Se registra una solicitud en ≤ 3 s (p95) durante una ráfaga de 50 eventos? |
| 4 | Interoperabilidad | ¿Se intercambia información con RNDC y WhatsApp solo por contratos autorizados y aislados? |
| 5 | Modificabilidad | ¿Un cambio del RNDC se resuelve tocando un solo componente? |

Para el Punto 3 se escogen **Disponibilidad, Desempeño y Seguridad**: los tres con calificación (A,A) y con mayor efecto en la estructura.
