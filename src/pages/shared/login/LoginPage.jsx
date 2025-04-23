import React from 'react';
import { Button, Form, Input } from 'antd';
import { ArrowRight, KeyPassword, UserProfile } from '../../../app/styles/icons/icons';

const LoginAntd = () => {

  return (
    <Form
      className="login-form"
      name="basic"
      labelCol={{ span: 24 }}
      autoComplete="off"
      labelAlign="top"
      requiredMark={false}
    >
      <Form.Item
        className="login-form-item"
        label="Логин"
        name="username"
        rules={[{ required: true, message: 'Введите логин!' }]}
      >
        <Input
          className="login-input"
          placeholder="Введите номер телефона или почту"
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
