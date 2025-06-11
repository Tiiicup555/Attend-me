import React, { useState, useEffect } from "react";
import { Layout } from "../../../layout/layout";
import { Modal, Card, Form, Input, Button, notification, Select } from "antd";
import { createGroup, deleteGroup, editGroup, getGroupDetail, getGroups } from "../../../redux/slice/groups-slice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/api";
import { createBoard, getBoardDetail } from "../../../redux/slice/board-slice";
import { ArrowRight, Delete, Edit } from "../../../app/styles/icons/icons";

  const { confirm } = Modal;

export const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const loadBoards = async () => {
    try {
      const res = await axiosInstance.get("/api/boards/");
      const boards = res.data;

      const boardDetails = await Promise.all(
        boards.map(async (board) => {
          const response = await getBoardDetail(board.id);
          return response.success ? response.data : null;
        })
      );

      setBoards(boardDetails.filter((board) => board !== null));
    } catch (err) {
      console.error("Ошибка загрузки бордов", err);
    }
  };

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId");
    if (storedTeacherId) {
      const id = parseInt(storedTeacherId);
      setTeacherId(id);
      setIsAdmin(id === 2);
    }
    loadGroups();
    loadBoards();
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await axiosInstance.get("/api/teachers/");
      setTeachers(res.data);
    } catch (err) {
      console.error("Ошибка загрузки учителей", err);
    }
  };

  const loadGroups = async () => {
    const response = await getGroups();
    if (response.success) {
      const storedTeacherId = parseInt(localStorage.getItem("teacherId"));
      if (storedTeacherId === 2) {
        setGroups(response.data);
      } else {
        const filteredGroups = response.data.filter(group => group.teacher === storedTeacherId);
        setGroups(filteredGroups);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    const creatorId = isAdmin ? selectedTeacherId : teacherId;

    if (!creatorId) {
      notification.error({ message: "Ошибка", description: "Не выбран учитель" });
      return;
    }

    try {
      const res = await createGroup({ name: groupName, teacher: creatorId });

      if (res.success) {
        notification.success({ message: "Группа создана!" });
        const createdGroupId = res.data.id;

        const boardRes = await createBoard({
          teacher: creatorId,
          group: createdGroupId,
        });

        if (boardRes.success) {
          notification.success({ message: "Борд создан!" });
          await loadBoards();
        } else {
          notification.error({
            message: "Ошибка при создании борда",
            description: JSON.stringify(boardRes.error),
          });
        }

        setGroupName("");
        setSelectedTeacherId(null);
        setIsModalOpen(false);
        loadGroups();
      } else {
        notification.error({
          message: "Ошибка при создании группы",
          description: res.error?.message,
        });
      }
    } catch (error) {
      console.error("Ошибка при создании борда:", error.response?.data || error.message);
      notification.error({
        message: "Ошибка при создании борда",
        description: JSON.stringify(error.response?.data) || error.message,
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

  const showDeleteConfirm = (e, groupId) => {
    e.stopPropagation();
    confirm({
      title: "Вы уверены, что хотите удалить эту группу?",
      okText: "Да",
      okType: "danger",
      cancelText: "Отмена",
      onOk() {
        handleDeleteGroup(groupId);
      },
    });
  };

  const handleGroupClick = async (groupId) => {
    const teacherId = localStorage.getItem("teacherId");
    const response = await getGroupDetail(groupId);

    if (response.success) {
      if (response.data.teacher === parseInt(teacherId) || isAdmin) {
        const boardForGroup = boards.find((board) => board.group === groupId);
        if (boardForGroup) {
          navigate(`/board/${boardForGroup.id}`);
        } else {
          notification.info({
            message: "Борд не найден",
            description: "Для этой группы пока нет борда.",
          });
        }
      } else {
        notification.error({
          message: "Ошибка",
          description: "У вас нет доступа к этой группе!",
        });
      }
    } else {
      notification.error({
        message: "Ошибка при получении информации о группе",
        description: response.error,
      });
    }
  };

  const openEditModal = (group, e) => {
    setEditingGroupId(group.id);
    setEditedName(group.name);
    setIsEditModalOpen(true);
  };
      
    return (
    <Layout>
        <div className="left">
            <div className="upper">
                <input
                    placeholder="Поиск группы..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {isAdmin && (
                    <Button className="group-createBtn" onClick={() => setIsModalOpen(true)} type="primary">
                        Добавить группу
                    </Button>
                )}
            </div>
            <div className="home-cards">
                {groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase())).map((group) => (
                <Card
                    className="card"
                    key={group.id}
                    title={
                    <div className="card-title-bar">
                        <span className="g-name">{group.name}</span>
                        {isAdmin && (
                        <div className="icon-group">
                            <Button icon={< Edit/>} className="edit-del" onClick={(e) => openEditModal(group, e)} >
                            </Button>
                            <Button icon={<Delete/>} className="edit-del1" onClick={(e) => showDeleteConfirm(e, group.id)} >             
                            </Button>
                        </div>
                        )}
                    </div>
                    }
                    style={{ width: 300, marginRight: 16 }}
                >
                    <Button
                        type="link"
                        onClick={() => handleGroupClick(group.id)}
                        icon={<ArrowRight />}
                        style={{ padding: 0 }}
                        className="next-btn"
                    >
                        Перейти
                    </Button>
                </Card>
                ))}
            </div>
        </div>

        <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} title={null} centered>
            <Card title="Новая группа" style={{ borderRadius: 10 }} className="group-modalCard">
                <Form layout="vertical">
                <Form.Item label="Название группы">
                    <Input
                    className="modal-input"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Введите название..."
                    />
                </Form.Item>
                {isAdmin && (
                    <Form.Item label="Учитель группы">
                    <Select
                        placeholder="Выберите учителя"
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => setSelectedTeacherId(value)}
                        value={selectedTeacherId}
                        style={{ width: "100%" }}
                    >
                        {teachers.map((teacher) => (
                        <Select.Option key={teacher.id} value={teacher.id}>
                            {teacher.username}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                )}
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
