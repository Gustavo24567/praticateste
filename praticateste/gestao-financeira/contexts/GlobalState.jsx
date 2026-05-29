import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MoneyContext = createContext();

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("@Money:token");
      if (!token) {
        setLoading(false);
        return;
      }
      const [catsRes, txsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/transactions"),
      ]);
      setCategories(catsRes.data);
      setTransactions(txsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = () => loadData();

  const addCategory = async (categoryData) => {
    try {
      const res = await api.post("/categories", categoryData);
      setCategories(prev => [...prev, res.data]);
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
      const res = await api.post("/transactions", txData);
      setTransactions(prev => [res.data, ...prev]);
      return res.data;
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
      const res = await api.put(`/transactions/${id}`, txData);
      setTransactions(prev => prev.map(tx => tx.id === id ? res.data : tx));
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