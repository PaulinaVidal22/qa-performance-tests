import { Trend, Rate, Counter } from 'k6/metrics';

export const validRequestDuration = new Trend('valid_request_duration');
export const validRequestSuccess = new Rate('valid_request_success');
export const invalidRequestCount = new Counter('invalid_request_count');

// Cuenta cuántas veces la API devuelve HTTP 429 (rate limiting).
// Permite diferenciar errores reales del sistema de políticas externas de protección.
export const rateLimitHits = new Counter('rate_limit_hits');

