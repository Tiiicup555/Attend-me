import './styles/index.scss';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/shared/home/HomePage';
import { LoginPage } from '../pages/shared/login/LoginPage';
import { GroupsPage } from '../pages/shared/groups';
import { BoardPage } from '../pages/shared/boards/BoardsPage';



export default function App() {
  return (
      <Routes>
        <Route path='/' element={<LoginPage/>} />
        <Route path='/home' element={<HomePage/>} />
        <Route path='/groups' element={<GroupsPage/>} />
        <Route path='/board/:id' element={<BoardPage/>} />
      </Routes>
  );
}
