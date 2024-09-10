import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Checkbox, Form, Input } from "antd";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const endpoint = isRegister ? "/api/register" : "/api/login";
    const bodyData = { username, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        if (isRegister) {
          setIsRegister(false); // 注册成功后转为登录模式
          alert("Registration successful, please log in.");
        } else {
          localStorage.setItem("token", data.token);
          console.log("Token stored:", data.token);
          router.push("/"); // 登录成功后重定向到主页
        }
      } else {
        const errorMsg = await response.json();
        console.error("Authentication failed:", errorMsg.message);
        alert(`Error: ${errorMsg.message}`); // 显示后端返回的错误信息
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("An error occurred. Please try again.");
    }
  };
  const onFinish = (values) => {
    console.log("Success:", values);
    setUsername(values.username);
    setPassword(values.password);
    handleSubmit();
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginRight: 25,
          }}
        >
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
            style={{ marginRight: 40 }}
          >
            <Button type="primary" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Switch to Login" : "Switch to Register"}
            </Button>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
