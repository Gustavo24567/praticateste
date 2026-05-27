import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import  api  from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/').then(res => console.log('API OK:', res.data)).catch(err => console.log('API error:', err.message));
    const loadStorage = async () => {
      const token = await AsyncStorage.getItem("@Money:token");
      const userData = await AsyncStorage.getItem("@Money:user");
      if (token && userData) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };
    loadStorage();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    await AsyncStorage.setItem("@Money:token", data.token);
    await AsyncStorage.setItem("@Money:user", JSON.stringify(data.user));
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["@Money:token", "@Money:user"]);
    delete api.defaults.headers.Authorization;
    setUser(null);
  };

  const register = async (name, email, password) => {
  try {
    const response = await api.post("/register", { name, email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem("@Money:token", token);
    await AsyncStorage.setItem("@Money:user", JSON.stringify(user));
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Falha no cadastro");
  }
};

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}> 
      {children}
    </AuthContext.Provider>
  );
}