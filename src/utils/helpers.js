import http from 'k6/http';

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export function buildValidUrl(city) {
  return `${BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
}


export function makeRequest(url) {
  return http.get(url);
}

export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
