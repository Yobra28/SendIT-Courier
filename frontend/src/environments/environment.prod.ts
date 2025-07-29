export const environment = {
  production: true,
  apiUrl: 'https://sendit-courier-7847.onrender.com/api'
};

console.log('🚀 PRODUCTION Environment loaded:', environment);
console.log('🚀 API URL:', environment.apiUrl);
console.log('🚀 Production flag:', environment.production);
console.log('🚀 Environment file loaded at:', new Date().toISOString());
console.log('🚀 FORCED PRODUCTION URL - NO LOCALHOST'); 