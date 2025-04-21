import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import IngredientsScreen from "./Admin/IngredientsScreen";
import LocationsScreen from "./Admin/LocationsScreen";
import { View } from "react-native-web";
import { List } from "react-native-paper";

const Stack = createStackNavigator();

const AdminHomeScreen = () => {
  const navigation = useNavigation();
  return (
    <List.Section>
      <List.Subheader>Manage items</List.Subheader>
      <List.Item
        title="Manage Ingredients"
        onPress={() => navigation.navigate("Admin", { screen: "Ingredients" })}
        left={(props) => <List.Icon {...props} icon="food" />}
      />
      <List.Item
        title="Manage Locations"
        onPress={() => navigation.navigate("Admin", { screen: "Locations" })}
        left={(props) => <List.Icon {...props} icon="map" />}
      />
    </List.Section>
  );
};

const Admin = () => {
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <Stack.Navigator initialRouteName="AdminHome">
        <Stack.Screen
          name="AdminHome"
          component={AdminHomeScreen}
          options={{ title: "Admin Home" }}
        />
        <Stack.Screen
          name="Ingredients"
          component={IngredientsScreen}
          options={{ title: "Manage Ingredients" }}
        />
        <Stack.Screen
          name="Locations"
          component={LocationsScreen}
          options={{ title: "Manage Locations" }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default Admin;
