import React, { useEffect, useState } from 'react';
import TasksList from './TasksList';
import { Spin } from 'antd';

const Home = ({ user }) => {
  const [tasks, setTasks] = useState();
  const [userOptions, setUserOptions] = useState([]);

  const getUsers = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`, {
      credentials: "include",
    });
    const data = await response.json();
    setUserOptions(data);
  };

  const getTasks = async () => {
    fetch(`${import.meta.env.VITE_HOST}/tasks/user/${user.id}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error("Error fetching user tasks:", error);
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    console.log(user)
    if (user?.id) {
      getTasks();
    }
  }, [user]);

  return (
    <div>
      <h1>Welcome Home {user?.username}</h1>
      <h2>Your Tasks</h2>
      <Spin spinning={!tasks?.length} size="large" tip="Loading tasks...">
        <TasksList tasks={tasks} getTasks={getTasks} ownerOptions={userOptions} />
      </Spin>
    </div>
  );
};

export default Home;