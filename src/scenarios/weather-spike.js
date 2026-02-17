import { sleep, check } from 'k6';
import { spikeOptions } from '../config/options.js';
import { validCities } from '../data/cities.js';
import { buildValidUrl, makeRequest, getRandomItem } from '../utils/helpers.js';
import {
  validRequestDuration,
  validRequestSuccess,
  rateLimitHits
} from '../metrics/custom-metrics.js';

export const options = spikeOptions;

export default function () {

  const city = getRandomItem(validCities);
  const url = buildValidUrl(city);
  const response = makeRequest(url);

  // Registramos rate limiting
  if (response.status === 429) {
    rateLimitHits.add(1);
  }

  // Medimos latencia solo en requests procesadas
  validRequestDuration.add(response.timings.duration);

  const success = check(response, {
    'valid status 200': (r) => r.status === 200,
  });

  validRequestSuccess.add(success);

  sleep(1);
}

