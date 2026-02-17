# QA Performance Testing – Open-Meteo API

Este proyecto consiste en la implementación de pruebas de performance utilizando k6 sobre la API pública de Open-Meteo.

El objetivo es ejecutar distintos escenarios de carga y analizar el comportamiento del sistema bajo diferentes niveles de demanda.

---

## Stack tecnológico

- k6
    Herramienta de testing de performance orientada a desarrolladores. Permite definir pruebas en JavaScript y medir métricas de carga, estrés y picos de tráfico.

- JavaScript (ES6 modules)
    Lenguaje utilizado para definir los escenarios, helpers, métricas y configuración de las pruebas.

- Open-Meteo API
    API pública utilizada como sistema bajo prueba. Provee información climática en base a latitud y longitud.

---

## Estructura del proyecto

src/
├── config/
│ └── options.js
├── data/
│ └── cities.js
├── metrics/
│ └── custom-metrics.js
├── scenarios/
│ ├── weather-load.js
│ ├── weather-spike.js
│ └── weather-stress.js
└── utils/
└── helpers.js


### config/
Contiene la configuración de los escenarios (load, spike y stress), incluyendo VUs, duración y thresholds.

### data/
Define las ciudades utilizadas en las pruebas. Incluye ciudades válidas (con coordenadas reales) y ciudades inválidas para simular requests incorrectas.

### metrics/
Contiene las métricas personalizadas creadas para medir comportamiento específico de las requests válidas, inválidas y eventos de rate limiting.

### scenarios/
Contiene los archivos principales de ejecución de pruebas:
- `weather-load.js`
- `weather-spike.js`
- `weather-stress.js`
- `weather-error-handling-load.js`

Cada uno representa un tipo diferente de prueba de performance.

### utils/
Funciones auxiliares para:
- Construcción de URLs
- Requests HTTP
- Selección aleatoria de datos

---

## Métricas utilizadas

### Métricas estándar de k6

- `http_req_duration` → Tiempo de respuesta de las requests.
- `http_req_failed` → Porcentaje de requests fallidas.
- `checks` → Validaciones funcionales realizadas sobre las respuestas.

### Métricas personalizadas

- `valid_request_duration` → Latencia solo de requests válidas.
- `valid_request_success` → Tasa de éxito de requests válidas.
- `invalid_request_count` → Conteo de consultas inválidas.
- `rate_limit_hits` → Conteo de respuestas HTTP 429 (rate limiting).

Estas métricas permiten separar latencia real de errores provocados por sobrecarga o limitación del servicio.

---

## Ejecución de pruebas

Desde la raíz del proyecto:

### Prueba de Carga
```bash
k6 run src/scenarios/weather-load.js
```

### Prueba de Estrés
```bash
k6 run src/scenarios/weather-stress.js
```

### Prueba de Spike
```bash
k6 run src/scenarios/weather-spike.js
```

### Prueba de Manejo de Errores
```bash
k6 run src/scenarios/weather-error-handling-load.js
```

## Exportar Resultados a JSON

Para guardar resultados en un archivo JSON:
```bash
k6 run src/scenarios/weather-load.js --out json=results/load-output.json
```
Ejemplo para spike:
```bash
k6 run src/scenarios/weather-spike.js --out json=results/spike-output.json
```
Ejemplo para stress:
```bash
k6 run src/scenarios/weather-stress.js --out json=results/stress-output.json
```
Ejemplo para error handling:
```bash
k6 run src/scenarios/weather-error-handling-load.js --out json=results/error-load-output.json
```
