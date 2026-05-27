// app/(tabs)/summary.jsx
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { VictoryPie, VictoryLegend } from "victory-native";
import MonthYearPicker from "../../components/MonthYearPicker";
import SummaryItem from "../../components/SummaryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import { api } from "../../services/api";

export default function Summary() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadTransactions = async () => {
    try {
      const data = await api.listTransactions({ mes: selectedMonth, ano: selectedYear });
      setTransactions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  // Cálculo de totais por categoria (incluindo receitas) e saldo
  const totals = {};
  let balance = 0;
  transactions.forEach(tx => {
    const catName = tx.category.name;
    totals[catName] = (totals[catName] || 0) + tx.value;
    if (tx.category.isIncome) balance += tx.value;
    else balance -= tx.value;
  });

  // Dados para o gráfico (apenas despesas)
  const expensesByCategory = {};
  let totalExpenses = 0;
  transactions.forEach(tx => {
    if (!tx.category.isIncome) {
      const catName = tx.category.displayName;
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + tx.value;
      totalExpenses += tx.value;
    }
  });
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ x: name, y: value }));
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
        {/* GRÁFICO DE PIZZA */}
        {totalExpenses > 0 ? (
          <>
            <VictoryPie
              data={pieData}
              width={screenWidth - 40}
              height={250}
              colorScale="qualitative"
              innerRadius={50}
              labelRadius={70}
              style={{ labels: { fontSize: 12, fill: "#333" } }}
            />
            <VictoryLegend
              data={pieData.map(item => ({ name: item.x }))}
              orientation="vertical"
              gutter={10}
              style={{ labels: { fontSize: 10 } }}
              width={screenWidth - 40}
            />
          </>
        ) : (
          <Text style={globalStyles.secondaryText}>Nenhuma despesa no período</Text>
        )}

        {/* LISTA DE TOTAIS POR CATEGORIA */}
        {Object.entries(totals).map(([catName, value]) => {
          const category = transactions.find(tx => tx.category.name === catName)?.category;
          if (!category) return null;
          return <SummaryItem key={catName} category={catName} value={value} />;
        })}
        
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
  balance: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  balanceText: { fontSize: 18, fontWeight: "800", color: colors.primaryText },
});