import { useState, useContext, useEffect } from "react";
import { View, FlatList, Text, Alert, StyleSheet, RefreshControl } from "react-native";
import { MoneyContext } from "../../contexts/GlobalState";
import { AuthContext } from "../../contexts/AuthContext";
import MonthYearPicker from "../../components/MonthYearPicker";
import TransactionItem from "../../components/TransactionItem";
import TransactionFormModal from "../../components/TransactionFormModal";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import  api  from "../../services/api";

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const moneyContext = useContext(MoneyContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Estados para o modal de edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Verifica se o contexto está disponível
  if (!moneyContext) {
    return (
      <View style={styles.center}>
        <Text>Carregando contexto...</Text>
      </View>
    );
  }

  const { categories, refresh: refreshContext } = moneyContext;

  // Carrega transações do backend com filtro
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setTransactions(response.data);
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
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  // Fechar modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  // Salvar edição
  const handleSave = async (formData) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, {
          description: formData.description,
          value: formData.value,
          date: formData.date,
          categoryId: formData.categoryId,
        });
        Alert.alert("Sucesso", "Transação atualizada");
      }
      closeModal();
      loadTransactions();
      refreshContext();
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
              await api.delete(`/transactions/${transaction.id}`);
              Alert.alert("Sucesso", "Transação excluída");
              loadTransactions();
              refreshContext();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir");
            }
          },
        },
      ]
    );
  };

  // Menu de opções ao pressionar longamente
  const handleLongPress = (transaction) => {
    Alert.alert(
      "Opções",
      `O que deseja fazer com "${transaction.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Editar", onPress: () => handleEdit(transaction) },
        { text: "Excluir", onPress: () => confirmDelete(transaction), style: "destructive" },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TransactionItem item={item} onLongPress={() => handleLongPress(item)} />
  );

  return (
    <View style={globalStyles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.name?.split(" ")[0] || "Usuário"} 👋</Text>
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
        ListEmptyComponent={
          <Text style={globalStyles.secondaryText}>Nenhuma transação neste período</Text>
        }
        refreshing={loading}
        onRefresh={loadTransactions}
        style={globalStyles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransactions} colors={[colors.primary]} />
        }
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});