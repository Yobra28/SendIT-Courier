// export const environment = {
//   production: false,
//   apiUrl: 'http://localhost:3000/api'
// }; 

export const environment = {
  production: false,
  apiUrl: 'https://sendit-courier-7847.onrender.com/api'
};

console.log('🔍 DEVELOPMENT Environment loaded:', environment);
console.log('🔍 API URL:', environment.apiUrl);
console.log('🔍 Production flag:', environment.production);
console.log('🔍 Environment file loaded at:', new Date().toISOString()); 