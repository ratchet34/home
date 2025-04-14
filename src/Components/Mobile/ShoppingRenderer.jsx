import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Chip, IconButton } from "react-native-paper";
import { View } from "react-native-web";

const ShoppingRenderer = ({
  item,
  ingredientOptions,
  locationOptions,
  setEditItemId,
  setItemForm,
  setIsDialogVisible,
  handleDeleteItem,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={
          ingredientOptions.find((ingr) => ingr._id === item.ingredient)
            ?.title || "Unknown"
        }
        subtitle={`Quantity: ${item.quantity}`}
      />
      <Card.Content>
        <View style={styles.chipContainer}>
          {item.location.map((locId) => (
            <Chip key={locId}>
              {locationOptions.find((loc) => loc._id === locId)?.title ||
                "Unknown"}
            </Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="pencil"
          onPress={() => {
            setEditItemId(item._id);
            setItemForm({
              ingredient: item.ingredient,
              quantity: item.quantity.toString(),
              location: item.location,
            });
            setIsDialogVisible(true);
          }}
        />
        <IconButton icon="delete" onPress={() => handleDeleteItem(item._id)} />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

ShoppingRenderer.propTypes = {
  item: PropTypes.object.isRequired,
  ingredientOptions: PropTypes.array.isRequired,
  locationOptions: PropTypes.array.isRequired,
  setEditItemId: PropTypes.func.isRequired,
  setItemForm: PropTypes.func.isRequired,
  setIsDialogVisible: PropTypes.func.isRequired,
  handleDeleteItem: PropTypes.func.isRequired,
};

export default ShoppingRenderer;
