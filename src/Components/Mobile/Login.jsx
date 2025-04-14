import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Checkbox, Text, Card } from "react-native-paper";

const Login = ({ onLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials:
          import.meta.env.VITE_ENV === "production" ? "include" : undefined,
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful");
      onLoggedIn(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Login" titleStyle={styles.title} />
        <Card.Content>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={remember ? "checked" : "unchecked"}
              onPress={() => setRemember(!remember)}
            />
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Log in
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
  },
});
Login.propTypes = {
  onLoggedIn: PropTypes.func.isRequired,
};

export default Login;
