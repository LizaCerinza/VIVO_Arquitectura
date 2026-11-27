# VIVO — Arquitectura de Software

**Diseño de una arquitectura resiliente para la gestión de solicitudes de manifiestos electrónicos de carga mediante WhatsApp**

Pontificia Universidad Javeriana Cali · Maestría en Ingeniería de Software · Arquitectura de Software · 2026-2

**Integrantes:** Liza Cerinza · Valentina Luna  
**Docente:** Eduard Correa

---

## Cómo leer este proyecto

Cada punto está en su propia carpeta numerada. El documento principal de cada punto lleva el mismo nombre de su carpeta (por ejemplo, `01_Contexto_del_Problema/01_Contexto_del_Problema.md`). Los enlaces de la tabla abren ese documento.

| Punto | Sección de la tarea | Carpeta | Estado |
|---|---|---|---|
| 1 | Contexto del Problema | [01_Contexto_del_Problema](01_Contexto_del_Problema/01_Contexto_del_Problema.md) | Listo |
| 2 | Identificación de Atributos de Calidad | [02_Atributos_de_Calidad](02_Atributos_de_Calidad/02_Atributos_de_Calidad.md) | En revisión |
| 3 | Escenarios de Atributos de Calidad | [03_Escenarios_de_Atributos_de_Calidad](03_Escenarios_de_Atributos_de_Calidad/03_Escenarios_de_Atributos_de_Calidad.md) | Pendiente |
| 4 | Tácticas y Patrones | [04_Tacticas_y_Patrones](04_Tacticas_y_Patrones/04_Tacticas_y_Patrones.md) | Pendiente |
| 5 | Diseño de Arquitectura (ADD + C4) | [05_Diseno_de_Arquitectura_ADD](05_Diseno_de_Arquitectura_ADD/05_Diseno_de_Arquitectura_ADD.md) | Pendiente |
| 6 | Decisiones de Arquitectura (ADR) | [06_Decisiones_de_Arquitectura_ADR](06_Decisiones_de_Arquitectura_ADR/06_Decisiones_de_Arquitectura_ADR.md) | Pendiente |
| 7 | Análisis de Riesgos | [07_Analisis_de_Riesgos](07_Analisis_de_Riesgos/07_Analisis_de_Riesgos.md) | Pendiente |
| 8 | Evaluación de Arquitectura (presentación) | [08_Evaluacion_de_Arquitectura](08_Evaluacion_de_Arquitectura/08_Evaluacion_de_Arquitectura.md) | Pendiente |

## Trazabilidad

Los identificadores son estables en todo el repositorio, para seguir cada decisión desde el problema hasta el código:

`MN` meta del negocio → `RF` / `RT` requisito o restricción → atributo de calidad → `EC` escenario → táctica → `D` driver → `ADR` decisión → `R` riesgo → `specs/` implementación

## Desarrollo futuro (SDD)

La carpeta [specs/](specs/specs.md) prepara la implementación con *Spec-Driven Development*, usando los puntos 1 a 7 como contexto.
