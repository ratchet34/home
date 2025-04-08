import React from 'react';
import dayjs from "dayjs";
import { Button, Card, Empty, Flex, Tag, Tooltip } from 'antd';
import { IoMdTrash } from 'react-icons/io';
import { IoAlarmSharp } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';

const TasksList = ({ tasks, getTasks, setEditTaskId, ownerOptions }) => {
  const markTaskAsDone = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: true }),
    }).then(() => {
      getTasks();
    });
  };

  const snoozeTask = (id, delay) => {
    fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetDate: dayjs().add(delay, "days").format("YYYY-MM-DD") }),
    }).then(() => {
      getTasks();
    });
  };

  const removeTask = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "DELETE",
    }).then(() => {
      getTasks();
    });
  };

  if (!tasks) return <Empty />;

  return (
    <Flex vertical gap="small">
        {tasks.filter(Boolean).sort((a, b) => a.targetDate > b.targetDate).map((task) => (
          <Card
            key={task?._id}
            title={task?.title}
            extra={
              <Flex gap="small">
              <Tooltip title="Remove task">
                <Button size="small" onClick={() => removeTask(task?._id)} icon={<IoMdTrash />} />
              </Tooltip>
              <Tooltip title="Snooze 1 day">
                <Button size="small" onClick={() => snoozeTask(task?._id, 1)} icon={<IoAlarmSharp />} />
              </Tooltip>
              {setEditTaskId && <Tooltip title="Edit task">
                <Button size="small" onClick={() => setEditTaskId(task?._id)} icon={<MdEdit />} />
              </Tooltip>}
              <Tooltip title="Mark as Done">
                <Button size="small" onClick={() => markTaskAsDone(task?._id)} icon={<FaCheck />} />
              </Tooltip>
              </Flex>
            }
            size="small"
          >
            <Flex vertical gap="small">
              <span>
                <strong>Description:</strong> {task?.description}
              </span>
              <Flex>
                <span style={{ flexGrow: 1, maxWidth: "50%" }}>
                  <strong>Owner:</strong>{" "}
                  {task?.owner?.map((o, i) => (
                    <Tag color="blue" key={i}>
                      {ownerOptions?.find((oop) => oop._id === o)?.username}
                    </Tag>
                  ))}
                </span>
                <span style={{ flexGrow: 1, maxWidth: "50%" }}>
                  <strong>Target Date:</strong> {task?.targetDate}
                </span>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
  );
};

export default TasksList;