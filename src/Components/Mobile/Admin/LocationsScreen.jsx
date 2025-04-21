import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { HomeContext } from "../../../HomeContext";
import { useIsFocused } from "@react-navigation/native";
import { FlatList } from "react-native-web";
import { List } from "react-native-paper";

const LocationsScreen = () => {
  const isFocused = useIsFocused();
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [locations, setIngredients] = useState([]);

  const fetchIngredients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/locations`,
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
          message: "Error fetching locations. Please try again.",
          type: "error",
        });
        return;
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      showSnackbarMessage({
        message: "An error occurred while fetching locations.",
        type: "error",
      });
    }
  };

  const deleteIngredient = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/location/${id}`,
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
          message: "Error deleting location. Please try again.",
          type: "error",
        });
        return;
      }
      setIngredients((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
      showSnackbarMessage({
        message: "An error occurred while deleting the location.",
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
        data={locations}
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
          <Text style={styles.text}>No locations available</Text>
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

export default LocationsScreen;
