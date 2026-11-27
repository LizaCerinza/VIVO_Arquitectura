workspace "VIVO" "Gestión de solicitudes de manifiestos electrónicos de carga mediante WhatsApp. Modelo C4: contexto y contenedores." {

    !identifiers hierarchical

    model {
        # ---------------- Personas ----------------
        operador = person "Operador autorizado" "Empleado de una empresa de transporte. Solicita y consulta manifiestos de carga por WhatsApp."
        admin = person "Administrador VIVO" "Atiende incidencias, conciliaciones y casos de revisión manual."

        # ---------------- Sistemas externos ----------------
        whatsapp = softwareSystem "WhatsApp Business Platform" "Canal de mensajería. Entrega los mensajes entrantes por webhook y envía las respuestas y notificaciones." "Sistema externo"
        rndc = softwareSystem "RNDC" "Registro Nacional de Despachos de Carga (Ministerio de Transporte). Expide, valida y registra el manifiesto oficial." "Sistema externo"

        # ---------------- Sistema en alcance ----------------
        vivo = softwareSystem "VIVO" "Recibe, valida y registra solicitudes de manifiestos, las tramita ante el RNDC y notifica el estado real." {

            gateway = container "API Gateway" "Único punto de entrada. Valida la firma del webhook y la entrada, aplica TLS y limita el tráfico (Security Gateway + Intercepting Validator)." "Gateway de API gestionado o proxy inverso" "Gateway"

            api = container "API de Recepción y Gestión" "Monolito modular. Identifica y autoriza al operador, guía la captura de datos, asigna el id interno, aplica la máquina de estados y guarda la solicitud con su tarea (outbox). Descarta mensajes repetidos. Desplegada en 2 instancias." "Aplicación web · monolito modular" "Aplicación"

            consola = container "Consola de Administración" "Seguimiento de solicitudes, casos de revisión manual, conciliaciones y auditoría." "Aplicación web (SPA)" "Navegador"

            procesador = container "Procesador RNDC" "Proceso de fondo. Consume tareas, tramita ante el RNDC mediante su adaptador (timeout, Circuit Breaker, reintentos, throttling), concilia resultados inciertos y notifica por WhatsApp." "Proceso de fondo (worker)" "Aplicación"

            bd = container "Base de Datos Transaccional" "Empresas, usuarios y permisos, solicitudes y estados, bitácora inmutable de estados e intentos, outbox y auditoría. Filtro obligatorio por empresa." "Base de datos relacional (ACID)" "Base de datos"

            cola = container "Cola Durable" "Tareas de trámite y notificación pendientes. Entrega al menos una vez y cola de mensajes fallidos (DLQ)." "Broker de mensajes con persistencia" "Cola"

            monitor = container "Monitor y Alertas" "Métricas, logs, estado del circuito, edad de pendientes y sonda de salud del RNDC. Alerta al administrador." "Plataforma de observabilidad" "Observabilidad"
        }

        # ---------------- Relaciones ----------------
        operador -> whatsapp "Envía solicitudes y consulta el estado por" "Chat WhatsApp"
        admin -> vivo.consola "Revisa casos, conciliaciones y auditoría con" "HTTPS"

        whatsapp -> vivo.gateway "Entrega mensajes entrantes (webhook firmado) a" "HTTPS"
        vivo.consola -> vivo.gateway "Envía peticiones de administración a" "JSON/HTTPS"
        vivo.gateway -> vivo.api "Enruta las peticiones validadas a" "JSON/HTTPS"

        vivo.api -> vivo.bd "Guarda solicitud, estado, outbox y auditoría en una transacción en" "SQL"
        vivo.api -> vivo.cola "Publica tareas de trámite (relay del outbox) en" "AMQP"
        vivo.api -> whatsapp "Responde los mensajes de la conversación con" "API HTTPS"

        vivo.procesador -> vivo.cola "Consume tareas de" "AMQP"
        vivo.procesador -> vivo.bd "Actualiza estados, intentos y bitácora en" "SQL"
        vivo.procesador -> rndc "Solicita la expedición y consulta el estado en" "Servicio web autorizado · HTTPS"
        vivo.procesador -> whatsapp "Envía notificaciones de estado con" "API HTTPS"

        vivo.api -> vivo.monitor "Envía métricas y logs a"
        vivo.procesador -> vivo.monitor "Envía métricas (circuito, pendientes) y logs a"
        vivo.monitor -> rndc "Sondea la salud de" "HTTPS"
        vivo.monitor -> admin "Envía alertas a" "Correo / mensajería"
    }

    views {
        systemContext vivo "C1_Contexto" "C4 · Nivel 1 · Contexto del sistema VIVO" {
            # El operador se conecta a VIVO a través de WhatsApp: se incluye explícitamente
            include * operador
            autoLayout lr 300 200
        }

        container vivo "C2_Contenedores" "C4 · Nivel 2 · Contenedores de VIVO" {
            include * operador
            autoLayout lr 250 150
        }

        styles {
            element "Element" {
                color #ffffff
                stroke #0b4884
                fontSize 22
            }
            element "Person" {
                background #08427b
                shape Person
            }
            element "Software System" {
                background #1168bd
            }
            element "Sistema externo" {
                background #8c8c8c
                stroke #6b6b6b
            }
            element "Container" {
                background #438dd5
            }
            element "Gateway" {
                shape Hexagon
            }
            element "Navegador" {
                shape WebBrowser
            }
            element "Base de datos" {
                shape Cylinder
            }
            element "Cola" {
                shape Pipe
            }
            element "Observabilidad" {
                background #5b8cc0
                shape RoundedBox
            }
            relationship "Relationship" {
                color #5a6b7d
                thickness 2
                fontSize 20
            }
        }
    }
}
