import React, { useState, useEffect } from "react";
import { Layout } from "../../../layout/layout";
import { Modal, Card, Form, Input, Button, notification } from "antd";
import { createGroup, deleteGroup, editGroup, getGroupDetail, getGroups } from "../../../redux/slice/groups-slice";
import { useNavigate } from "react-router-dom";

export const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [teacherId, setTeacherId] = useState(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editingGroupId, setEditingGroupId] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const storedTeacherId = localStorage.getItem("teacherId");
        if (storedTeacherId) {
            setTeacherId(parseInt(storedTeacherId)); 
        }
        loadGroups();
    }, []);
  
    const loadGroups = async () => {
      const response = await getGroups(); 
      if (response.success) {
        setGroups(response.data); 
      }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
  
        if (!teacherId) {
            notification.error({ message: "Ошибка", description: "Не найден идентификатор учителя" });
            return;
        }

        const res = await createGroup({ name: groupName, teacher: teacherId });
        if (res.success) {
            notification.success({ message: "Группа создана!" });
            setGroupName("");
            setIsModalOpen(false);
            loadGroups();
        } else {
            notification.error({
                message: "Ошибка при создании группы",
                description: res.error?.message,
            });
        }
    };

    const handleEditGroup = async () => {
        if (!editedName.trim()) return;
        const response = await editGroup(editingGroupId, editedName);
        if (response.success) {
          notification.success({ message: "Название группы обновлено!" });
          setIsEditModalOpen(false);
          loadGroups();
        } else {
          notification.error({ message: "Ошибка при обновлении", description: response.error });
        }
      };
      
    const handleDeleteGroup = async (id) => {
        const response = await deleteGroup(id);
        if (response.success) {
          notification.success({ message: "Группа удалена" });
          loadGroups();
        } else {
          notification.error({ message: "Ошибка при удалении", description: response.error });
        }
    };

    const handleGroupClick = async (groupId) => {
        const teacherId = localStorage.getItem("teacherId");

        const response = await getGroupDetail(groupId);

        if (response.success) {
            if (response.data.teacher === parseInt(teacherId)) {
                navigate(`/`); 
            } else {
                notification.error({ message: "Ошибка", description: "У вас нет доступа к этой группе!" });
            }
        } else {
            notification.error({ message: "Ошибка при получении информации о группе", description: response.error });
        }
    };

    const openEditModal = (group) => {
        setEditingGroupId(group.id);
        setEditedName(group.name);
        setIsEditModalOpen(true);
    };
      
    return (
        <Layout>
        <div className="left">
            <div className="home-cards">
                {groups.map((group) => (
                    <Card 
                        className="card"
                        key={group.id} 
                        title={group.name} 
                        style={{ width: 300, height: 200, marginRight: 16 }}
                        onClick={() => handleGroupClick(group.id)}
                        >
                        <div className="card-btn">
                        {[
                            <Button className="edit-btn" type="link" onClick={() => openEditModal(group)}>Изменить</Button>,
                            <Button className="delete-btn" type="link" danger onClick={() => handleDeleteGroup(group.id)}>Удалить</Button>,
                        ]}
                        </div>
                    </Card>
                ))}
                <Button className="group-createBtn" onClick={() => setIsModalOpen(true)} type="primary">
                    Добавить группу
                </Button>
            </div>
        </div>

        <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            title={null}
            centered
        >
            <Card
            title="Новая группа"
            style={{ borderRadius: 10 }}
            className="group-modalCard"
            >
            <Form layout="vertical">
                <Form.Item label="Название группы">
                <Input
                    className="modal-input"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Введите название..."
                />
                </Form.Item>
                <Form.Item>
                <Button className="modal-btn" type="primary" onClick={handleCreateGroup} block>
                    Создать
                </Button>
                </Form.Item>
            </Form>
            </Card>
        </Modal>

        <Modal
            open={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            footer={null}
            title="Редактировать группу"
            centered
            >
            <Card style={{ borderRadius: 10 }}>
                <Form layout="vertical">
                <Form.Item label="Новое название">
                    <Input
                    className="modal-input"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    />
                </Form.Item>
                <Form.Item>
                    <Button className="modal-btn" type="primary" block onClick={handleEditGroup}>
                    Сохранить
                    </Button>
                </Form.Item>
                </Form>
            </Card>
        </Modal>
        </Layout>
    );
};
