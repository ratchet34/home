import React, { useEffect, useState } from "react";
import { Button, Flex, Layout, Menu } from "antd";
import "./App.css";
import { FaHome, FaList } from "react-icons/fa";
import { CiCircleList, CiShoppingCart } from "react-icons/ci";
import { Route, Routes, useNavigate } from "react-router";
import Tasks from "./Components/Tasks";
import Login from "./Components/Login";
import Home from "./Components/Home";
import ShoppingList from "./Components/Shopping";
import Recipes from "./Components/Recipes";

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState();
  const [user, setUser] = useState();

  const menuItems = [
    {
      key: "1",
      icon: <CiCircleList />,
      label: <a onClick={() => navigate('/tasks')}>Tasks List</a>,
    },
    {
      key: "2",
      label: <a onClick={() => navigate('/shopping-list')}>Shopping List</a>,
      icon: <CiShoppingCart />,
    },
    {
      key: "3",
      label: <a onClick={() => navigate('/recipes')}>Recipes</a>,
      icon: <FaList />,
    },
  ];

  const onLoggedIn = (user) => {
    setUser(user);
    setCurrent();
    navigate("/");
  }

  useEffect(() => {
    if (window.location.pathname !== "/login") {
      fetch(import.meta.env.VITE_HOST + "/users/check-auth", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.loggedIn) {
            navigate("/login");
            return;
          }
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((error) => {
          console.error("Error checking authentication:", error);
          navigate("/login");
        });
    }
  }, []);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Sider>
        <Flex
          justify="center"
          align="center"
          style={{ height: "64px", marginTop: "4px" }}
        >
          <Button color="default" size="large" icon={<FaHome />} onClick={() => navigate("/")}>
            Home
          </Button>
        </Flex>
        <Menu
          theme="dark"
          defaultSelectedKeys={[]}
          mode="inline"
          items={menuItems}
          selectedKeys={[current]}
          onClick={(e) => setCurrent(e.key)}
        />
      </Sider>
      <Layout>
        {/* <Header
          style={{
            padding: 0,
          }}
        /> */}
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <div className="content-wrapper">
            <Routes>
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/login" element={<Login onLoggedIn={onLoggedIn} />} />
              <Route path="/" element={<Home user={user} />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
