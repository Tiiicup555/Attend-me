import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/api";
import { Layout } from "../../../layout/layout";
import { Card, Avatar, Typography, Button, Modal, Input, message } from "antd";

const { Title, Text } = Typography;

export const TeachersPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: "",
    email: "",
    position: "",
    description: "",
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await axiosInstance.get(`/api/profiles/`);
        setProfiles(res.data);
      } catch (error) {
        message.error("Ошибка при загрузке профилей учителей");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setEditForm({
      phone: profile.phone || "",
      email: profile.email || "",
      position: profile.position || "",
      description: profile.description || "",
    });
    setModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!editingProfile) return;
    try {
      await axiosInstance.patch(`/api/profiles/${editingProfile.id}/`, editForm);
      message.success("Профиль обновлен");

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editingProfile.id
            ? { ...p, ...editForm }
            : p
        )
      );

      setModalVisible(false);
      setEditingProfile(null);
    } catch (error) {
      message.error("Ошибка при обновлении профиля");
      console.error(error.response?.data || error);
    }
  };

  return (
    <Layout>
      <div className="teachers-list" style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
        <Title level={2} style={{ textAlign: "center" }}>Учителя</Title>
        {profiles.length === 0 && <Text>Профили учителей не найдены</Text>}
        {profiles.map((profile) => (
          <Card
            className="t-card"
            key={profile.id}
            style={{ marginBottom: 20 }}
            hoverable
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar
                size={80}
                src={profile.avatar}
                alt={`${profile.user.first_name} ${profile.user.last_name}`}
              />
              <div style={{ marginLeft: 20, flex: 1 }}>
                <Title level={4} style={{ marginBottom: 0 }}>
                  {profile.user.first_name} {profile.user.last_name}
                </Title>
                <Text><b>Телефон:</b> {profile.phone || "не указан"}</Text><br />
                <Text><b>Email:</b> {profile.email || "не указан"}</Text><br />
                <Text><b>Должность:</b> {profile.position || "не указана"}</Text>
              </div>
              <Button className="p-btn" type="primary" onClick={() => openEditModal(profile)}>
                Редактировать
              </Button>
            </div>
          </Card>
        ))}

        <Modal
          title={`Редактировать профиль: ${editingProfile ? editingProfile.user.first_name : ""}`}
          visible={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          okText="Сохранить"
          cancelText="Отмена"
        >
          <label>Телефон:</label>
          <Input
            value={editForm.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            style={{ marginBottom: 10 }}
          />

          <label>Email:</label>
          <Input
            value={editForm.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            style={{ marginBottom: 10 }}
          />

          <label>Должность:</label>
          <Input
            value={editForm.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            style={{ marginBottom: 10 }}
          />
        </Modal>
      </div>
    </Layout>
  );
};
