import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { VictoryPie, VictoryLegend } from "victory-native";
import MonthYearPicker from "../../components/MonthYearPicker";
import SummaryItem from "../../components/SummaryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";

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
      console.error(error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  // Calcular totais por categoria
  const totals = {};
  let balance = 0;
  transactions.forEach(tx => {
    const catId = tx.category.id;
    if (!totals[catId]) {
      totals[catId] = { name: tx.category.displayName, value: 0, isIncome: tx.category.isIncome };
    }
    totals[catId].value += tx.value;
    if (tx.category.isIncome) {
      balance += tx.value;
    } else {
      balance -= tx.value;
    }
  });

  // Dados para o gráfico (apenas despesas)
  const pieData = Object.values(totals)
    .filter(cat => !cat.isIncome && cat.value > 0)
    .map(cat => ({ x: cat.name, y: cat.value }));

  const screenWidth = Dimensions.get("window").width;
  const hasExpenses = pieData.length > 0;

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
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Despesas por categoria</Text>
          {hasExpenses ? (
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
        </View>

        {/* LISTA DE TOTAIS */}
        {Object.values(totals).map((cat) => (
          <SummaryItem key={cat.name} categoryName={cat.name} value={cat.value} isIncome={cat.isIncome} />
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
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  balance: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  balanceText: { fontSize: 18, fontWeight: "800", color: colors.primaryText },
});