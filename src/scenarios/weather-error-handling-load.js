import { sleep, check } from 'k6';
import { invalidCities } from '../data/cities.js';
import { buildValidUrl, makeRequest, getRandomItem } from '../utils/helpers.js';
import { invalidRequestCount } from '../metrics/custom-metrics.js';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    checks: ['rate>0.95'],
  },
};

export default function () {

  const city = getRandomItem(invalidCities);

  const url = buildValidUrl(city);

  const response = makeRequest(url);

  invalidRequestCount.add(1);

  check(response, {
    'invalid request handled correctly': (r) => {
      // Puede devolver 400 o 200 sin current_weather
      if (r.status !== 200) return true;

      try {
        const body = JSON.parse(r.body);
        return body.current_weather === undefined;
      } catch {
        return true;
      }
    },
  });

  sleep(3);
}
