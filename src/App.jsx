import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Avatar, Typography, Space } from "antd";
import { FaHome, FaList } from "react-icons/fa";
import { CiCircleList, CiShoppingCart } from "react-icons/ci";
import { Route, Routes, useNavigate } from "react-router";
import Tasks from "./Components/Desktop/Tasks";
import Login from "./Components/Desktop/Login";
import Home from "./Components/Desktop/Home";
import ShoppingList from "./Components/Desktop/Shopping";
import Recipes from "./Components/Desktop/Recipes";
import "./App.css";
import { FaPowerOff } from "react-icons/fa6";
import useNotifications from "./Components/Mobile/useNotifications";
import { HomeContext } from "./HomeContext";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

function App() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState();
  const [user, setUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const menuItems = [
    {
      key: "0",
      icon: <FaHome />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      key: "1",
      icon: <CiCircleList />,
      label: "Tasks List",
      onClick: () => navigate("/tasks"),
    },
    {
      key: "2",
      icon: <CiShoppingCart />,
      label: "Shopping List",
      onClick: () => navigate("/shopping-list"),
    },
    {
      key: "3",
      icon: <FaList />,
      label: "Recipes",
      onClick: () => navigate("/recipes"),
    },
  ];

  const redirectToLogin = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const [requestPermission] = useNotifications({
    redirectToLogin,
  });

  const onLoggedIn = (user) => {
    setUser(user);
    setCurrent();
    navigate("/");
  };

  const logout = () => {
    fetch(import.meta.env.VITE_HOST + "/users/logout", {
      method: "GET",
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    })
      .then((response) => {
        if (response.ok) {
          setUser(null);
          navigate("/login");
        } else {
          console.error("Failed to logout");
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  useEffect(() => {
    if (isAuthenticated) return;

    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_HOST}/users/check-auth`,
          {
            credentials:
              import.meta.env.VITE_ENV === "production" ? "include" : undefined,
          }
        );
        const data = await response.json();
        if (data.loggedIn) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    if (window.location.pathname !== "/login") checkAuth();
  }, [isAuthenticated]);

  return (
    <HomeContext value={{ user, redirectToLogin }}>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider
          theme="dark"
          breakpoint="lg"
          collapsedWidth="80"
          style={{
            height: "100vh",
            left: 0,
          }}
        >
          <div
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Home Dashboard
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[current]}
            onClick={(e) => setCurrent(e.key)}
            items={menuItems}
          />
        </Sider>

        {/* Main Layout */}
        <Layout>
          {user && (
            /* Header */
            <Header
              style={{
                background: "#fff",
                padding: "0 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Welcome, {user?.username || "Guest"}
              </Title>
              <Space>
                <Avatar style={{ backgroundColor: "#87d068" }}>
                  {user?.username?.charAt(0).toUpperCase() || "G"}
                </Avatar>
                <Button
                  type="primary"
                  onClick={() => requestPermission(user._id)}
                >
                  Subscribe
                </Button>
                <Button type="primary" onClick={logout} icon={<FaPowerOff />}>
                  Logout
                </Button>
              </Space>
            </Header>
          )}
          <Content
            style={{
              margin: "16px",
              padding: "24px",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Routes>
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route
                path="/login"
                element={<Login onLoggedIn={onLoggedIn} />}
              />
              <Route path="/" element={<Home user={user} />} />
            </Routes>
          </Content>
          {/* Footer */}
          <Footer
            style={{
              textAlign: "center",
              background: "#f0f2f5",
              padding: "12px 24px",
            }}
          >
            © 2025 Home Dashboard. All Rights Reserved.{" "}
            <a
              href="https://github.com/ratchet34/home/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report a Bug
            </a>
          </Footer>
        </Layout>
      </Layout>
    </HomeContext>
  );
}

export default App;
