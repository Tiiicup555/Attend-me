import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { ArrowRight, KeyPassword, UserProfile } from '../../../app/styles/icons/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const LoginAntd = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://193.46.198.101/api/token/', {
        username: values.username,
        password: values.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const token = response.data.access;
      localStorage.setItem('accessToken', token);

      const userInfo = await axios.get('http://193.46.198.101/api/teachers/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const user = userInfo.data.find(u => u.username === values.username);
      if (user) {
        const fullName = `${user.first_name} ${user.last_name}`;
        localStorage.setItem('user', fullName);
      }
  
      navigate('/home');
    } catch (error) {
      console.error(error);
      message.error('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      className="login-form"
      name="basic"
      labelCol={{ span: 24 }}
      autoComplete="off"
      labelAlign="top"
      requiredMark={false}
      onFinish={onFinish}
    >
      <Form.Item
        className="login-form-item"
        label="Логин"
        name="username"
        rules={[{ required: true, message: 'Введите логин!' }]}
      >
        <Input
          className="login-input"
          placeholder="Введите username"
          prefix={<UserProfile />}
        />
      </Form.Item>

      <Form.Item
        className="login-form-item"
        label="Пароль"
        name="password"
        rules={[{ required: true, message: 'Введите пароль!' }]}
      >
        <Input.Password
          className="login-input"
          placeholder="Введите пароль"
          prefix={<KeyPassword />}
        />
      </Form.Item>

      <div className="login-choose">
        <Form.Item label={null}>
          <Button className="login-btn" type="primary" htmlType="submit">
            Войти
            <ArrowRight />
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export const LoginPage = () => {
  return (
    <div>
        <div className="container">
          <p className="title-1">NOMAD</p>
        </div>
        <div className="login">
            <h1 className="title">Вход</h1>
            <LoginAntd />
        </div>
        <div className="circle-background">
            <div className="circle circle-red-top-right"></div>
            <div className="circle circle-white-overlap"></div>
            <div className="circle circle-white-bottom-left"></div>
        </div>
    </div>
  );
};
