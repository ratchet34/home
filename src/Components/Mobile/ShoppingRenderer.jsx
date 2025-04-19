import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";
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
  const ingredient = ingredientOptions.find(
    (ingr) => ingr._id === item.ingredient
  );
  return (
    <Card style={styles.card}>
      <Card.Title
        style={{ paddingLeft: 8 }}
        titleStyle={{ paddingRight: 8 }}
        title={
          <View style={styles.titleAndButtons}>
            <Text>
              {ingredient
                ? `${ingredient?.title} - ${item?.quantity} ${item?.unit ? item.unit : ""}`
                : "Unknown"}
            </Text>
            <View style={styles.buttonContainer}>
              <IconButton
                icon="pencil"
                mode="contained-tonal"
                size={18}
                onPress={() => {
                  setEditItemId(item._id);
                  setItemForm({
                    ingredient: item.ingredient,
                    quantity: item.quantity.toString(),
                    location: item.location,
                  });
                  setIsDialogVisible(true);
                }}
                style={styles.iconButton}
              />
              <IconButton
                icon="delete"
                mode="contained-tonal"
                size={18}
                onPress={() => handleDeleteItem(item._id)}
                style={styles.iconButton}
              />
            </View>
          </View>
        }
      />
      {item.location && item.location.length > 0 && (
        <Card.Content style={styles.content}>
          <View style={styles.chipContainer}>
            {item.location.map((locId) => (
              <Chip key={locId}>
                {locationOptions.find((loc) => loc._id === locId)?.title ||
                  "Unknown"}
              </Chip>
            ))}
          </View>
        </Card.Content>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
  },
  titleAndButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flexShrink: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    marginRight: 0,
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
