// configuración del escenario solicitado en la cosigna (es una prueba de carga).

export const loadOptions = {
  vus: 100,
  duration: '2m',
  // 100 VUs constantes durante 2 minutos.
  // Simula carga sostenida en contexto de alta demanda por ola de calor.
  thresholds: {
    http_req_duration: [
      'avg<1200',
      'p(95)<2000'
    ],

    http_req_failed: ['rate<0.02'],

    valid_request_success: ['rate>0.98'],

    checks: ['rate>0.98'],

    rate_limit_hits: []
  },
};

export const stressOptions = {
  stages: [ // se escala progresivamente 
    { duration: '1m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: { 
    // En stress test no se evalúa disponibilidad como criterio de aprobación.
    // Se observa comportamiento bajo sobrecarga prolongada.
    http_req_duration: ['p(95)<3000'],
    // http_req_failed: ['rate<0.1'],
  },
};

export const spikeOptions = {
  stages: [ // la carga salta abruptamente
    { duration: '30s', target: 100 },
    { duration: '10s', target: 1000 }, 
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: { // criterios muy permisivos dado que es un spike real el sistema puede degradarse temporalmente
    
    // Medimos degradación real de latencia bajo pico abrupto
    http_req_duration: [
      'avg<2500',
      'p(95)<4000'
    ],

    rate_limit_hits: []
  },
};
