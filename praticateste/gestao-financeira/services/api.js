import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Use o IP do seu computador no lugar de "192.168.X.X" (teste no navegador do celular)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.22.39:3000";

let _authtoken = null;

export function setAuthToken(token) {
  _authtoken = token;
  if (token) {
    AsyncStorage.setItem('@Money:token', token);
  }
} 

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

// Funções de autenticação
export const register = (name, email, password) => 
  api.post('/register', { name, email, password });
export const login = (email, password) => 
  api.post('/login', { email, password });

export default api;