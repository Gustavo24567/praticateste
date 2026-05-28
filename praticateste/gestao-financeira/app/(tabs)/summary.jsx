import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import PieChart from "react-native-pie-chart";
import MonthYearPicker from "../../components/MonthYearPicker";
import SummaryItem from "../../components/SummaryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function Summary() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadTransactions = async () => {
    try {
      const response = await api.get("/transactions", {
        params: { mes: selectedMonth, ano: selectedYear },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  // Calcular totais
  const totals = {};
  let balance = 0;
  transactions.forEach(tx => {
    const cat = tx.category;
    if (!totals[cat.id]) {
      totals[cat.id] = {
        name: cat.displayName,
        value: 0,
        isIncome: cat.isIncome,
        category: cat,
        color: cat.background || "#CCCCCC",
      };
    }
    totals[cat.id].value += tx.value;
    if (cat.isIncome) balance += tx.value;
    else balance -= tx.value;
  });

  // Dados para o gráfico (apenas despesas)
  const pieData = Object.values(totals)
    .filter(cat => !cat.isIncome && cat.value > 0)
    .map(cat => ({
      value: Number(cat.value), // garantia de número
      color: cat.color,
    }));

  const screenWidth = Dimensions.get("window").width;

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
            <PieChart
              widthAndHeight={200}
              series={pieData.map(p => p.value)}
              sliceColor={pieData.map(p => p.color)}
              coverRadius={0.6}
            />
            <View style={{ marginTop: 16 }}>
              {Object.values(totals).filter(cat => !cat.isIncome && cat.value > 0).map((cat, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <View style={{ width: 12, height: 12, backgroundColor: cat.color, marginRight: 8 }} />
                  <Text style={{ fontSize: 12 }}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={globalStyles.secondaryText}>Nenhuma despesa no período</Text>
        )}

        {Object.values(totals).map(cat => (
          <SummaryItem
            key={cat.name}
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
});