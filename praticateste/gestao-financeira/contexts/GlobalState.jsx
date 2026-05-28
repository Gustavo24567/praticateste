import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MoneyContext = createContext();

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carrega os dados SEM depender do AuthContext (lê o token diretamente)
  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("@Money:token");
      if (!token) {
        console.log("Sem token, não carregando dados");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log("Carregando dados com token:", token.substring(0, 20) + "...");
      
      const [catsRes, txsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/transactions"),
      ]);
      
      console.log("Categorias carregadas:", catsRes.data.length);
      setCategories(catsRes.data);
      setTransactions(txsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error.response?.status, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega sempre que o token mudar (login/logout)
  useEffect(() => {
    const checkTokenAndLoad = async () => {
      const token = await AsyncStorage.getItem("@Money:token");
      setIsAuthenticated(!!token);
      if (token) {
        await loadData();
      } else {
        setCategories([]);
        setTransactions([]);
        setLoading(false);
      }
    };
    checkTokenAndLoad();

    // Escuta mudanças no storage (quando o token é salvo ou removido)
    const interval = setInterval(checkTokenAndLoad, 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const refresh = () => loadData();

  const addCategory = async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      setCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Erro ao criar categoria");
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      throw new Error(error.response?.data?.error || "Erro ao excluir categoria");
    }
  };

  const addTransaction = async (txData) => {
    try {
      const response = await api.post("/transactions", txData);
      setTransactions(prev => [response.data, ...prev]);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Erro ao criar transação");
    }
  };

  const removeTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (error) {
      throw new Error(error.response?.data?.error || "Erro ao excluir transação");
    }
  };

  const updateTransaction = async (id, txData) => {
    try {
      const response = await api.put(`/transactions/${id}`, txData);
      setTransactions(prev => prev.map(tx => tx.id === id ? response.data : tx));
    } catch (error) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar transação");
    }
  };

  return (
    <MoneyContext.Provider value={{
      transactions,
      categories,
      loading,
      refresh,
      addCategory,
      removeCategory,
      addTransaction,
      removeTransaction,
      updateTransaction,
    }}>
      {children}
    </MoneyContext.Provider>
  );
}