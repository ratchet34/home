import React, { useContext, useEffect, useState } from "react";
import TasksList from "./TasksList";
import { Spin } from "antd";
import { HomeContext } from "../../HomeContext";

const Home = () => {
  const { user, redirectToLogin } = useContext(HomeContext);
  const [tasks, setTasks] = useState();
  const [userOptions, setUserOptions] = useState([]);

  const getUsers = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/users`, {
      // credentials: import.meta.env.VITE_ENV === 'production' ? 'include' : undefined,
    });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
    const data = await response.json();
    setUserOptions(data);
  };

  const getTasks = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/tasks/user/${user.id}`,
      {
        credentials:
          import.meta.env.VITE_ENV === "production" ? "include" : undefined,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error("Error fetching user tasks:", error);
      });
    if (response.status === 401) {
      redirectToLogin();
      return;
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getTasks();
    }
  }, [user]);

  return (
    <div>
      <h2>Your Tasks</h2>
      <Spin spinning={!tasks?.length} size="large" tip="Loading tasks...">
        <TasksList
          tasks={tasks}
          getTasks={getTasks}
          ownerOptions={userOptions}
        />
      </Spin>
    </div>
  );
};

export default Home;
