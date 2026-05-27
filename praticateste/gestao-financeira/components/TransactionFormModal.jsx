// components/TransactionFormModal.jsx
import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../constants/colors";

export default function TransactionFormModal({ visible, onClose, onSubmit, initialData, categories }) {
  const [form, setForm] = useState({
    description: "",
    value: 0,
    date: new Date(),
    categoryId: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Preencher o formulário quando initialData mudar (modo edição)
  useEffect(() => {
    if (initialData) {
      setForm({
        description: initialData.description || "",
        value: initialData.value || 0,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        categoryId: initialData.categoryId || initialData.category?.id || "",
      });
    } else {
      // Reset para valores padrão (modo criação)
      setForm({
        description: "",
        value: 0,
        date: new Date(),
        categoryId: categories.find(c => c.isIncome)?.id || "",
      });
    }
  }, [initialData, categories]);

  const handleCurrencyChange = (text) => {
    const formattedValue = text.replace(/\D/g, "");
    const numberValue = formattedValue ? parseFloat(formattedValue) / 100 : 0;
    setForm({ ...form, value: numberValue });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setForm({ ...form, date: selectedDate });
  };

  const handleSubmit = () => {
    if (!form.description || form.value <= 0 || !form.categoryId) {
      alert("Preencha todos os campos");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.modalTitle}>{initialData ? "Editar Transação" : "Nova Transação"}</Text>

          {/* Descrição */}
          <Text style={globalStyles.inputLabel}>Descrição</Text>
          <TextInput
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            style={globalStyles.input}
            placeholder="Ex: Salário, Compras..."
          />

          {/* Valor */}
          <Text style={globalStyles.inputLabel}>Valor (R$)</Text>
          <TextInput
            value={form.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            onChangeText={handleCurrencyChange}
            keyboardType="numeric"
            style={globalStyles.input}
          />

          {/* Data */}
          <Text style={globalStyles.inputLabel}>Data</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              value={form.date.toLocaleDateString("pt-BR")}
              editable={false}
              style={globalStyles.input}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <RNDateTimePicker
              value={form.date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleDateChange}
            />
          )}

          {/* Categoria */}
          <Text style={globalStyles.inputLabel}>Categoria</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.categoryId}
              onValueChange={(itemValue) => setForm({ ...form, categoryId: itemValue })}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.displayName} value={cat.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, gap: 12 },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  pickerContainer: { borderWidth: 1, borderColor: colors.secondaryText, borderRadius: 8, overflow: "hidden" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, gap: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#ccc" },
  submitButton: { backgroundColor: colors.primary },
  buttonText: { color: "#fff", fontWeight: "bold" },
});