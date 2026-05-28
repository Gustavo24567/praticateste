import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import CategoryItem from "./CategoryItem";

export default function TransactionItem({ item, onLongPress }) {
  // Garante que a categoria existe
  const category = item.category || {};
  const valueStyle = category.isIncome ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.itemContainer}>
        <CategoryItem category={category} />
        <View style={styles.textContainer}>
          <Text style={globalStyles.secondaryText}>
            {new Date(item.date).toLocaleDateString("pt-BR")}
          </Text>
          <View style={styles.bottomLine}>
            <Text style={globalStyles.primaryText}>{item.description}</Text>
            <Text style={valueStyle}>
              {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </Text>
          </View>
        </View>
      </View>
      <View style={globalStyles.line} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: { flexDirection: "row", alignItems: "center", paddingBottom: 4 },
  textContainer: { flex: 1, marginLeft: 12, paddingVertical: 8 },
  bottomLine: { flexDirection: "row", justifyContent: "space-between" },
});