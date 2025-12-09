const fs = require('fs');
const path = require('path');

// Legge la variabile d'ambiente API_URL da Vercel (per produzione)
// Per sviluppo usa sempre localhost
const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const devApiUrl = 'http://localhost:8080/api';
const prodApiUrl = process.env.API_URL || 'http://localhost:8080/api'; // Fallback a localhost se non configurato

const devEnvironmentContent = `export const environment = {
  production: false,
  apiUrl: '${devApiUrl}'
};
`;

const prodEnvironmentContent = `export const environment = {
  production: true,
  apiUrl: '${prodApiUrl}'
};
`;

// Scrivi i file environment
const devPath = path.join(__dirname, '../src/environments/environment.ts');
const prodPath = path.join(__dirname, '../src/environments/environment.prod.ts');

fs.writeFileSync(devPath, devEnvironmentContent);
fs.writeFileSync(prodPath, prodEnvironmentContent);

console.log(`Environment files generated`);
console.log(`Development: ${devPath}`);
console.log(`  API URL: ${devApiUrl}`);
console.log(`Production: ${prodPath}`);
console.log(`  API URL: ${prodApiUrl}`);
