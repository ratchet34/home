import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Appearance } from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  TextInput,
  HelperText,
} from "react-native-paper";
import { FaPlus } from "react-icons/fa";
import dayjs from "dayjs";
import { DatePickerInput } from "react-native-paper-dates";
import { PaperSelect } from "react-native-paper-select";
import { FlatList, View } from "react-native-web";
import TaskRenderer from "./TaskRenderer";
import { HomeContext } from "../../HomeContext";

const Tasks = () => {
  const { redirectToLogin, showSnackbarMessage } = useContext(HomeContext);
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    owner: [],
  });
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/tasks`, {
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
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

  const validateForm = () => {
    const newErrors = {};
    if (!taskForm.title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!taskForm.owner || taskForm.owner.length === 0) {
      newErrors.owner = "At least one owner is required.";
    }
    if (!taskForm.targetDate) {
      newErrors.targetDate = "Target date is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTask = async () => {
    if (!validateForm()) {
      return;
    }

    const method = editTaskId ? "PATCH" : "PUT";
    const url = editTaskId
      ? `${import.meta.env.VITE_HOST}/task/${editTaskId}`
      : `${import.meta.env.VITE_HOST}/task`;
    const task = {
      ...taskForm,
      owner: taskForm?.owner?.map((item) => item._id),
    };

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    if (!response.ok) {
      showSnackbarMessage({
        message: "Error saving task. Please try again.",
        type: "error",
      });
      return;
    }

    setIsDialogVisible(false);
    setTaskForm({ title: "", description: "", targetDate: "", owner: [] });
    setEditTaskId(null);
    fetchTasks();
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
    fetchTasks();
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
    fetchTasks();
  };

  const handleSnoozeTask = async (id, delay) => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetDate: dayjs().add(delay, "days").format("YYYY-MM-DD"),
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
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    fetchOwnerOptions();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskRenderer
            task={item}
            owners={item.owner?.map(
              (ownerId) =>
                ownerOptions.find((option) => option._id === ownerId)?.username
            )}
            handleMarkAsDone={handleMarkAsDone}
            handleSnoozeTask={handleSnoozeTask}
            handleDeleteTask={handleDeleteTask}
            setEditTaskId={setEditTaskId}
            setTaskForm={setTaskForm}
            setIsDialogVisible={setIsDialogVisible}
          />
        )}
      />
      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon={() => <FaPlus />}
        onPress={() => {
          setEditTaskId(null);
          setTaskForm({
            title: "",
            description: "",
            targetDate: "",
            owner: [],
          });
          setErrors({});
          setIsDialogVisible(true);
        }}
      />

      {/* Task Dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>{editTaskId ? "Edit Task" : "New Task"}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({ ...taskForm, title: text })}
              style={styles.input}
              error={!!errors.title}
            />
            {errors.title && (
              <HelperText type="error">{errors.title}</HelperText>
            )}

            <TextInput
              label="Description"
              value={taskForm.description}
              onChangeText={(text) =>
                setTaskForm({ ...taskForm, description: text })
              }
              style={styles.input}
            />

            <View style={styles.input}>
              <PaperSelect
                id="owner-select"
                label="Owner"
                value={taskForm?.owner?.map((item) => item.value)}
                onSelection={(value) =>
                  setTaskForm({
                    ...taskForm,
                    owner: value.selectedList,
                  })
                }
                arrayList={ownerOptions.map((option) => ({
                  value: option.username,
                  _id: option._id,
                }))}
                selectedArrayList={taskForm?.owner}
                multiEnable={true}
                error={!!errors.owner}
                containerStyle={{ marginBottom: 0 }}
              />
              {errors.owner && (
                <HelperText type="error">{errors.owner}</HelperText>
              )}
            </View>

            <View style={styles.input}>
              <DatePickerInput
                label="Target Date"
                locale="fr"
                mode="single"
                visible={isDatePickerVisible}
                onDismiss={() => setIsDatePickerVisible(false)}
                value={taskForm.targetDate}
                onChange={(date) => {
                  setTaskForm({
                    ...taskForm,
                    targetDate: date,
                  });
                  setIsDatePickerVisible(false);
                }}
                theme={Appearance.getColorScheme()}
                error={!!errors.targetDate}
              />
              {errors.targetDate && (
                <HelperText type="error">{errors.targetDate}</HelperText>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveTask}>Save</Button>
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
  },
  fab: {
    position: "fixed",
    right: 16,
    bottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default Tasks;
