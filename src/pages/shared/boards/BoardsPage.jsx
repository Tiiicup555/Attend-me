import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Spin, notification, Modal, Form, Select, Button, QRCode } from "antd";
import { Layout } from "../../../layout/layout";
import { getBoardDetail } from "../../../redux/slice/board-slice";
import { getAttendances, updateAttendanceStatus } from "../../../redux/slice/attend-slice";
import { getStudents } from "../../../redux/slice/student-slice";
import { getTeachers } from "../../../redux/slice/student-slice";
import { getGroups } from "../../../redux/slice/groups-slice";

export const BoardPage = () => {
  const { id } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [board, setBoard] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);  
  const [groups, setGroups] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Track current page

  useEffect(() => {
    const fetchBoardAndAttendances = async () => {
      setLoading(true);
      try {
        const boardResponse = await getBoardDetail(id);
        if (boardResponse.success) {
          setBoard(boardResponse.data);
        } else {
          notification.error({ message: "Ошибка", description: "Не удалось загрузить информацию о борде" });
        }

        const attendanceResponse = await getAttendances();
        if (attendanceResponse.success) {
          const filteredAttendances = attendanceResponse.data.filter((item) => item.board === parseInt(id));
          setAttendances(filteredAttendances);
        } else {
          notification.error({ message: "Ошибка", description: "Не удалось загрузить данные о посещаемости" });
        }

        const studentsResponse = await getStudents();
        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
        } else {
          notification.error({ message: "Ошибка", description: "Не удалось загрузить данные о студентах" });
        }

        const teachersResponse = await getTeachers();
        if (teachersResponse.success) {
          setTeachers(teachersResponse.data);
        } else {
          notification.error({ message: "Ошибка", description: "Не удалось загрузить данные об учителях" });
        }

        const groupsResponse = await getGroups();
        if (groupsResponse.success) {
          setGroups(groupsResponse.data);
        } else {
          notification.error({ message: "Ошибка", description: "Не удалось загрузить данные о группах" });
        }
      } catch (err) {
        notification.error({ message: "Ошибка", description: "Не удалось загрузить данные" });
      } finally {
        setLoading(false);
      }
    };

    fetchBoardAndAttendances();
  }, [id]);

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Неизвестно";
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : "Неизвестно";
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Студент",
      dataIndex: "student",
      key: "student",
      render: (studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (student) {
          const fullName = `${student.first_name} ${student.last_name}`;
          return student.middle_name ? `${fullName} ${student.middle_name}` : fullName;
        }
        return "Неизвестно";
      },
    },
    { title: "Дата", dataIndex: "date", key: "date" },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Button onClick={() => showModal(record.id, status)}>{status}</Button>
      ),
    },
    {
        title: "QR-код",
        key: "qrCode",
        render: (text, record) => (
          <QRCode value={`http://your-url.com/attendance/${record.id}`} size={50} />
        ),
    },
  ];

  const showModal = (attendanceId, currentStatus) => {
    setCurrentAttendanceId(attendanceId);
    setNewStatus(currentStatus);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const result = await updateAttendanceStatus(currentAttendanceId, newStatus);
    if (result.success) {
      notification.success({
        message: "Статус обновлен",
        description: "Статус посещаемости был успешно обновлен.",
      });
      setAttendances((prevAttendances) =>
        prevAttendances.map((attendance) =>
          attendance.id === currentAttendanceId ? { ...attendance, status: newStatus } : attendance
        )
      );
      setIsModalVisible(false);
    } else {
      notification.error({
        message: "Ошибка",
        description: "Не удалось обновить статус посещаемости.",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
        <div className="board-body">
            <Card className="card1" title={`Посещаемость борда №${id}`} style={{ margin: 20 }}>
                {loading ? (
                <Spin />
                ) : (
                <>
                    {board && (
                    <Card title="Информация о борде" style={{ marginBottom: 20 }}>
                        <p>Группа: {getGroupName(board.group)}</p>
                        <p>Учитель: {getTeacherName(board.teacher)}</p>
                        <p>Дата создания: {new Date(board.created_at).toLocaleString()}</p>
                    </Card>
                    )}
                    <Table
                        dataSource={attendances.slice((currentPage - 1) * 5, currentPage * 5)} // Display 5 items per page
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                        current: currentPage,
                        pageSize: 5,
                        total: attendances.length,
                        onChange: handlePageChange,
                        }}
                    />
                </>
                )}
            </Card>
        </div>
      <Modal
        title="Изменить статус посещаемости"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form>
          <Form.Item label="Статус">
                <Select
                    className="modal-btn1"
                    value={newStatus}
                    onChange={setNewStatus}
                    >
                    <Select.Option value="П">Присутствовал</Select.Option>
                    <Select.Option value="Н">Пропуск по уважительной причине</Select.Option>
                    <Select.Option value="Б">Болел</Select.Option>
                    <Select.Option value="ОЗ">Отпуск родителей</Select.Option>
                    <Select.Option value="В">Выходной</Select.Option>
                </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
