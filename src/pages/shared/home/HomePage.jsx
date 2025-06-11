import React, { useEffect } from "react";
import { Layout } from "../../../layout/layout";
import { useNavigate } from "react-router-dom";


export const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="home-body">
          <h1 className="home-title">Добро Пожаловать!</h1>
      </div>
    </Layout>
  );
};
