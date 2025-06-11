import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/api";
import { Layout } from "../../../layout/layout";
import { Card, Avatar, Typography, Button, Modal, Input, DatePicker, message, Upload } from "antd";
import moment from "moment";

const { Title, Text } = Typography;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const teacherId = localStorage.getItem("teacherId");

    if (!token || !teacherId) {
      navigate("/", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/api/profiles/`);
        const profiles = res.data;

        const foundProfile = profiles.find(
          (p) => String(p.teacher) === String(teacherId)
        );

        if (foundProfile) {
          setProfile(foundProfile);
        } else {
          console.error("Профиль для этого учителя не найден");
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const showEditModal = (field) => {
    setEditingField(field);
    if (field === "birthday" && profile[field]) {
      setInputValue(moment(profile[field]));
    } else if (field === "avatar") {
      setFileList([]);
    } else {
      setInputValue(profile[field] || "");
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      let dataToSend;
  
      if (editingField === "avatar") {
        if (fileList.length === 0) {
          message.error("Пожалуйста, выберите файл");
          return;
        }
  
        dataToSend = new FormData();
        dataToSend.append("avatar", fileList[0]);
  
        await axiosInstance.patch(`/api/profiles/${profile.id}/`, dataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        let updatedValue = inputValue;
        if (editingField === "birthday") {
          updatedValue = inputValue ? inputValue.format("YYYY-MM-DD") : null;
        }
  
        if (updatedValue === "") {
          message.error("Значение не может быть пустым");
          return;
        }
  
        dataToSend = { [editingField]: updatedValue };
  
        await axiosInstance.patch(`/api/profiles/${profile.id}/`, dataToSend);
      }

      if (editingField === "avatar") {
        setProfile(prev => ({
          ...prev,
          avatar: fileList.length > 0 ? URL.createObjectURL(fileList[0]) : prev.avatar,
        }));
      } else {
        setProfile(prev => ({ ...prev, ...dataToSend }));
      }
  
      setIsModalVisible(false);
      setEditingField(null);
      setInputValue("");
      setFileList([]);
      message.success("Профиль успешно обновлен");
    } catch (error) {
      message.error("Ошибка при обновлении профиля");
      console.error(error.response?.data || error);
    }
  };
  


  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingField(null);
    setInputValue("");
  };

  if (!profile) {
    return <div>Загрузка профиля...</div>;
  }

  return (
    <Layout>
      <div className="profile-body">
        <Card className="profileCard" bordered={false}>
          <div style={{ textAlign: "center" }}>
            <div className="avatar-wrapper">
              <Avatar
                size={140}
                src={profile.avatar}
                className="avatar"
                alt="Avatar"
              />
              <Button
                size="small"
                type="default"
                className="edit-avatar-btn"
                onClick={() => showEditModal("avatar")}
              >
                Редактировать
              </Button>
            </div>
            <Title level={2} style={{ marginTop: 15 }}>
              {profile.user.first_name} {profile.user.last_name}
            </Title>

            <div style={{ textAlign: "left", marginTop: 20, maxWidth: 400, margin: "auto" }}>
              <Text className="infoItem">
              <span>
                <b>Телефон:</b> {profile.phone || "не указан"}
              </span>
                <Button className="p-btn" size="small" type="link" onClick={() => showEditModal("phone")}>
                  Редактировать
                </Button>
              </Text>
              <br />
              <Text className="infoItem">
                <span>
                  <b>Email:</b> {profile.email || "не указан"}{" "}
                </span>
                <Button className="p-btn" size="small" type="link" onClick={() => showEditModal("email")}>
                  Редактировать
                </Button>
              </Text>
              <br />
              <Text className="infoItem">
                <span>
                  <b>Дата рождения:</b> {profile.birthday || "не указана"}{" "}
                </span> 
              </Text>
              <br />
              <Text className="infoItem">
                <span> 
                  <b>Должность:</b> {profile.position || "не указана"}{" "}
                </span>
              </Text>
            </div>
          </div>

          <Modal
            title={`Редактировать ${editingField}`}
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Сохранить"
            cancelText="Отмена"
          >
            {editingField === "birthday" ? (
              <DatePicker
                style={{ width: "100%" }}
                value={inputValue}
                onChange={(date) => setInputValue(date)}
              />
            ) : editingField === "avatar" ? (
              <Upload
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                fileList={fileList}
                onRemove={() => setFileList([])}
                accept="image/*"
              >
                <Button>Выбрать файл</Button>
              </Upload>
            ) : (
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
          </Modal>
        </Card>
      </div>
    </Layout>
  );
};
