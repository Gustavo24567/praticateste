// app/(tabs)/index.jsx
import { useState, useContext, useEffect } from "react";
import { View, FlatList, Text, Alert, StyleSheet } from "react-native";
import { MoneyContext } from "../../contexts/GlobalState";
import { AuthContext } from "../../contexts/AuthContext";
import MonthYearPicker from "../../components/MonthYearPicker";
import TransactionItem from "../../components/TransactionItem";
import TransactionFormModal from "../../components/TransactionFormModal";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import { api } from "../../services/api";

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const { categories, refresh } = useContext(MoneyContext); // precisa ter categories no contexto
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Estados para o modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.listTransactions({ mes: selectedMonth, ano: selectedYear });
      setTransactions(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as transações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  // Abrir modal para editar
  const handleLongPress = (transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  // Fechar modal e limpar edição
  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  // Salvar edição (ou criar, se um dia for usado para criação)
  const handleSave = async (formData) => {
    try {
      if (editingTransaction) {
        // Edição
        await api.updateTransaction(editingTransaction.id, {
          description: formData.description,
          value: formData.value,
          date: formData.date,
          categoryId: formData.categoryId,
        });
        Alert.alert("Sucesso", "Transação atualizada");
      } else {
        // Criação (caso queira permitir também)
        await api.createTransaction(formData);
        Alert.alert("Sucesso", "Transação adicionada");
      }
      closeModal();
      loadTransactions(); // recarrega a lista
      refresh(); // se usar contexto global, atualiza também
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar a transação");
    }
  };

  // Excluir com confirmação
  const confirmDelete = (transaction) => {
    Alert.alert(
      "Excluir transação",
      `Deseja realmente excluir "${transaction.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteTransaction(transaction.id);
              Alert.alert("Sucesso", "Transação excluída");
              loadTransactions();
              refresh();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir");
            }
          },
        },
      ]
    );
  };

  // Como o TransactionItem espera receber o objeto inteiro, vamos modificar o renderItem
  const renderItem = ({ item }) => (
    <TransactionItem
      item={item}
      onLongPress={() => {
        Alert.alert(
          "Opções",
          `O que deseja fazer com "${item.description}"?`,
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Editar", onPress: () => handleLongPress(item) },
            { text: "Excluir", onPress: () => confirmDelete(item), style: "destructive" },
          ]
        );
      }}
    />
  );

  return (
    <View style={globalStyles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.name?.split(" ")[0]} 👋</Text>
        <MonthYearPicker
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={globalStyles.secondaryText}>Nenhuma transação neste período</Text>}
        refreshing={loading}
        onRefresh={loadTransactions}
        style={globalStyles.content}
      />

      {/* Modal de edição */}
      <TransactionFormModal
        visible={modalVisible}
        onClose={closeModal}
        onSubmit={handleSave}
        initialData={editingTransaction}
        categories={categories}
      />
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
  welcome: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});