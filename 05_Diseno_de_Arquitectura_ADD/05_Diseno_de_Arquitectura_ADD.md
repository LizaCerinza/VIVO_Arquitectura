# 5. Diseño de Arquitectura (ADD)

Diseñamos la arquitectura de VIVO con **ADD 3.0** (*Attribute-Driven Design*): un método iterativo en el que cada iteración toma unos drivers, elige conceptos de diseño (estilos, patrones y tácticas) y refina parte del sistema.

| Sección | Contenido | Documento |
|---|---|---|
| 5.1 | **Drivers de arquitectura** (5) y entradas de ADD: propósito, funcionalidad primaria, restricciones y preocupaciones | [5.1_Drivers_de_Arquitectura.md](5.1_Drivers_de_Arquitectura.md) |
| 5.2 | **Iteraciones ADD**: 5 iteraciones con objetivo, drivers, conceptos, elementos y análisis | [5.2_Iteraciones_ADD.md](5.2_Iteraciones_ADD.md) |
| 5.3 | **Conceptos de diseño**: estilo elegido y alternativas, patrones, tácticas y familias de tecnología | [5.3_Conceptos_de_Diseno.md](5.3_Conceptos_de_Diseno.md) |
| 5.4 | **Arquitectura refinada (C4)** en Structurizr DSL: contexto y contenedores | [5.4_Arquitectura_Refinada_C4](5.4_Arquitectura_Refinada_C4/5.4_Arquitectura_Refinada_C4.md) |

## Resumen del diseño

| | |
|---|---|
| **Drivers** | D-01 Disponibilidad · D-02 Integridad de los datos · D-03 Seguridad · D-04 Interoperabilidad · D-05 Trazabilidad |
| **Estilo** | Monolito modular + proceso de fondo + cola durable |
| **Contenedores** | API Gateway, API de Recepción y Gestión, Procesador RNDC, Consola de Administración, Base de Datos Transaccional, Cola Durable, Monitor y Alertas |
| **Idea central** | Recibir y registrar nunca depende del RNDC. El trámite ocurre en segundo plano, aislado detrás de un adaptador, con idempotencia y conciliación. Cada operación se autoriza por empresa y queda auditada. |
