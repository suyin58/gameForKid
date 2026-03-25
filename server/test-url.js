const API_BASE = 'http://localhost:3001/api/v1';
const path = '/game';
const cleanPath = path.startsWith('/') ? path.slice(1) : path;
const fullUrl = `${API_BASE}/${cleanPath}`;
console.log('Full URL:', fullUrl);
