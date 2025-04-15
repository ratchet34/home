import React, { useState, useEffect } from "react";
import { View, StyleSheet, Appearance, Platform } from "react-native";
import {
  Appbar,
  Drawer,
  PaperProvider,
  Snackbar,
  Text,
} from "react-native-paper";
import PropTypes from "prop-types";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import { IconContext } from "react-icons";
import { FaBars, FaBook, FaListCheck, FaPowerOff } from "react-icons/fa6";
import Tasks from "./Components/Mobile/Tasks";
import Login from "./Components/Mobile/Login";
import { HomeContext } from "./HomeContext";
import Shopping from "./Components/Mobile/Shopping";
import useNotifications from "./Components/Mobile/useNotifications";

const HomeScreen = () => (
  <View style={styles.content}>
    <Text>Welcome to the Home Screen!</Text>
  </View>
);

const TasksScreen = () => (
  <View style={styles.content} id="tasks-screen">
    <Tasks />
  </View>
);

const ShoppingScreen = () => (
  <View style={styles.content}>
    <Shopping />
  </View>
);

const RecipesScreen = () => (
  <View style={styles.content}>
    <Text>Find your favorite recipes here.</Text>
  </View>
);

const CustomDrawerContent = ({ navigation, state }) => {
  const active = state.routeNames[state.index];
  return (
    <Drawer.Section title="Navigation" style={styles.drawer}>
      <Drawer.Item
        label="Home"
        icon={() => <FaHome />}
        active={active === "Home"}
        onPress={() => navigation.navigate("Home")}
      />
      <Drawer.Item
        label="Tasks"
        icon={() => <FaListCheck />}
        active={active === "Tasks"}
        onPress={() => navigation.navigate("Tasks")}
      />
      <Drawer.Item
        label="Shopping"
        icon={() => <FaShoppingCart />}
        active={active === "Shopping"}
        onPress={() => navigation.navigate("Shopping")}
      />
      <Drawer.Item
        label="Recipes"
        icon={() => <FaBook />}
        active={active === "Recipes"}
        onPress={() => navigation.navigate("Recipes")}
      />
    </Drawer.Section>
  );
};

CustomDrawerContent.propTypes = {
  navigation: PropTypes.object.isRequired,
  state: PropTypes.shape({
    routeNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    index: PropTypes.number.isRequired,
  }).isRequired,
};

const DrawerNavigator = createDrawerNavigator();

const MobileApp = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");

  const [permissionRequested, setPermissionRequested] = useState(false);

  const redirectToLogin = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const showSnackbarMessage = ({ message, type }) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setIsSnackbarVisible(true);
  };

  const [requestPermission] = useNotifications({
    redirectToLogin,
    showSnackbarMessage,
  });

  const onLoggedIn = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_HOST}/users/logout`, {
        method: "GET",
        credentials:
          import.meta.env.VITE_ENV === "production" ? "include" : undefined,
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (permissionRequested === false) {
        requestPermission(user._id);
        setPermissionRequested(true);
      }
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_HOST}/users/check-auth`,
          {
            credentials:
              import.meta.env.VITE_ENV === "production" ? "include" : undefined,
          }
        );
        const data = await response.json();
        if (data.loggedIn) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log("User not authenticated, showing login screen.");
    return (
      <PaperProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <Login onLoggedIn={onLoggedIn} />
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <React.Fragment>
        {Platform.OS === "web" ? (
          <style type="text/css">{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url('/fonts/MaterialCommunityIcons.ttf') format('truetype');
        }
      `}</style>
        ) : null}
        <IconContext.Provider
          value={{
            color: Appearance.getColorScheme() === "dark" ? "#fff" : "#000",
            size: "1.5em",
          }}
        >
          <HomeContext value={{ user, redirectToLogin, showSnackbarMessage }}>
            <SafeAreaProvider>
              <SafeAreaView style={styles.safeArea}>
                <View style={{ height: "100dvh" }}>
                  <NavigationContainer>
                    <DrawerNavigator.Navigator
                      initialRouteName="Home"
                      drawerContent={(props) => (
                        <CustomDrawerContent {...props} />
                      )}
                      screenOptions={{
                        header: ({ navigation }) => (
                          <Appbar.Header>
                            <Appbar.Action
                              icon={() => <FaBars />}
                              onPress={() => navigation.toggleDrawer()}
                            />
                            <Appbar.Content title="Home Dashboard" />
                            <Appbar.Action
                              icon={() => <FaPowerOff />}
                              onPress={logout}
                            />
                          </Appbar.Header>
                        ),
                      }}
                    >
                      <DrawerNavigator.Screen
                        name="Home"
                        component={HomeScreen}
                      />
                      <DrawerNavigator.Screen
                        name="Tasks"
                        component={TasksScreen}
                      />
                      <DrawerNavigator.Screen
                        name="Shopping"
                        component={ShoppingScreen}
                      />
                      <DrawerNavigator.Screen
                        name="Recipes"
                        component={RecipesScreen}
                      />
                    </DrawerNavigator.Navigator>
                  </NavigationContainer>
                  <Snackbar
                    visible={isSnackbarVisible}
                    onDismiss={() => setIsSnackbarVisible(false)}
                    duration={3000}
                    icon="close"
                    onIconPress={() => setIsSnackbarVisible(false)}
                    style={styles.snackbar[snackbarType]}
                  >
                    {snackbarMessage}
                  </Snackbar>
                </View>
              </SafeAreaView>
            </SafeAreaProvider>
          </HomeContext>
        </IconContext.Provider>
      </React.Fragment>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Appearance.getColorScheme() === "dark" ? "#333" : "#fff",
    height: "100vh",
  },
  content: {
    backgroundColor: Appearance.getColorScheme() === "dark" ? "#333" : "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    height: "100%",
  },
  drawer: {
    backgroundColor: Appearance.getColorScheme() === "dark" ? "#333" : "#fff",
    height: "100%",
  },
  snackbar: {
    error: {
      backgroundColor: "#F44336",
    },
    success: {
      backgroundColor: "#4CAF50",
    },
    warning: {
      backgroundColor: "#FF9800",
    },
    info: {
      backgroundColor:
        Appearance.getColorScheme() === "dark" ? "#BB86FC" : "#313033",
    },
  },
});

export default MobileApp;
