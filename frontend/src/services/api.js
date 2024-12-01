const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-domain.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
}); 