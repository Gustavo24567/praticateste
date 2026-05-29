import { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import MonthYearPicker from "../../components/MonthYearPicker";
import SummaryItem from "../../components/SummaryItem";
import PieChartCustom from "../../components/PieChartCustom";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthContext";
import { MoneyContext } from "../../contexts/GlobalState";
import api from "../../services/api";

export default function Summary() {
  const { user } = useContext(AuthContext);
  const { categories } = useContext(MoneyContext); // 🔹 lista completa de categorias
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadTransactions = useCallback(async () => {
    try {
      const response = await api.get("/transactions", {
        params: { mes: selectedMonth, ano: selectedYear },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  // 🔹 Inicializa totais com todas as categorias (valor zero)
  const initialTotals = {};
  categories.forEach(cat => {
    initialTotals[cat.id] = {
      id: cat.id,
      name: cat.displayName,
      value: 0,
      isIncome: cat.isIncome,
      category: cat,
      color: cat.background || "#CCCCCC",
    };
  });

  // Soma os valores das transações
  let balance = 0;
  transactions.forEach(tx => {
    const catId = tx.category.id;
    if (initialTotals[catId]) {
      initialTotals[catId].value += tx.value;
      if (tx.category.isIncome) balance += tx.value;
      else balance -= tx.value;
    }
  });

  // Converte o objeto para array e ordena (opcional: receitas primeiro ou ordem alfabética)
  const totalsArray = Object.values(initialTotals).sort((a, b) => a.name.localeCompare(b.name));

  // Dados para o gráfico (apenas despesas com valor > 0)
  const pieData = totalsArray
    .filter(cat => !cat.isIncome && cat.value > 0)
    .map(cat => ({
      name: cat.name,
      value: Number(cat.value),
      color: cat.color,
    }));

  const screenWidth = Dimensions.get("window").width;
  const totalExpenses = pieData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <View style={globalStyles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo</Text>
        <MonthYearPicker
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
      </View>
      <ScrollView style={globalStyles.content}>
        {pieData.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChartCustom data={pieData} width={screenWidth - 40} height={200} />
            {/* Legenda com percentual e valor */}
            <View style={{ marginTop: 16, width: "100%" }}>
              {pieData.map((cat, idx) => {
                const percent = ((cat.value / totalExpenses) * 100).toFixed(1);
                return (
                  <View key={idx} style={styles.legendItem}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={[styles.colorBox, { backgroundColor: cat.color }]} />
                      <Text style={styles.legendName}>{cat.name}</Text>
                    </View>
                    <View style={styles.legendValues}>
                      <Text style={styles.legendPercent}>{percent}%</Text>
                      <Text style={styles.legendValue}>
                        {cat.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <Text style={globalStyles.secondaryText}>Nenhuma despesa no período</Text>
        )}

        {/* 🔹 Lista de todas as categorias (com valor zero se não houver transação) */}
        {totalsArray.map(cat => (
          <SummaryItem
            key={cat.id}
            categoryName={cat.name}
            value={cat.value}
            isIncome={cat.isIncome}
            category={cat.category}
          />
        ))}

        <View style={globalStyles.line} />
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Saldo</Text>
          <Text style={balance > 0 ? globalStyles.positiveText : globalStyles.negativeText}>
            {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  chartContainer: { alignItems: "center", marginVertical: 16 },
  balance: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  balanceText: { fontSize: 18, fontWeight: "800", color: colors.primaryText },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  colorBox: { width: 12, height: 12, marginRight: 8 },
  legendName: { fontSize: 14, fontWeight: "500", flex: 1 },
  legendValues: { flexDirection: "row", gap: 12 },
  legendPercent: { fontSize: 14, color: "#555" },
  legendValue: { fontSize: 14, fontWeight: "bold" },
});