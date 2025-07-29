export const environment = {
  production: true,
  apiUrl: process.env['NG_ENV_API_URL'] || 'https://sendit-courier-7847.onrender.com/api'
};

console.log('🚀 PRODUCTION Environment loaded:', environment); 