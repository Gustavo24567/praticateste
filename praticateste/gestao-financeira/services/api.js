import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// use o IP do seu computador (ex: 192.168.0.105)
const BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@Money:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export const register = (name, email, password) => 
  api.post('/register', { name, email, password });

export const login = (email, password) => 
  api.post('/login', { email, password });

export default api;