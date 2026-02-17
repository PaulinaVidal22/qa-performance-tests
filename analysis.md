# Análisis de Resultados – Pruebas de Performance

En este documento presento el análisis técnico de los resultados obtenidos durante las pruebas de carga realizadas sobre la API de Open-Meteo.

El objetivo no fue únicamente ejecutar los escenarios, sino interpretar el comportamiento del sistema ante diferentes niveles de demanda.

---

## ⚠️ Consideraciones importantes

Open-Meteo es una API pública y gratuita.

Durante las pruebas de spike y stress se observaron:

- Respuestas HTTP 429 (Too Many Requests)
- Errores de tipo EOF
- Incremento significativo en `http_req_failed`

Esto indica la existencia de mecanismos de protección como rate limiting o throttling.

---

# Load Test

## Configuración

- 100 VUs constantes
- Duración: 2 minutos
- Sleep de 5 segundos entre iteraciones

Se simula una carga sostenida bajo un escenario de alta demanda (por ejemplo, múltiples usuarios consultando el clima durante una ola de calor).

## Criterios de calidad definidos

Para esta prueba se establecieron los siguientes thresholds:

- avg < 1200ms
- p(95) < 2000ms
- valid_request_success > 0.98
- checks > 0.98

Estos criterios buscan asegurar:

- Buena experiencia de usuario (tiempos de respuesta bajos).
- Estabilidad bajo carga sostenida.
- Alta confiabilidad en respuestas válidas.
- Correcta validación funcional de las respuestas.

## Resultados observados

- Latencia promedio estable (~170–200 ms).
- Percentil 95 muy por debajo del umbral definido.
- Aparición de respuestas HTTP 429 (Too Many Requests).
- Caída significativa del `valid_request_success`.
- Incremento del `http_req_failed`.

## Análisis

Desde el punto de vista de rendimiento, el servicio mantiene tiempos de respuesta muy bajos incluso bajo carga sostenida. No se observa degradación progresiva de latencia ni comportamiento errático en los tiempos de respuesta.

Sin embargo, bajo 100 VUs constantes comienza a activarse el mecanismo de rate limiting del proveedor, generando respuestas HTTP 429. Esto impacta directamente en las métricas:

- `http_req_failed`
- `valid_request_success`
- `checks`

Es importante destacar que la falla no se debe a lentitud ni saturación visible del servicio, sino a una política activa de limitación de consumo. Esto es coherente tratándose de una API pública gratuita.

En conclusión, el sistema mantiene buena performance en términos de latencia, pero presenta restricciones operativas bajo carga sostenida debido a límites impuestos por el proveedor externo.

---
## Load Test con manejo de errores

### Configuración

- 20 VUs constantes
- 1 minuto de duración
- Requests con coordenadas inválidas
- Sleep reducido para simular consultas frecuentes erróneas

### Objetivo

Evaluar el comportamiento del sistema ante entradas incorrectas de forma sostenida, validando:

- Manejo adecuado de errores
- Ausencia de colapsos
- Consistencia en las respuestas
- Estabilidad de latencia

### Resultados observados

- 100% de `http_req_failed`
- 100% de checks exitosos
- Latencia estable (~170–200 ms)
- Sin aparición de errores EOF ni timeouts
- Todas las requests inválidas fueron correctamente manejadas

### Análisis

El 100% de fallos HTTP es el comportamiento esperado en este escenario, dado que todas las solicitudes contienen coordenadas inválidas.

Lo relevante no es la tasa de éxito HTTP, sino la correcta gestión del error.

El sistema responde de forma consistente, sin degradación de latencia ni comportamientos inesperados. No se observan cierres abruptos de conexión ni inestabilidad bajo carga de entradas incorrectas.

Esto indica que:

- El sistema valida correctamente los parámetros de entrada.
- No intenta procesar datos inválidos de forma costosa.
- Mantiene estabilidad operativa ante uso indebido o consultas mal formadas.

Desde una perspectiva arquitectónica, el servicio demuestra robustez en la capa de validación y manejo de errores.

---

# Spike Test

## Configuración

- Escalamiento rápido hasta 1000 VUs
- Incremento abrupto en etapas
- Duración corta con pico pronunciado
- Alta presión concurrente

Esta prueba evalúa el comportamiento del sistema ante un aumento repentino y masivo de tráfico.

## Resultados observados

- `valid_request_success` ≈ 5%
- Más del 90% de las requests fueron rechazadas
- Gran cantidad de `rate_limit_hits`
- Latencia promedio estable (~170–180 ms)
- Percentil 95 muy por debajo del threshold definido
- El sistema no presenta aumento progresivo de latencia

## Análisis

Durante el spike, el sistema no muestra degradación en tiempos de respuesta. Las requests que logran ser procesadas mantienen latencias bajas y estables.

Sin embargo, ante el incremento abrupto hasta 1000 VUs, el proveedor activa de forma masiva el mecanismo de rate limiting, rechazando la mayoría de las solicitudes con HTTP 429.

Es importante distinguir dos aspectos:

- **Performance:** se mantiene estable en las requests aceptadas.
- **Disponibilidad bajo pico extremo:** cae drásticamente debido a restricciones activas.

El alto porcentaje de fallos no indica colapso técnico del backend, sino aplicación deliberada de mecanismos de protección.

Este comportamiento es consistente con arquitecturas que incorporan:

- API Gateway
- Rate limiting
- Protección contra abuso o consumo excesivo

Desde una perspectiva arquitectónica, el sistema demuestra estabilidad en tiempos de respuesta, pero es altamente restrictivo frente a picos extremos de concurrencia, lo cual es esperable en una API pública gratuita.

---

# Stress Test

## Configuración

- Escalamiento progresivo hasta 500 VUs
- 6 minutos de ejecución continua
- Carga sostenida en niveles elevados

El objetivo es determinar el comportamiento del sistema bajo sobrecarga prolongada y observar el punto de quiebre.

## Resultados observados

- `http_req_failed` ≈ 97%
- Aparición masiva de errores `EOF`
- Cierre forzado de conexiones por el host remoto
- Latencia promedio estable (~180–190 ms)
- Percentil 95 dentro de límites aceptables
- Picos máximos aislados (hasta varios segundos)

## Análisis

En este escenario se observa un nivel de rechazo aún más severo que en el spike test.

Mientras que en el spike predominaban respuestas HTTP 429 (rate limiting explícito), en el stress test aparecen errores `EOF`, lo que indica cierre abrupto de conexiones TCP por parte del servidor o infraestructura intermedia.

Esto sugiere que el sistema alcanza un nivel de protección o saturación más profundo, posiblemente a nivel de:

- Balanceador de carga
- Firewall o protección anti-abuso
- Límite de conexiones simultáneas
- Infraestructura de red

Es importante destacar que la latencia de las requests que logran completarse no se degrada progresivamente. El sistema no se vuelve lento: simplemente deja de aceptar conexiones.

Desde el punto de vista arquitectónico, esto indica que el servicio prioriza estabilidad interna mediante mecanismos agresivos de protección, evitando colapso por sobreconsumo.

No se observa caída total del servicio, sino una política de rechazo masivo bajo presión sostenida.

---

# Observaciones Técnicas Relevantes

- La latencia se mantiene estable en requests exitosas.
- El principal mecanismo de degradación es el rechazo activo.
- No se observan respuestas 5xx significativas.
- La infraestructura parece priorizar protección sobre disponibilidad bajo sobrecarga.

---

#  Reflexión Final

Desde el punto de vista de ingeniería:

El comportamiento observado es coherente con una API pública diseñada para uso moderado y no para pruebas intensivas de carga.

Las pruebas permitieron identificar claramente:

- Límite operativo bajo carga constante
- Reacción ante picos extremos
- Mecanismo de protección ante abuso
- Patrón de degradación bajo estrés

Más que buscar que "no falle", el objetivo fue entender **cómo y por qué falla**, lo cual es fundamental en pruebas de performance.

---

# Conclusión General

Las pruebas realizadas permiten concluir que:

- El sistema es rápido bajo condiciones normales.
- Posee mecanismos efectivos de rate limiting.
- No escala linealmente ante cargas masivas.
- Prioriza estabilidad del backend mediante rechazo temprano.

Este análisis demuestra la importancia de no evaluar únicamente latencia, sino también comportamiento arquitectónico ante distintos patrones de carga.
