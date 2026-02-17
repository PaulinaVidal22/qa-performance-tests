import { sleep, check } from 'k6';
import { loadOptions } from '../config/options.js';
import { validCities } from '../data/cities.js';
import { buildValidUrl, makeRequest, getRandomItem } from '../utils/helpers.js';
import {
  validRequestDuration,
  validRequestSuccess,
  rateLimitHits
} from '../metrics/custom-metrics.js';

export const options = loadOptions;

export default function () {

  // Simulación realista: 100% consultas válidas
  const city = getRandomItem(validCities);

  const url = buildValidUrl(city);

  const response = makeRequest(url);

  // Control de rate limiting (HTTP 429).
// Se introduce para detectar si la API pública comienza a limitar requests
// bajo carga sostenida. Esto no corrige el error, pero permite identificar
// si la degradación observada es causada por throttling externo
// y no por un problema en nuestro script o en la lógica de validación.
if (response.status === 429) {
  rateLimitHits.add(1);;
}

  // Registramos latencia de negocio
  validRequestDuration.add(response.timings.duration);

  const success = check(response, {
    'valid status 200': (r) => r.status === 200,
    'contains current_weather': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.current_weather !== undefined;
      } catch {
        return false;
      }
    },
  });

  validRequestSuccess.add(success);

  // Cada usuario consulta cada 5 segundos
  sleep(5);
}
