import React, { useState, useEffect, useContext, useRef } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  HelperText,
  ActivityIndicator,
  Text,
  Menu,
  Searchbar,
  FAB,
} from "react-native-paper";
import { FlatList } from "react-native-web";
import { FaBalanceScale } from "react-icons/fa";
import { HomeContext } from "../../HomeContext";
import InputDropdown from "./InputDropdown";
import RecipeRenderer from "./RecipeRenderer";
import { useIsFocused } from "@react-navigation/native";

const Recipes = () => {
  const isFocused = useIsFocused();
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [recipes, setRecipes] = useState([]);
  const [editRecipeId, setEditRecipeId] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipeForm, setRecipeForm] = useState({
    title: "",
    ingredients: [],
  });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const [recipesLoading, setRecipesLoading] = useState(true);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  const [isAddingItem, setIsAddingItem] = useState(false);

  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  const [recipeFilter, setRecipeFilter] = useState("");

  const [isFabOpen, setIsFabOpen] = useState(false);

  const inputRef = useRef(null);

  const fetchRecipes = async () => {
    try {
      setRecipesLoading(true);
      const response = await fetch(`${import.meta.env.VITE_HOST}/recipes`, {
        credentials:
          import.meta.env.VITE_ENV === "production" ? "include" : undefined,
      });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      showSnackbarMessage({
        message: "Error fetching recipes. Please try again.",
        type: "error",
      });
    } finally {
      setRecipesLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      setIngredientsLoading(true);
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
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setIngredientsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!recipeForm.title.trim()) {
      newErrors.title = "Recipe title is required.";
    }
    if (recipeForm.ingredients.length < 1) {
      newErrors.ingredients = "At least one ingredient is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      setRecipeForm((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, data.insertedId],
      }));
      await fetchIngredients();
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsAddingItem(false); // Stop loading
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (recipeForm.quantity && recipeForm.ingredient) {
      setRecipeForm((prev) => ({
        ...prev,
        ingredients: [
          ...(prev?.ingredients ?? []),
          {
            _id: recipeForm.ingredient,
            quantity: recipeForm.quantity,
            unit: recipeForm.unit,
          },
        ],
      }));
      setRecipeForm((prev) => ({ ...prev, quantity: 1 }));
      inputRef.current.clearInput();
    }
  };

  const getRecipeLabel = () => {
    if (recipeForm?.ingredients?.length > 0) {
      if (recipeForm.ingredients.length === 1) {
        return "Recipe Name (1 ingredient)";
      } else if (recipeForm.ingredients.length > 1) {
        return `Recipe Name (${recipeForm.ingredients.length} ingredients)`;
      }
    }
    return "Recipe Name";
  };

  const handleSaveRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    const recipeData = {
      title: recipeForm.title,
      ingredients: recipeForm.ingredients,
    };

    const method = editRecipeId ? "PATCH" : "PUT";
    const url = editRecipeId
      ? `${import.meta.env.VITE_HOST}/recipe/${editRecipeId}`
      : `${import.meta.env.VITE_HOST}/recipe/`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error saving recipe. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Recipe saved successfully.",
      type: "success",
    });
    setEditRecipeId(null);
    setRecipeForm({ title: "", quantity: 1, unit: undefined, ingredients: [] });
    handleCloseDialog();
    fetchRecipes(); // Refresh the recipe list
  };

  const handleCloseDialog = () => {
    setEditRecipeId(null);
    setIsDialogVisible(false);
    setRecipeForm({ title: "", quantity: 1, unit: undefined, ingredients: [] });
    setErrors({});
  };

  const handleDeleteRecipe = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/recipe/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error deleting recipe. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Recipe deleted successfully.",
      type: "success",
    });
    fetchRecipes(); // Refresh the recipe list
  };

  const handleAddShoppingItem = async (item) => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/shopping/item`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
  };

  const handleAddRecipeToShoppingList = async (ingrs) => {
    const ingredients = ingrs.map((ingredient) => ({
      ingredient: ingredient._id,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    }));
    const responses = await Promise.all(
      ingredients.map((ingredient) => {
        return handleAddShoppingItem(ingredient);
      })
    );
    if (responses.some((response) => response.status === 401)) {
      redirectToLogin();
      return;
    }
    if (responses.some((response) => !response.ok)) {
      showSnackbarMessage({
        message: "Error adding recipe to shopping list. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Recipe added to shopping list.",
      type: "success",
    });
  };

  useEffect(() => {
    if (editRecipeId) {
      const selectedRecipe = recipes.find(
        (recipe) => recipe._id === editRecipeId
      );
      if (selectedRecipe) {
        setRecipeForm({
          title: selectedRecipe.title,
          ingredients: selectedRecipe.ingredients,
          quantity: 1,
          unit: undefined,
        });
        setIsDialogVisible(true);
      }
    } else {
      setRecipeForm({
        title: "",
        quantity: 1,
        unit: undefined,
        ingredients: [],
      });
    }
  }, [editRecipeId]);

  useEffect(() => {
    if (!isFocused) return;
    fetchRecipes();
    fetchIngredients();
  }, [isFocused]);

  if (recipesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search recipes"
        onChangeText={(query) => setRecipeFilter(query)}
        value={recipeFilter}
      />
      <FlatList
        data={recipes.filter((recipe) =>
          recipe.title.toLowerCase().includes(recipeFilter.toLowerCase())
        )}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RecipeRenderer
            recipe={item}
            ingredientOptions={ingredients}
            handleEditRecipe={setEditRecipeId}
            handleAddToShoppingList={handleAddRecipeToShoppingList}
            handleDeleteRecipe={handleDeleteRecipe}
          />
        )}
      />
      <FAB.Group
        open={isFabOpen}
        icon={isFabOpen ? "close" : "menu"}
        actions={[
          {
            icon: "plus",
            label: "New Recipe",
            onPress: () => {
              setEditRecipeId(null);
              setRecipeForm({
                title: "",
                quantity: 1,
                unit: undefined,
                ingredients: [],
              });
              setErrors({});
              setIsDialogVisible(true);
            },
          },
        ]}
        onStateChange={({ open }) => setIsFabOpen(open)}
      />

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={handleCloseDialog}>
          <Dialog.Title>New Recipe</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={getRecipeLabel()}
              value={recipeForm.title}
              onChangeText={(text) =>
                setRecipeForm((prev) => ({ ...prev, title: text }))
              }
              style={styles.input}
              error={!!errors.title}
            />
            {errors.title && (
              <HelperText type="error">{errors.title}</HelperText>
            )}

            <View style={styles.input}>
              <InputDropdown
                ref={inputRef}
                loading={ingredientsLoading}
                options={ingredients}
                onAddItem={addIngredient}
                onSelect={(ingredient) => {
                  setRecipeForm((prev) => ({
                    ...prev,
                    ingredient: ingredient._id,
                  }));
                }}
              />
              {errors.ingredients && (
                <HelperText type="error">{errors.ingredients}</HelperText>
              )}
            </View>
            <View style={styles.input}>
              <View style={styles.quantity}>
                <TextInput
                  label="Quantity"
                  value={recipeForm.quantity}
                  onChangeText={(text) =>
                    setRecipeForm({ ...recipeForm, quantity: text })
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
                      {recipeForm.unit || <FaBalanceScale />}
                    </Button>
                  }
                >
                  {[<FaBalanceScale key="none" />, "kg", "g", "l", "ml"].map(
                    (unit) => (
                      <Menu.Item
                        key={unit}
                        onPress={() => {
                          setRecipeForm((prev) => ({
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
            <View style={styles.addButton}>
              <Button
                mode="contained"
                onPress={handleAddIngredientToRecipe}
                loading={isAddingItem}
              >
                Add Ingredient
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseDialog}>Cancel</Button>
            <Button onPress={handleSaveRecipe}>Save</Button>
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
    gap: 8,
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
  addButton: {},
});

export default Recipes;
