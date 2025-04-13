import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Dialog,
  FAB,
  Portal,
  TextInput,
  IconButton,
  Paragraph,
  Chip,
  Text,
} from "react-native-paper";
import {
  FaCheck,
  FaClock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import dayjs from "dayjs";
import { DatePickerInput, DatePickerModal } from "react-native-paper-dates";

const Tasks = () => {
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

  const fetchTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/tasks`, {
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    });
    const data = await response.json();
    setTasks(data);
  };

  const fetchOwnerOptions = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`, {
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    });
    const data = await response.json();
    setOwnerOptions(data);
  };

  const handleSaveTask = async () => {
    const method = editTaskId ? "PATCH" : "PUT";
    const url = editTaskId
      ? `${import.meta.env.VITE_HOST}/task/${editTaskId}`
      : `${import.meta.env.VITE_HOST}/task`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskForm),
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
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
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
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
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
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
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    fetchOwnerOptions();
  }, []);

  return (
    <View style={styles.container}>
      {tasks.map((task) => (
        <Card key={task._id} style={styles.card}>
          <Card.Title title={task.title} />
          <Card.Content>
            <Paragraph>{task.description}</Paragraph>
            <View style={styles.col}>
              <Chip icon={() => <FaCalendarAlt />}>{task.targetDate}</Chip>
              <Chip icon={() => <FaUser />}>
                {task.owner
                  ?.map(
                    (ownerId) =>
                      ownerOptions.find((option) => option._id === ownerId)
                        ?.username
                  )
                  .join(", ")}
              </Chip>
            </View>
          </Card.Content>
          <Card.Actions>
            <IconButton
              icon={() => <FaCheck />}
              onPress={() => handleMarkAsDone(task._id)}
            />
            <IconButton
              icon={() => <FaClock />}
              onPress={() => handleSnoozeTask(task._id, 1)}
            />
            <IconButton
              icon={() => <FaEdit />}
              onPress={() => {
                setEditTaskId(task._id);
                setTaskForm({
                  title: task.title,
                  description: task.description,
                  targetDate: task.targetDate,
                  owner: task.owner,
                });
                setIsDialogVisible(true);
              }}
            />
            <IconButton
              icon={() => <FaTrash />}
              onPress={() => handleDeleteTask(task._id)}
            />
          </Card.Actions>
        </Card>
      ))}

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
              <TextInput
                label="Owner"
                value={taskForm.owner.join(", ")}
                onChangeText={(text) =>
                  setTaskForm({
                    ...taskForm,
                    owner: text.split(",").map((owner) => owner.trim()),
                  })
                }
                placeholder="Enter owner IDs separated by commas"
              />
            </View>
            <View style={styles.input}>
              <Text style={{ marginBottom: 8 }}>Target Date</Text>
              <DatePickerInput
                locale="en"
                mode="single"
                visible={isDatePickerVisible}
                onDismiss={() => setIsDatePickerVisible(false)}
                date={taskForm.targetDate}
                onConfirm={(params) => {
                  setTaskForm({
                    ...taskForm,
                    targetDate: dayjs(params.date).format("YYYY-MM-DD"),
                  });
                  setIsDatePickerVisible(false);
                }}
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
    padding: 8,
    flexDirection: "column",
    width: "100%",
  },
  card: {
    flexGrow: 1,
    alignSelf: "stretch",
  },
  col: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 8,
    gap: ".25em",
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
