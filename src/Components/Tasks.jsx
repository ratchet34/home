import React, { useEffect, useState } from "react";
import { Button, Flex, Spin, Tooltip, Typography } from "antd";
import { FaPlus } from "react-icons/fa";
import { Modal, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import TasksList from "./TasksList";

const Tasks = () => {
  const [tasks, setTasks] = useState();
  const [editTaskId, setEditTaskId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState([]);
  const [targetDate, setTargetDate] = useState(null);
  const [ownerOptions, setOwnerOptions] = useState();

  const addTask = (task) => {
    fetch(`${import.meta.env.VITE_HOST}/task`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    }).then(() => {
      getTasks();
    });
  };

  const editTask = (id, task) => {
    fetch(`${import.meta.env.VITE_HOST}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    }).then(() => {
      getTasks();
    });
  };



  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (title.trim() && description.trim() && owner.length > 0 && targetDate) {
      const newTask = {
        title,
        description,
        owner,
        targetDate: targetDate.format("YYYY-MM-DD"),
      };
      if (editTaskId) {
        editTask(editTaskId, newTask);
        setEditTaskId(null);
      }
      else addTask(newTask);
      setTitle("");
      setDescription("");
      setOwner([]);
      setTargetDate(null);
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getUsers = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`);
    if (!response.ok) {
      console.error("Error fetching users");
      return;
    }
    const data = await response.json();
    setOwnerOptions(data);
  };

  const getTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/tasks`);
    if (!response.ok) {
      console.error("Error fetching tasks");
      return;
    }
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    if (editTaskId) {
      const task = tasks.find((t) => t._id === editTaskId);
      setTitle(task.title);
      setDescription(task.description);
      setOwner(task.owner);
      setTargetDate(dayjs(task.targetDate));
      setIsModalVisible(true);
    }
  }, [editTaskId]);

  useEffect(() => {
    getUsers();
    getTasks();
  }, []);

  return (
    <Flex vertical gap="small">
      <Flex align="center" justify="space-between">
        <Typography.Title
          level={2}
          style={{
            margin: 0,
          }}
        >
          To-Do List
        </Typography.Title>
        <Tooltip title="Add new task">
          <Button onClick={showModal} icon={<FaPlus />} shape="circle" />
        </Tooltip>
      </Flex>
      <Modal
        title="Add New Task"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Owner"
          value={owner}
          onChange={(value) => setOwner(value)}
          style={{ marginBottom: "10px", width: "100%" }}
        >
          {ownerOptions?.map((option) => (
            <Select.Option key={option._id} value={option._id}>
              {option.username}
            </Select.Option>
          ))}
        </Select>
        <DatePicker
          placeholder="Target Date"
          value={targetDate}
          onChange={(date) => setTargetDate(date)}
          style={{ width: "100%" }}
        />
      </Modal>
      <Spin spinning={!tasks?.length} size="large" tip="Loading tasks...">
        <TasksList tasks={tasks} getTasks={getTasks} setEditTaskId={setEditTaskId} ownerOptions={ownerOptions} />
      </Spin>
    </Flex>
  );
};

export default Tasks;
