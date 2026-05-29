import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../constants/colors";

export default function CategoryPicker({ form, setForm, categories }) {
  return (
    <View>
      <Text style={globalStyles.inputLabel}>Categoria</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={form.categoryId}
          onValueChange={(value) => setForm({ ...form, categoryId: value })}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categories?.map((cat) => (
            <Picker.Item key={cat.id} label={cat.displayName} value={cat.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    justifyContent: "center",
    height: 44,
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});