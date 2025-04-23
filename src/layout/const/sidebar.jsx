import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeft } from "../../app/styles/icons/icons";

export const Sidebar = ({ children }) => { 
  const [username, setUsername] = useState("...");

  useEffect(() => {
    axios.get("api")
      .then((res) => {
        setUsername(res.data.name);
      })
      .catch(() => {
        setUsername("Пользователь");
      });
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");  
    navigate("/login"); 
  };

  return (
    <div className="side-body">
      <aside className="side-aside">
        <nav className="aside-nav">
          <h1 className="aside-title">NOMAD</h1>
          <hr />
          <Link to="/" className="nav-btn">{username}</Link>
          <Link to="/schedule" className="nav-btn">Расписание</Link>
          <Link to="/groups" className="nav-btn">Группы</Link>
        </nav>
        <div className="aside-background"></div>
        <div>
          <Button className="logout-btn" onClick={handleLogout}> 
              <ArrowLeft/>
              Выход
          </Button>
        </div>
      </aside>
      <div className="side-right">{children}</div>
    </div>
  );
};
