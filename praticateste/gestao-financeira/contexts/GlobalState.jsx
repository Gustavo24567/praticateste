import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "./AuthContext";

export const MoneyContext = createContext();

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [catsRes, txsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/transactions"),
      ]);
      setCategories(catsRes.data);
      setTransactions(txsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const refresh = () => loadData();

  const addCategory = async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      setCategories(prev => [...prev, response.data]);
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
    }}>
      {children}
    </MoneyContext.Provider>
  );
}