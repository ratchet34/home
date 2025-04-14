import React, { useState, useEffect } from "react";
import { StyleSheet, Appearance } from "react-native";
import { Button, Dialog, FAB, Portal, TextInput } from "react-native-paper";
import { FaPlus } from "react-icons/fa";
import dayjs from "dayjs";
import { DatePickerInput } from "react-native-paper-dates";
import { PaperSelect } from "react-native-paper-select";
import { FlatList, View } from "react-native-web";
import TaskRenderer from "./TaskRenderer";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    owner: undefined,
  });
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  // const [menuVisible, setMenuVisible] = useState(false);

  const fetchTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/tasks`, {
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    const data = await response.json();
    setTasks(data);
  };

  const fetchOwnerOptions = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`, {
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    const data = await response.json();
    setOwnerOptions(data);
  };

  const handleSaveTask = async () => {
    const method = editTaskId ? "PATCH" : "PUT";
    const url = editTaskId
      ? `${import.meta.env.VITE_HOST}/task/${editTaskId}`
      : `${import.meta.env.VITE_HOST}/task`;
    const task = {
      ...taskForm,
      owner: taskForm?.owner?.map((item) => item._id),
    };

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });

    setIsDialogVisible(false);
    setTaskForm({ title: "", description: "", targetDate: "", owner: [] });
    setEditTaskId(null);
    fetchTasks();
  };

  const handleDeleteTask = async (id) => {
    await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "DELETE",
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    fetchTasks();
  };

  const handleMarkAsDone = async (id) => {
    await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: true }),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    });
    fetchTasks();
  };

  const handleSnoozeTask = async (id, delay) => {
    await fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
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
            ownerOptions={ownerOptions}
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
            />
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
              />
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
              />
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
