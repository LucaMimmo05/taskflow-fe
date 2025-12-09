const fs = require('fs');
const path = require('path');

// Legge la variabile d'ambiente API_URL da Vercel (o usa il default per lo sviluppo locale)
const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const environmentFileContent = `export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}'
};
`;

// Determina quale file environment scrivere
const targetPath = isProduction
  ? path.join(__dirname, '../src/environments/environment.prod.ts')
  : path.join(__dirname, '../src/environments/environment.ts');

// Scrivi il file
fs.writeFileSync(targetPath, environmentFileContent);

console.log(`Environment file generated at ${targetPath}`);
console.log(`API URL: ${apiUrl}`);
console.log(`Production: ${isProduction}`);
