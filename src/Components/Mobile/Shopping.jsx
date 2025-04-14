import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  TextInput,
  HelperText,
  IconButton,
} from "react-native-paper";
import { FaPlus } from "react-icons/fa";
import { FlatList } from "react-native-web";
import { HomeContext } from "../../HomeContext";
import ShoppingRenderer from "./ShoppingRenderer";
import {
  AutocompleteDropdown,
  AutocompleteDropdownContextProvider,
} from "react-native-autocomplete-dropdown";

const Shopping = () => {
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [itemForm, setItemForm] = useState({
    ingredient: "",
    quantity: "",
    location: "",
  });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchShoppingItems = async () => {
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
            item: {
              title: ingr,
            },
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
        ingredient: data._id,
      }));
      await getIngredientDictionary();
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsAddingItem(false); // Stop loading
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
            item: {
              title: loc,
            },
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
        location: data._id,
      }));
      await getLocationDictionary();
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setIsAddingLocation(false); // Stop loading
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
    fetchShoppingItems();
    fetchIngredientOptions();
    fetchLocationOptions();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={shoppingItems}
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
      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon={() => <FaPlus />}
        onPress={() => {
          setEditItemId(null);
          setItemForm({ ingredient: null, quantity: "", location: [] });
          setErrors({});
          setIsDialogVisible(true);
        }}
      />

      {/* Item Dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <AutocompleteDropdownContextProvider>
            <Dialog.Title>{editItemId ? "Edit Item" : "New Item"}</Dialog.Title>
            <Dialog.Content>
              <View style={styles.input}>
                <AutocompleteDropdown
                  clearOnFocus={false}
                  closeOnSubmit={true}
                  deboyunce={600}
                  useFilter={false}
                  initialValue={itemForm?.ingredient ?? ""}
                  dataSet={ingredientOptions}
                  onSelectItem={(item) =>
                    setItemForm({ ...itemForm, ingredient: item?.id || null })
                  }
                  InputComponent={TextInput}
                  textInputProps={{
                    label: "Item",
                  }}
                  rightButtonsContainerStyle={{
                    justifyContent: "flex-end",
                    alignItems: "end",
                  }}
                  inputContainerStyle={{
                    height: 56,
                  }}
                />
                {errors.ingredient && (
                  <HelperText type="error">{errors.ingredient}</HelperText>
                )}
              </View>

              <TextInput
                label="Quantity"
                value={itemForm.quantity}
                onChangeText={(text) =>
                  setItemForm({ ...itemForm, quantity: text })
                }
                style={styles.input}
                keyboardType="numeric"
                error={!!errors.quantity}
                dense={true}
              />
              {errors.quantity && (
                <HelperText type="error">{errors.quantity}</HelperText>
              )}
              <View style={styles.autocompleteWrapper}>
                <View style={styles.input}>
                  <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnSubmit={false}
                    deboyunce={600}
                    useFilter={false}
                    initialValue={itemForm?.location ?? ""}
                    dataSet={locationOptions.map((loc) => ({
                      id: loc._id,
                      title: loc.title,
                    }))}
                    onSelectItem={(item) =>
                      setItemForm((prev) => ({
                        ...prev,
                        location: item?.id,
                      }))
                    }
                    InputComponent={TextInput}
                    textInputProps={{
                      label: "Location",
                    }}
                    rightButtonsContainerStyle={{
                      justifyContent: "flex-end",
                      alignItems: "end",
                    }}
                    inputContainerStyle={{
                      height: 56,
                    }}
                  />
                </View>
                <IconButton
                  icon="plus"
                  mode="contained-tonal"
                  onPress={() => {
                    addLocation(itemForm.location);
                  }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
              <Button onPress={handleSaveItem}>Save</Button>
            </Dialog.Actions>
          </AutocompleteDropdownContextProvider>
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
  autocompleteWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Shopping;
