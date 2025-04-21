import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  TextInput,
  HelperText,
  Menu,
  List,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import { FaBalanceScale } from "react-icons/fa";
import { FlatList } from "react-native-web";
import { HomeContext } from "../../HomeContext";
import ShoppingRenderer from "./ShoppingRenderer";
import InputDropdown from "./InputDropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useIsFocused } from "@react-navigation/native";

const Shopping = () => {
  const isFocused = useIsFocused();
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [itemForm, setItemForm] = useState({
    ingredient: "",
    quantity: 1,
    location: "",
  });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [sortByLocation, setSortByLocation] = useState(false);

  const [shoppingItemsLoading, setShoppingItemsLoading] = useState(false);

  const fetchShoppingItems = async () => {
    setShoppingItemsLoading(true);
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/shopping/items`,
      {
        credentials:
          import.meta.env.VITE_ENV === "production" ? "include" : undefined,
      }
    );
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    const data = await response.json();
    setShoppingItems(data);
    setShoppingItemsLoading(false);
  };

  const fetchIngredientOptions = async () => {
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
    const data = await response.json();
    setIngredientOptions(data);
  };

  const addIngredient = async (ingr) => {
    setIsAddingItem(true); // Start loading
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/ingredient`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: ingr,
          }),
          credentials:
            import.meta.env.VITE_ENV === "production" ? "include" : undefined,
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        showSnackbarMessage({
          message: "Error adding ingredient. Please try again.",
          type: "error",
        });
        return;
      }
      setItemForm((prev) => ({
        ...prev,
        ingredient: data.insertedId,
      }));
      await fetchIngredientOptions();
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsAddingItem(false); // Stop loading
    }
  };

  const handleSelectItem = (item) => {
    if (item) {
      setItemForm((prev) => ({
        ...prev,
        ingredient: item._id,
      }));
    } else {
      setItemForm((prev) => ({
        ...prev,
        ingredient: null,
      }));
    }
  };

  const fetchLocationOptions = async () => {
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
    const data = await response.json();
    setLocationOptions(data);
  };

  const addLocation = async (loc) => {
    setIsAddingLocation(true); // Start loading
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/location`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: loc,
          }),
          credentials:
            import.meta.env.VITE_ENV === "production" ? "include" : undefined,
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        showSnackbarMessage({
          message: "Error adding location. Please try again.",
          type: "error",
        });
        return;
      }
      setItemForm((prev) => ({
        ...prev,
        location: [...(prev.location ?? []), data.insertedId],
      }));
      await fetchLocationOptions();
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setIsAddingLocation(false); // Stop loading
    }
  };

  const handleSelectLocation = (item) => {
    if (item) {
      if (itemForm.location?.includes(item._id)) {
        setItemForm((prev) => ({
          ...prev,
          location: prev.location.filter((loc) => loc !== item._id),
        }));
        return;
      }
      setItemForm((prev) => ({
        ...prev,
        location: [...new Set([...(prev.location ?? []), item._id])],
      }));
    } else {
      setItemForm((prev) => ({
        ...prev,
        location: [],
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!itemForm.ingredient) {
      newErrors.ingredient = "Ingredient is required.";
    }
    if (!itemForm.quantity || isNaN(itemForm.quantity)) {
      newErrors.quantity = "Valid quantity is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveItem = async () => {
    if (!validateForm()) {
      return;
    }

    const method = editItemId ? "PATCH" : "PUT";
    const url = editItemId
      ? `${import.meta.env.VITE_HOST}/shopping/item/${editItemId}`
      : `${import.meta.env.VITE_HOST}/shopping/item`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemForm),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error saving item. Please try again.",
        type: "error",
      });
      return;
    }

    setIsDialogVisible(false);
    setItemForm({ ingredient: null, quantity: "", location: [] });
    setEditItemId(null);
    fetchShoppingItems();
  };

  const handleDeleteItem = async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/shopping/item/${id}`,
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
        message: "Error deleting item. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Item deleted successfully.",
      type: "success",
    });
    fetchShoppingItems();
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchShoppingItems();
    fetchIngredientOptions();
    fetchLocationOptions();
  }, [isFocused]);

  const allLocations = shoppingItems.reduce((acc, item) => {
    if (item.location) {
      item.location.forEach((locId) => {
        if (!acc.includes(locId)) {
          acc.push(locId);
        }
      });
    }
    return acc;
  }, []);

  if (shoppingItemsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} bounces={false}>
      {sortByLocation ? (
        allLocations.map((locationId) => (
          <List.Accordion
            key={locationId}
            title={
              locationOptions.find((loc) => loc._id === locationId)?.title ||
              "Unknown"
            }
          >
            <FlatList
              data={shoppingItems.filter((item) =>
                item.location?.includes(locationId)
              )}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <ShoppingRenderer
                  item={item}
                  ingredientOptions={ingredientOptions}
                  locationOptions={locationOptions}
                  setEditItemId={setEditItemId}
                  setItemForm={setItemForm}
                  setIsDialogVisible={setIsDialogVisible}
                  handleDeleteItem={handleDeleteItem}
                />
              )}
            />
          </List.Accordion>
        ))
      ) : (
        <FlatList
          data={shoppingItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ShoppingRenderer
              item={item}
              key={item._id}
              ingredientOptions={ingredientOptions}
              locationOptions={locationOptions}
              setEditItemId={setEditItemId}
              setItemForm={setItemForm}
              setIsDialogVisible={setIsDialogVisible}
              handleDeleteItem={handleDeleteItem}
            />
          )}
        />
      )}
      {/* Floating Action Button */}
      {/* Floating Action Button Group */}
      <FAB.Group
        open={isFabOpen}
        icon={isFabOpen ? "close" : "menu"}
        actions={[
          {
            icon: sortByLocation ? "close" : "format-list-group",
            label: sortByLocation ? "Clear grouping" : "Group by location",
            onPress: () => {
              setSortByLocation((prev) => !prev);
            },
          },
          {
            icon: "plus",
            label: "New Item",
            onPress: () => {
              setEditItemId(null);
              setItemForm({
                ingredient: null,
                quantity: 1,
                location: [],
              });
              setErrors({});
              setIsDialogVisible(true);
            },
          },
        ]}
        onStateChange={({ open }) => setIsFabOpen(open)}
      />

      {/* Item Dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>{editItemId ? "Edit Item" : "New Item"}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.input}>
              <InputDropdown
                loading={isAddingItem}
                options={ingredientOptions}
                onSelect={handleSelectItem}
                onAddItem={addIngredient}
              />
              {errors.ingredient && (
                <HelperText type="error">{errors.ingredient}</HelperText>
              )}
            </View>
            <View style={styles.input}>
              <View style={styles.quantity}>
                <TextInput
                  label="Quantity"
                  value={itemForm.quantity}
                  onChangeText={(text) =>
                    setItemForm({ ...itemForm, quantity: text })
                  }
                  keyboardType="numeric"
                  error={!!errors.quantity}
                  style={{ flex: 1 }}
                  dense={true}
                />
                {errors.quantity && (
                  <HelperText type="error">{errors.quantity}</HelperText>
                )}
                <Menu
                  visible={unitMenuVisible}
                  onDismiss={() => setUnitMenuVisible(false)}
                  anchor={
                    <Button
                      mode="contained-tonal"
                      onPress={() => setUnitMenuVisible((prev) => !prev)}
                    >
                      {itemForm.unit || <FaBalanceScale />}
                    </Button>
                  }
                >
                  {[<FaBalanceScale key="none" />, "kg", "g", "l", "ml"].map(
                    (unit) => (
                      <Menu.Item
                        key={unit}
                        onPress={() => {
                          setItemForm((prev) => ({
                            ...prev,
                            unit,
                          }));
                          setUnitMenuVisible(false);
                        }}
                        title={unit}
                      />
                    )
                  )}
                </Menu>
              </View>
            </View>
            <View style={styles.input}>
              <MultiSelectDropdown
                loading={isAddingLocation}
                options={locationOptions}
                onSelect={handleSelectLocation}
                onAddItem={addLocation}
                value={itemForm.location}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveItem}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  fab: {
    position: "fixed",
    right: 16,
    bottom: 16,
  },
  input: {
    marginBottom: 16,
    height: 56,
    flexShrink: 1,
  },
  quantity: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ".5em",
  },
});

export default Shopping;
