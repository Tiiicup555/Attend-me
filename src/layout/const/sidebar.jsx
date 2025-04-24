import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeft } from "../../app/styles/icons/icons";

export const Sidebar = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem("user") || "...");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="side-body">
      <aside className="side-aside">
        <nav className="aside-nav">
          <h1 className="aside-title">NOMAD</h1>
          <hr />
          <div className="nav-btn">{username}</div>
          <Link to="/groups" className="nav-btn">Группы</Link>
        </nav>
        <div className="aside-background"></div>
        <div>
          <Button className="logout-btn" onClick={handleLogout}> 
            <ArrowLeft />
            Выход
          </Button>
        </div>
      </aside>
      <div className="side-right">{children}</div>
      <div className="circle-background1">
            <div className="circle1 circle-red-top-right1"></div>
            <div className="circle1 circle-white-overlap1"></div>
            <div className="circle1 circle-white-bottom-left1"></div>
        </div>
    </div>
  );
};
