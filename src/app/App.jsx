import './styles/index.scss';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/shared/home/HomePage';
import { LoginPage } from '../pages/shared/login/LoginPage';
import { GroupsPage } from '../pages/shared/groups';
import { BoardPage } from '../pages/shared/boards/BoardsPage';
import { PrivateRoute } from '../layout/const/privat';
import { ProfilePage } from '../pages/shared/profile/ProfilePage';
import { TeachersPage } from '../pages/shared/teachers/TeachersPage';
import { StatsPage } from '../pages/shared/stats/StatsPage';



export default function App() {
  return (
      <Routes>
        <Route path='/' element={<LoginPage/>} />
        <Route path="/home" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />

        <Route path="/groups" element={
          <PrivateRoute>
            <GroupsPage />
          </PrivateRoute>
        } />

        <Route path="/board/:id" element={
          <PrivateRoute>
            <BoardPage />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />

        <Route path="/teachers" element={
          <PrivateRoute>
            <TeachersPage />
          </PrivateRoute>
        } />

        <Route path="/stats/:id" element={
            <StatsPage />
        } />
      </Routes>
  );
}
