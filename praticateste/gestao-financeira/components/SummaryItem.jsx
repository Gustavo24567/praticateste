import { StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function SummaryItem({ categoryName, value, isIncome }) {
  const valueStyle = isIncome ? globalStyles.positiveText : globalStyles.negativeText;
  return (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={globalStyles.primaryText}>{categoryName}</Text>
        <Text style={valueStyle}>
          {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: { paddingVertical: 8 },
  textContainer: { flexDirection: "row", justifyContent: "space-between" },
});