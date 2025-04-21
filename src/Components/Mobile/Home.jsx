import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { List, ActivityIndicator, Text } from "react-native-paper";
import { HomeContext } from "../../HomeContext";
import { FlatList } from "react-native-web";
import TaskRenderer from "./TaskRenderer";
import dayjs from "dayjs";
import { useIsFocused } from "@react-navigation/native";

const Home = () => {
  const isFocused = useIsFocused();
  const { user, redirectToLogin, showSnackbarMessage } =
    useContext(HomeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const fetchUserTasks = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/tasks/user/${user._id}`,
        {
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
          message: "Error fetching tasks. Please try again.",
          type: "error",
        });
        return;
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showSnackbarMessage({
        message: "An error occurred while fetching tasks.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerOptions = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`, {
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error fetching users. Please try again.",
        type: "error",
      });
      return;
    }
    const data = await response.json();
    setOwnerOptions(data);
  };

  const handleDeleteTask = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "DELETE",
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error deleting task. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Task deleted successfully.",
      type: "success",
    });
    fetchUserTasks();
  };

  const handleMarkAsDone = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: true }),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error marking task as done. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Task completed successfully.",
      type: "success",
    });
    fetchUserTasks();
  };

  const handleSnoozeTask = async (id, delay) => {
    const currTask = tasks.find((task) => task._id === id);
    if (!currTask) return;
    const response = await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetDate: dayjs(currTask.targetDate)
          .add(delay, "days")
          .format("YYYY-MM-DD"),
      }),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error snoozing task. Please try again.",
        type: "error",
      });
      return;
    }
    showSnackbarMessage({
      message: "Task snoozed successfully.",
      type: "success",
    });
    fetchUserTasks();
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchUserTasks();
    fetchOwnerOptions();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <List.Accordion
        title="My Tasks"
        expanded={expanded}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskRenderer
              task={item}
              owners={item.owner?.map(
                (ownerId) =>
                  ownerOptions.find((option) => option._id === ownerId)
                    ?.username
              )}
              handleMarkAsDone={handleMarkAsDone}
              handleSnoozeTask={handleSnoozeTask}
              handleDeleteTask={handleDeleteTask}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.noTasksText}>No tasks available</Text>
          }
        />
      </List.Accordion>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#888",
  },
});

export default Home;
