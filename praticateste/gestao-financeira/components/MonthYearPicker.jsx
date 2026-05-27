// components/MonthYearPicker.jsx
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { colors } from "../constants/colors";

export default function MonthYearPicker({ selectedMonth, selectedYear, onSelect }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Mês ${i + 1}` }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleConfirm = () => {
    onSelect(tempMonth, tempYear);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>
          {selectedMonth}/{selectedYear}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o período</Text>
            <Picker selectedValue={tempMonth} onValueChange={setTempMonth}>
              {months.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
            </Picker>
            <Picker selectedValue={tempYear} onValueChange={setTempYear}>
              {years.map(y => <Picker.Item key={y} label={y.toString()} value={y} />)}
            </Picker>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Aplicar" onPress={handleConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", margin: 20, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});