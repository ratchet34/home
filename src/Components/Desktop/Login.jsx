import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Input, Button, Checkbox } from "antd";

const Login = ({ onLoggedIn }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    console.log("Success:", values);
    // Simulate login process
    fetch(`${import.meta.env.VITE_HOST}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
      credentials:
        import.meta.env.VITE_ENV === "production" ? "include" : undefined,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Login successful");
        onLoggedIn(data);
        // Handle successful login (e.g., save token, redirect)
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
Login.propTypes = {
  onLoggedIn: PropTypes.func.isRequired,
};

export default Login;
