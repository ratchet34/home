import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { FaCalendarAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { Card, Chip, Icon, IconButton, Paragraph } from "react-native-paper";
import { View } from "react-native-web";
import dayjs from "dayjs";

const TaskRenderer = ({
  task,
  owners,
  handleMarkAsDone,
  handleSnoozeTask,
  handleDeleteTask,
  setEditTaskId,
  setTaskForm,
  setIsDialogVisible,
}) => {
  return (
    <Card key={task._id} style={styles.card}>
      <Card.Title title={task.title} />
      <Card.Content>
        <Paragraph>{task.description}</Paragraph>
        <View style={styles.col}>
          <Chip
            icon={() => (
              <Icon source="calendar" mode="contained-tonal" size={20} />
            )}
          >
            {dayjs(task.targetDate).format("D MMMM, YYYY")}
          </Chip>
          <Chip
            icon={() => (
              <Icon source="account" mode="contained-tonal" size={20} />
            )}
          >
            {owners?.join(", ")}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions} id="task-actions">
        <IconButton
          icon="trash-can-outline"
          size={20}
          onPress={() => handleDeleteTask(task._id)}
          mode="contained-tonal"
        />
        <IconButton
          icon="note-edit-outline"
          size={20}
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
          mode="contained-tonal"
        />
        <IconButton
          icon="clock-outline"
          size={20}
          onPress={() => handleSnoozeTask(task._id, 1)}
          mode="contained-tonal"
        />
        <IconButton
          icon="check"
          size={20}
          onPress={() => handleMarkAsDone(task._id)}
          mode="contained-tonal"
        />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    alignSelf: "stretch",
    marginVertical: ".5em",
    marginHorizontal: 2,
  },
  col: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 8,
    gap: ".25em",
  },
  actions: {
    flexDirection: "row-reverse",
  },
});

TaskRenderer.propTypes = {
  task: PropTypes.object.isRequired,
  owners: PropTypes.array.isRequired,
  handleMarkAsDone: PropTypes.func.isRequired,
  handleSnoozeTask: PropTypes.func.isRequired,
  handleDeleteTask: PropTypes.func.isRequired,
  setEditTaskId: PropTypes.func.isRequired,
  setTaskForm: PropTypes.func.isRequired,
  setIsDialogVisible: PropTypes.func.isRequired,
};

export default TaskRenderer;
