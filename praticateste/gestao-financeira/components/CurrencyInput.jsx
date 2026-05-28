import { Text, TextInput, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function CurrencyInput({ form, setForm }) {
  const handleCurrencyChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const numeric = cleaned ? parseFloat(cleaned) / 100 : 0;
    setForm({ ...form, value: numeric });
  };

  return (
    <View>
      <Text style={globalStyles.inputLabel}>Valor</Text>
      <TextInput
        value={form.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        onChangeText={handleCurrencyChange}
        keyboardType="numeric"
        style={globalStyles.input}
        placeholder="R$ 0,00"
      />
    </View>
  );
}