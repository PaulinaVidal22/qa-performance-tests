import http from 'k6/http';
import { sleep } from 'k6';
import { stressOptions } from '../config/options.js';
import { validCities } from '../data/cities.js';
import { buildValidUrl, getRandomItem } from '../utils/helpers.js';

export const options = stressOptions;

export default function () {
  const city = getRandomItem(validCities);
  const url = buildValidUrl(city);

  http.get(url);

  sleep(1);
}
