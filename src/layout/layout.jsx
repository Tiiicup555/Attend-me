import React, { useState, useEffect } from 'react';
import { Sidebar } from './const/sidebar'; 
import axiosInstance from '../api/api';


export const Layout = ({ children }) => {
  const [currentBoardId, setCurrentBoardId] = useState(null);

  useEffect(() => {
    async function fetchBoard() {
      try {
        const res = await axiosInstance.get('/api/boards/');
        if (res.data.length > 0) {
          setCurrentBoardId(res.data[0].id); 
        }
      } catch (err) {
        console.error('Ошибка загрузки борда:', err);
      }
    }
    fetchBoard();
  }, []);

  return (
    <div className="side-body">
      <Sidebar currentBoardId={currentBoardId}>
        {children}
      </Sidebar>
    </div>
  );
};
