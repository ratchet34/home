import PropTypes from "prop-types";
import React from "react";
import { LuCookingPot } from "react-icons/lu";
import { Appearance, StyleSheet } from "react-native";
import { Card, IconButton, List } from "react-native-paper";

const RecipeRenderer = ({
  recipe,
  handleAddToShoppingList = () => {},
  handleEditRecipe = () => {},
  handleDeleteRecipe = () => {},
  ingredientOptions = [],
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title={recipe.title} />
      <Card.Content>
        <List.Accordion
          title={`Ingredients (${recipe.ingredients?.length})`}
          style={styles.accordion}
          titleStyle={styles.accordionTitle}
          left={(props) => (
            <List.Icon {...props} icon={() => <LuCookingPot />} />
          )}
        >
          {recipe.ingredients.map((ingredient, index) => (
            <List.Item
              key={index}
              title={`${
                ingredientOptions.find(
                  (option) => option._id === ingredient._id
                )?.title || "Unknown"
              }
                ${
                  ingredient.quantity
                    ? ` - ${ingredient.quantity}${
                        ingredient.unit ? `${ingredient.unit}` : ""
                      }`
                    : ""
                }`}
              style={styles.accordionItem}
            />
          ))}
        </List.Accordion>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <IconButton
          icon="cart-plus"
          onPress={() => handleAddToShoppingList(recipe.ingredients)}
          mode="contained-tonal"
          size={20}
          style={styles.iconButton}
        />
        <IconButton
          icon="pencil"
          onPress={() => handleEditRecipe(recipe._id)}
          mode="contained-tonal"
          size={20}
          style={styles.iconButton}
        />
        <IconButton
          icon="delete"
          onPress={() => handleDeleteRecipe(recipe._id)}
          mode="contained-tonal"
          size={20}
          style={styles.iconButton}
        />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconButton: {
    marginHorizontal: 4,
  },
  accordion: {
    backgroundColor:
      Appearance.getColorScheme() === "dark" ? "#25232a" : "#f7f3f9",
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
  },
  accordionTitle: {
    paddingLeft: 0,
  },
  accordionItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});

RecipeRenderer.propTypes = {
  recipe: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        quantity: PropTypes.string,
        unit: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  handleAddToShoppingList: PropTypes.func,
  handleEditRecipe: PropTypes.func,
  handleDeleteRecipe: PropTypes.func,
  ingredientOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
};

export default RecipeRenderer;
