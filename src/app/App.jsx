import './styles/index.scss';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/shared/home/HomePage';
import { LoginPage } from '../pages/shared/login/LoginPage';



export default function App() {
  return (
      <Routes>
        <Route path='/' element={<LoginPage/>} />
        <Route path='/home' element={<HomePage/>} />
      </Routes>
  );
}
