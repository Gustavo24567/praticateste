// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { register as registerApi, login as loginApi } from "../services/api";
import { router } from "expo-router";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const token = await AsyncStorage.getItem("@Money:token");
        const userData = await AsyncStorage.getItem("@Money:user");
        if (token && userData) {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log("Erro ao carregar storage", error);
      } finally {
        setLoading(false);
      }
    };
    loadStorage();
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await registerApi(name, email, password);
      const { token, user: userData } = response.data;
      await AsyncStorage.setItem("@Money:token", token);
      await AsyncStorage.setItem("@Money:user", JSON.stringify(userData));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Falha no cadastro");
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { token, user: userData } = response.data;
      await AsyncStorage.setItem("@Money:token", token);
      await AsyncStorage.setItem("@Money:user", JSON.stringify(userData));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Falha no login");
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["@Money:token", "@Money:user"]);
    delete api.defaults.headers.Authorization;
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}