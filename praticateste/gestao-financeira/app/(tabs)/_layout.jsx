// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import { useContext } from "react";
import { Redirect } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Transações",
          tabBarIcon: ({ color }) => <MaterialIcons name="list" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="AddTransactions"
        options={{
          title: "Adicionar",
          tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Resumo",
          tabBarIcon: ({ color }) => <MaterialIcons name="pie-chart" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorias",
          tabBarIcon: ({ color }) => <MaterialIcons name="category" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}