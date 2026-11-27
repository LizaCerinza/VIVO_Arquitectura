# 4. Tácticas y Patrones

Una **táctica** es una decisión de diseño que influye directamente en la respuesta del sistema ante un estímulo. Un **patrón** es una solución probada a un problema recurrente que suele agrupar varias tácticas (*Escenarios de Atributos de Calidad*, diapositivas de clase).

Para cada escenario del [Punto 3](../03_Escenarios_de_Atributos_de_Calidad/03_Escenarios_de_Atributos_de_Calidad.md) documentamos:

- Una breve descripción de la estrategia.
- Un diagrama que muestra **dónde** se aplica cada táctica (T) y patrón (P) en el flujo de VIVO.
- La justificación de cada táctica frente a la medida de respuesta.
- Los trade-offs.

| Escenario | Atributo | Fuente de las tácticas | Documento |
|---|---|---|---|
| EC-01 | Disponibilidad | Diapositivas de clase (Bass): detectar, recuperar, prevenir + Circuit Breaker y Redundant Spare | [Tacticas_Disponibilidad.md](Tacticas_Disponibilidad.md) |
| EC-02 | Integridad de los datos | Tácticas de Bass (transacciones, *sanity checking*, *timestamp*) + literatura: Hohpe & Woolf, Richardson, Microsoft | [Tacticas_Integridad_de_los_Datos.md](Tacticas_Integridad_de_los_Datos.md) |
| EC-03 | Seguridad | Diapositivas de clase (Bass): detectar, resistir, reaccionar, recuperar + Security Gateway e Intercepting Validator | [Tacticas_Seguridad.md](Tacticas_Seguridad.md) |

## Resumen de tácticas y patrones por escenario

| Escenario | Tácticas clave | Patrones |
|---|---|---|
| EC-01 Disponibilidad | Detección de excepciones, monitoreo, ping/eco, reintento, **degradación controlada**, manejo de excepciones, transacciones | **Circuit Breaker**, Cola de nivelación de carga, Repuesto redundante |
| EC-02 Integridad | **Llave de idempotencia**, transacciones, verificación de transiciones, marca de tiempo, **consultar antes de reintentar**, bitácora inmutable | Receptor idempotente, **Transactional Outbox**, Scheduler Agent Supervisor |
| EC-03 Seguridad | Integridad del mensaje, detectar intrusión, identificar/autenticar/**autorizar actores**, separar entidades, limitar exposición, validar entrada, cifrar, restringir inicio de sesión, informar, auditoría, no repudio | **Security Gateway**, Intercepting Validator |

## Cómo se refuerzan entre sí

- Los **reintentos** de EC-01 solo son seguros gracias a la **idempotencia** de EC-02.
- La **bitácora inmutable** de EC-02 y la **auditoría** de EC-03 cubren juntas el driver de **Trazabilidad**.
- El **adaptador** donde viven el Circuit Breaker (EC-01) y la llave de idempotencia (EC-02) aísla al RNDC, que es lo que pide el driver de **Interoperabilidad**.

## Referencias

- Bass, L., Clements, P., Kazman, R. *Software Architecture in Practice*, 4.ª ed., 2022. Diapositivas de clase: *QA-Scenarios*, *QA-Availability*, *QA-Security*.
- Nygard, M. *Release It!*, 2.ª ed., 2018 (*Circuit Breaker*, *Timeouts*).
- Hohpe, G., Woolf, B. *Enterprise Integration Patterns*, 2003 (*Idempotent Receiver*).
- Richardson, C. *Microservices Patterns*, 2018 (*Transactional Outbox*).
- Microsoft. *Cloud Design Patterns* (*Circuit Breaker*, *Retry*, *Queue-Based Load Leveling*, *Scheduler Agent Supervisor*).
- OWASP. *API Security Top 10*, 2023 (*API1: Broken Object Level Authorization*).
