export const validCities = [
  { name: 'Montevideo', lat: -34.9011, lon: -56.1645 },
  { name: 'Salto', lat: -31.3833, lon: -57.9667 },
  { name: 'Paysandu', lat: -32.3171, lon: -58.0807 },
  { name: 'Las Piedras', lat: -34.7302, lon: -56.2192 },
  { name: 'Rivera', lat: -30.9053, lon: -55.5508 },
  { name: 'Maldonado', lat: -34.9000, lon: -54.9500 },
  { name: 'Tacuarembo', lat: -31.7169, lon: -55.9811 }
];

// Open-Meteo trabaja con latitud y longitud, por eso se usan coordenadas reales

export const invalidCities = [
  { name: 'Montefideo', lat: 999, lon: 999 },
  { name: 'Paysandoom', lat: -999, lon: -999 },
  { name: 'VillaFresquita', lat: 200, lon: 200 }
];
