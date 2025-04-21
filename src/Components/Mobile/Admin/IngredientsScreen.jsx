import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { HomeContext } from "../../../HomeContext";
import { useIsFocused } from "@react-navigation/native";
import { FlatList } from "react-native-web";
import { List } from "react-native-paper";

const IngredientsScreen = () => {
  const isFocused = useIsFocused();
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [ingredients, setIngredients] = useState([]);

  const fetchIngredients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/ingredients`,
        {
          credentials:
            import.meta.env.VITE_ENV === "production" ? "include" : undefined,
        }
      );
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        showSnackbarMessage({
          message: "Error fetching ingredients. Please try again.",
          type: "error",
        });
        return;
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      showSnackbarMessage({
        message: "An error occurred while fetching ingredients.",
        type: "error",
      });
    }
  };

  const deleteIngredient = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/ingredient/${id}`,
        {
          method: "DELETE",
          credentials:
            import.meta.env.VITE_ENV === "production" ? "include" : undefined,
        }
      );
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        showSnackbarMessage({
          message: "Error deleting ingredient. Please try again.",
          type: "error",
        });
        return;
      }
      setIngredients((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      showSnackbarMessage({
        message: "An error occurred while deleting the ingredient.",
        type: "error",
      });
    }
    fetchIngredients();
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchIngredients();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            onPress={() => deleteIngredient(item?._id)}
            left={(props) => <List.Icon {...props} icon="delete" />}
          />
        )}
        style={{ width: "100%" }}
        ListEmptyComponent={
          <Text style={styles.text}>No ingredients available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default IngredientsScreen;
