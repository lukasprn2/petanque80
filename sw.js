self.addEventListener('install', (event) => {
  console.log('SW installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activé');
});
