# 3. Escenarios de Atributos de Calidad

Especificamos escenarios para los **tres primeros drivers** del Punto 2: Disponibilidad, Integridad de los datos y Seguridad. Son los de mayor riesgo y mayor impacto en la estructura.

Cada escenario tiene las seis partes vistas en clase:

| Parte | Qué responde |
|---|---|
| **Fuente del estímulo** | ¿Quién o qué lo genera? |
| **Estímulo** | ¿Qué evento llega al sistema? |
| **Artefacto** | ¿Qué parte del sistema lo recibe? |
| **Ambiente** | ¿En qué condiciones está el sistema? |
| **Respuesta** | ¿Qué hace el sistema? |
| **Medida de la respuesta** | ¿Cómo comprobamos que lo logró? |

Las medidas son criterios de aceptación propuestos para pruebas controladas. Se ajustarán con datos reales del negocio.

## Resumen

| ID | Atributo | Fuente | Estímulo | Respuesta esperada | Medida clave |
|---|---|---|---|---|---|
| [EC-01](EC-01_Disponibilidad.md) | Disponibilidad | RNDC | Deja de responder 30 min en hora pico | Seguir recibiendo, dejar pendiente y reanudar solo | 0 solicitudes perdidas; recepción ≤ 3 s (p95) |
| [EC-02](EC-02_Integridad_de_los_Datos.md) | Integridad de los datos | RNDC / red | Respuesta perdida tras enviar una expedición | Conciliar antes de reintentar | 0 duplicados; 0 «Emitida» sin número oficial |
| [EC-03](EC-03_Seguridad.md) | Seguridad | Operador de la empresa A | Intenta acceder a una solicitud de la empresa B | Bloquear sin revelar datos y auditar | 100 % bloqueados y registrados |

Los otros dos drivers, **Interoperabilidad** y **Trazabilidad**, también aparecen en las respuestas de estos escenarios: la conexión aislada con el RNDC en EC-01 y EC-02, y el registro de intentos y la auditoría en EC-02 y EC-03.
