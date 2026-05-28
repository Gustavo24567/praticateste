import { Text, TextInput, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function CurrencyInput({ form, setForm }) {
  const handleCurrencyChange = (text) => {
    const formattedValue = text.replace(/\D/g, "");
    const numberValue = formattedValue ? parseFloat(formattedValue) / 100 : 0;
    setForm({ ...form, value: numberValue });
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