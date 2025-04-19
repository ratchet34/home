import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  HelperText,
  Card,
  Chip,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import { HomeContext } from "../../HomeContext";
import MultiSelectDropdown from "./MultiSelectDropdown";

const Recipes = () => {
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipeForm, setRecipeForm] = useState({
    name: "",
    ingredients: [],
  });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const [recipesLoading, setRecipesLoading] = useState(true);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  const [isAddingItem, setIsAddingItem] = useState(false);

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
    if (!recipeForm.name.trim()) {
      newErrors.name = "Recipe name is required.";
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

  const handleSelectIngredient = (ingredient) => {
    setRecipeForm((prev) => {
      const isSelected = prev.ingredients.some(
        (item) => item === ingredient._id
      );
      if (isSelected) {
        return {
          ...prev,
          ingredients: prev.ingredients.filter(
            (item) => item !== ingredient._id
          ),
        };
      } else {
        return {
          ...prev,
          ingredients: [...new Set([...prev.ingredients, ingredient._id])],
        };
      }
    });
  };

  const handleSaveRecipe = () => {
    if (!validateForm()) {
      return;
    }

    setRecipeForm({ name: "", ingredients: [] });
    setIsDialogVisible(false);
  };

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  if (recipesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recipes.map((recipe, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title title={recipe.name} />
          <Card.Content>
            {recipe.ingredients.map((ingredient, idx) => (
              <Chip key={idx} style={styles.chip}>
                {ingredient.name}
                {ingredient.quantity ? ` - ${ingredient.quantity}` : ""}
              </Chip>
            ))}
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={() => setIsDialogVisible(true)}
        style={styles.addButton}
      >
        Add Recipe
      </Button>

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>New Recipe</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Recipe Name"
              value={recipeForm.name}
              onChangeText={(text) =>
                setRecipeForm((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <MultiSelectDropdown
              loading={ingredientsLoading}
              options={ingredients}
              value={recipeForm.ingredients}
              onAddItem={addIngredient}
              onSelect={handleSelectIngredient}
              closeMenuOnSelect={false}
            />
            {errors.ingredients && (
              <HelperText type="error">{errors.ingredients}</HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chip: {
    marginVertical: 4,
  },
  addButton: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityInput: {
    flex: 1,
    marginRight: 8,
  },
});

export default Recipes;
