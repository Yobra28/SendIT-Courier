// export const environment = {
//   production: false,
//   apiUrl: 'http://localhost:3000/api'
// }; 

export const environment = {
  production: false,
  apiUrl: process.env['NG_ENV_API_URL'] || 'http://localhost:3000/api'
};

console.log('🔍 Environment loaded:', environment); 