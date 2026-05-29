import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import Button from "../../components/Button";
import { useContext, useRef, useState } from "react";
import DescriptionInput from "../../components/DescriptionInput";
import CurrencyInput from "../../components/CurrencyInput";
import DatePicker from "../../components/DatePicker";
import CategoryPicker from "../../components/CategoryPicker";
import { MoneyContext } from "../../contexts/GlobalState";
import  api  from "../../services/api";

export default function AddTransactions() {
  const [form, setForm] = useState({
    description: "",
    value: 0,
    date: new Date(),
    categoryId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const valueInputRef = useRef();
  const { categories, refresh } = useContext(MoneyContext);

  const addTransaction = async () => {
    if (!form.description.trim()) {
      Alert.alert("Erro", "Digite uma descrição");
      return;
    }
    if (form.value <= 0) {
      Alert.alert("Erro", "Digite um valor válido");
      return;
    }
    if (!form.categoryId) {
      Alert.alert("Erro", "Selecione uma categoria");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/transactions", {
        description: form.description,
        value: form.value,
        date: form.date,
        categoryId: form.categoryId,
      });
      setForm({
        description: "",
        value: 0,
        date: new Date(),
        categoryId: "",
      });
      refresh();
      Alert.alert("Sucesso", "Transação adicionada!");
    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", error.response?.data?.error || "Falha ao adicionar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.screenContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={globalStyles.content}>
          <View style={styles.form}>
            <DescriptionInput
              form={form}
              setForm={setForm}
              valueInputRef={valueInputRef}
            />
            <CurrencyInput form={form} setForm={setForm} />
            <DatePicker form={form} setForm={setForm} />
            <CategoryPicker
              form={form}
              setForm={setForm}
              categories={categories}
            />
          </View>
          <Button onPress={addTransaction} disabled={submitting}>
            {submitting ? "Salvando..." : "Adicionar"}
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, marginBottom: 40, marginTop: 10 },
});