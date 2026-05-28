import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

export default function CategoryItem({ category }) {
  // Se a categoria não tiver os campos necessários, mostra um ícone padrão
  const backgroundColor = category?.background || colors.secondaryText;
  const iconName = category?.icon || "help-outline";

  return (
    <View style={[styles.background, { backgroundColor }]}>
      <MaterialIcons name={iconName} size={24} color={colors.primaryContrast} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});