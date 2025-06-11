import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Spin, notification, Modal, Form, Select, Button, DatePicker, Input } from "antd";
import { Layout } from "../../../layout/layout";
import { getBoardDetail } from "../../../redux/slice/board-slice";
import { getStudents } from "../../../redux/slice/student-slice";
import { getTeachers } from "../../../redux/slice/student-slice";
import { getGroups } from "../../../redux/slice/groups-slice";
import axiosInstance from "../../../api/api";
import moment from "moment"; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export const BoardPage = () => {
  const { id } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [board, setBoard] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);  
  const [teacherId, setTeacherId] = useState(null); 
  const [groups, setGroups] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isAddStudentModalVisible, setIsAddStudentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);
  const [currentTopicDate, setCurrentTopicDate] = useState(null);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const [topicsByDate, setTopicsByDate] = useState({});
  const navigate = useNavigate();
  const [exportMonth, setExportMonth] = useState(moment()); 
  const [editingDate, setEditingDate] = useState(null);
  const [allDates, setAllDates] = useState([]);
  const [windowStart, setWindowStart] = useState(20);
  const [isExportModalVisible, setIsExportModalVisible] = React.useState(false);
  const [exportMonthModal, setExportMonthModal] = React.useState(moment());


  const getStatusColor = (status) => {
    switch (status) {
      case 'Н':
        return 'red';
      case 'НК':
        return 'orange';
      case 'Б':
        return 'blue';
      case 'П':
        return 'green';
      case 'ОЗ':
        return 'brown';
      default:
        return 'inherit';
    }
  };

  const exportToExcel = () => {
    if (!board) return;
  
    const monthStr = exportMonth.format("YYYY-MM");
  
    const daysInMonth = exportMonth.daysInMonth();
    const datesFullMonth = [];
    for (let d = 1; d <= daysInMonth; d++) {
      datesFullMonth.push(exportMonth.clone().date(d).format("YYYY-MM-DD"));
    }
  
    const filteredStudentsForExport = students.filter(s => s.group === board.group);
  
    const data = [];
  
    const header = ["Студент"];
    datesFullMonth.forEach(date => header.push(moment(date).format("DD.MM")));
    data.push(header);
  
    filteredStudentsForExport.forEach(student => {
      const row = [`${student.first_name} ${student.last_name}`];
  
      datesFullMonth.forEach(date => {
        const attendance = attendances.find(a => a.student === student.id);
        const record = attendance?.records?.find(r => r.date === date);
        row.push(record?.status || "—");
      });
  
      data.push(row);
    });
  
    const ws = XLSX.utils.aoa_to_sheet([
      [`Группа: ${getGroupName(board.group)}`],
      [`Предмет: ${getSubjectName()}`],
      [],
      ...data
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Посещаемость");
  
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Посещаемость_${board.group}_${monthStr}.xlsx`);
  };
  
  const loadTeachers = async () => {
      try {
        const res = await axiosInstance.get("/api/teachers/");
        setTeachers(res.data); 
      } catch (err) {
        console.error("Ошибка загрузки учителей", err);
      }
  };

  useEffect(() => {
    const today = moment();
    const dates = [];
    let daysChecked = 0;

    while (dates.length < 30) {
      const date = today.clone().subtract(daysChecked, "days");
      if (date.day() !== 0) { 
        dates.unshift(date.format("YYYY-MM-DD")); 
      }
      daysChecked++;
    }

    setAllDates(dates);
  }, []);

  const recentDate = allDates.slice(windowStart, windowStart + 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [boardRes, studentsRes, teachersRes, groupsRes, attendancesRes] = await Promise.all([
          getBoardDetail(id),
          getStudents(),
          getTeachers(),
          getGroups(),
          axiosInstance.get(`/api/attendances/?board=${id}`)
        ]);

        if (boardRes.success) setBoard(boardRes.data);
        if (studentsRes.success) setStudents(studentsRes.data);
        if (teachersRes.success) setTeachers(teachersRes.data);
        if (groupsRes.success) setGroups(groupsRes.data);
        if (attendancesRes.status === 200) setAttendances(attendancesRes.data);
        else throw new Error("Ошибка загрузки посещаемости");

      } catch (err) {
        notification.error({ message: "Ошибка", description: "Ошибка при загрузке данных" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get("/api/subjects/");
        if (response.status === 200) {
          setSubjects(response.data);
        } else {
          notification.error({
            message: "Ошибка",
            description: "Не удалось загрузить предметы",
          });
        }
      } catch (error) {
        notification.error({
          message: "Ошибка",
          description: "Ошибка при получении предметов",
        });
      }
    };
  
    fetchSubjects();
  }, []);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId");
    if (storedTeacherId) {
        const id = parseInt(storedTeacherId);
        setTeacherId(id);
        setIsAdmin(id === 2); 
    }
    loadTeachers();
  }, []);

  const filteredStudents = students.filter(student => student.group === board?.group);
  
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Неизвестно";
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : "Неизвестно";
  };

  const getSubjectName = () => {
    const subject = subjects.find(
      (subj) => subj.teacher === board?.teacher || subj.teacher?.id === board?.teacher
    );
    return subject ? subject.name : "Не назначен";
  };

  const showModal = (record) => {
    const date = moment(record.date);
    const today = moment().startOf("day");

    if (!isAdmin && !date.isSame(today, "day")) {
      notification.warning({
        message: "Изменение запрещено",
        description: "Изменять отметки можно только за сегодняшний день.",
      });
      return; 
    }

    setEditingRecord({
      ...record,
      attendanceId: record.attendanceId,
    });
    setNewStatus(record.status === "—" ? "" : record.status);
    setIsModalVisible(true);
    setEditingDate(date); 
  };

  const handleOk = async () => {
    const { attendanceId, student } = editingRecord;
    const formattedDate = moment(editingDate).format("YYYY-MM-DD"); 

    try {
      let attendance = attendanceId;

      if (!attendance) {
        const newAtt = await axiosInstance.post(`/api/attendances/`, {
          student: student,
          board: parseInt(id),
        });
        attendance = newAtt.data.id;
      }

      const existingRecords = await axiosInstance.get(
        `/api/attendance-record/?attendance=${attendance}&date=${formattedDate}`
      );

      if (existingRecords.data.length > 0) {
        const recordId = existingRecords.data[0].id;
        await axiosInstance.put(`/api/attendance-record/${recordId}/`, {
          attendance,
          date: formattedDate,
          status: newStatus,
        });
      } else {
        await axiosInstance.post(`/api/attendance-record/`, {
          attendance,
          date: formattedDate,
          status: newStatus,
        });
      }

      const updated = await axiosInstance.get(`/api/attendances/?board=${id}`);
      setAttendances(updated.data);
      setIsModalVisible(false);
      notification.success({ message: "Успех", description: "Статус обновлен" });
    } catch (err) {
      notification.error({
        message: "Ошибка",
        description: err.response?.data ? JSON.stringify(err.response.data) : "Не удалось сохранить статус",
      });
    }
  };

  const showAddStudentModal = () => {
    form.resetFields();
    setIsAddStudentModalVisible(true);
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await axiosInstance.delete(`/api/students/${studentId}/`);
      const studentsRes = await getStudents();
      if (studentsRes.success) setStudents(studentsRes.data);
      notification.success({ message: "Студент удалён" });
    } catch (err) {
      notification.error({
        message: "Ошибка",
        description: "Не удалось удалить студента",
      });
    }
  };

  const openTopicModal = async (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setCurrentTopicDate(formattedDate);
    setIsTopicLoading(true);
  
    try {
      const res = await axiosInstance.get(`/api/lesson-topics/?board=${id}`);
      if (res.status === 200) {
        const topicObj = res.data.find(item => moment(item.date).format("YYYY-MM-DD") === formattedDate);
        if (topicObj) {
          setTopicsByDate(prev => ({ ...prev, [date]: topicObj.topic }));
        } else {
          setTopicsByDate(prev => ({ ...prev, [formattedDate]: "" }));
        }
      } else {
        setTopicsByDate(prev => ({ ...prev, [formattedDate]: "" }));
      }
    } catch (err) {
      notification.error({ message: "Ошибка", description: "Не удалось загрузить тему" });
      setTopicsByDate(prev => ({ ...prev, [formattedDate]: "" }));
    } finally {
      setIsTopicLoading(false);
      setIsTopicModalVisible(true);
    }
  };
  
  const handleAddStudent = async () => {
    try {
      const values = await form.validateFields();
      await axiosInstance.post('/api/students/', {
        group: board.group,       
        first_name: values.first_name,
        last_name: values.last_name,
        middle_name: values.middle_name || '',  
      });
      const studentsRes = await getStudents();
      if (studentsRes.success) setStudents(studentsRes.data);
      notification.success({ message: "Студент добавлен" });
      setIsAddStudentModalVisible(false);
    } catch (err) {
      notification.error({
        message: "Ошибка",
        description: "Не удалось добавить студента",
      });
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains("board-body")) {
      navigate("/groups"); 
    }
  };

  const openExportModal = () => setIsExportModalVisible(true);
  const closeExportModal = () => setIsExportModalVisible(false);  

  const handleExport = () => {
    exportToExcel(exportMonthModal);
    closeExportModal();
  };

  const handleCancel = () => setIsModalVisible(false);
  
  const saveTopic = async () => {

    try {
      const topicToSave = topicsByDate[currentTopicDate] ?? "";

      const existingTopicsRes = await axiosInstance.get(`/api/lesson-topics/?board=${id}`);

      const existingTopic = existingTopicsRes.data.find(item =>
        moment(item.date).format("YYYY-MM-DD") === currentTopicDate
      );

      if (existingTopic) {
        await axiosInstance.patch(`/api/lesson-topics/${existingTopic.id}/`, {
          topic: topicToSave,
        });
      } else {
        await axiosInstance.post(`/api/lesson-topics/`, {
          board: Number(id),
          date: currentTopicDate,
          topic: topicToSave,
        });
      }
      console.log("Тема для сохранения:", topicToSave);
      console.log("Дата для сохранения:", currentTopicDate);

      notification.success({ message: "Тема сохранена" });
      setIsTopicModalVisible(false);
    } catch (err) {
      console.error('Ошибка при сохранении темы:', err.response?.data);
      notification.error({ message: "Ошибка", description: "Не удалось сохранить тему" });
    }
  };

  const handlePrev = () => {
    if (windowStart > 0) {
      setWindowStart(windowStart - 10);
    }
  };

  const handleNext = () => {
    if (windowStart + 10 < allDates.length) {
      setWindowStart(windowStart + 10);
    }
  };

  

  return (
    <Layout>
        <div className="board-body" onClick={handleClickOutside}>
            <Card className="card1" title={`Посещаемость группы: ${getGroupName(board?.group)}`} style={{ margin: 20 }}>
                {loading ? (
                  <Spin />
                ) : (
                <>
                    {board && (
                    <Card title="Информация" style={{ marginBottom: 20 }}>
                        <p>Группа: {getGroupName(board.group)}</p>
                        <p>Учитель: {getTeacherName(board.teacher)}</p>
                        <p>Предмет: {getSubjectName()}</p>
                    </Card>
                    )}
                    {isAdmin && (
                      <Button className="stu-add" type="primary" onClick={showAddStudentModal} style={{ marginBottom: 16 }}>
                        Добавить студента
                      </Button>
                    )}
                    <div style={{ marginBottom: 16 }}>
                      {windowStart > 0 && <Button className="turn-btn" onClick={handlePrev}>Назад</Button>}

                      {windowStart + 10 < allDates.length && <Button className="turn-btn" onClick={handleNext} style={{ marginLeft: 8 }}>Вперёд</Button>}
                  </div>
                  <div className="attendance-table-wrapper">
                    <table className={`ant-table table-attendance ${isAdmin ? '' : 'no-action-column'}`}>
                      <thead>
                        <tr>
                          <th>Студент</th>
                          {recentDate.map(date => (
                            <th key={date}>
                              <div>{moment(date).format("ddd")}</div> 
                              <div className="vertical-header">{moment(date).format("DD.MM")}</div>
                              <Button size="small" onClick={() => openTopicModal(date)}>
                                Тема
                              </Button>
                            </th>
                          ))}
                          {isAdmin && <th>Действие</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(student => (
                          <tr key={student.id}>
                            <td>
                              {student.first_name} {student.last_name}
                              {student.middle_name ? ` ${student.middle_name}` : ""}
                            </td>

                            {recentDate.map(date => {
                              const attendance = attendances.find(a => a.student === student.id);
                              const record = attendance?.records?.find(r => moment(r.date).isSame(date, "day"));
                              const status = record?.status || "—";
                              const isToday = moment(date).isSame(moment(), "day");

                              return (
                                <td key={date}>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      if (isAdmin || isToday) {
                                        showModal({
                                          attendanceId: attendance?.id,
                                          student: student.id,
                                          recordId: record?.id,
                                          date,
                                          status
                                        });
                                      }
                                    }}
                                    disabled={!isAdmin && !isToday}
                                    style={{ color: getStatusColor(status) }}
                                  >
                                    {status}
                                  </Button>
                                </td>
                              );
                            })}

                            {isAdmin && (
                              <td>
                                <Button danger onClick={() => handleDeleteStudent(student.id)}>
                                  Удалить
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
                )}
                {isAdmin && (
                  <>
                    <Button className="excel" type="primary" onClick={openExportModal} style={{ marginTop: 16 }}>
                      Excel
                    </Button>

                    <Modal
                      title="Выберите месяц для экспорта"
                      visible={isExportModalVisible}
                      onCancel={closeExportModal}
                      onOk={handleExport}
                      okText="Скачать"
                      cancelText="Отмена"
                    >
                    <DatePicker
                      picker="month"
                      value={exportMonthModal}
                      onChange={(date) => setExportMonthModal(date ?? moment())}
                      format="MMMM YYYY"
                      style={{ width: "100%" }}
                    />
                    </Modal>
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
                    <Select.Option value="НК">Пропуск по уважительной причине</Select.Option>
                    <Select.Option value="Б">Болел</Select.Option>
                    <Select.Option value="ОЗ">Отпуск родителей</Select.Option>
                    <Select.Option value="Н">Неявка</Select.Option>
                </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Добавить студента"
        visible={isAddStudentModalVisible}
        onOk={handleAddStudent}
        onCancel={() => setIsAddStudentModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Имя"
            name="first_name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Фамилия"
            name="last_name"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Отчество"
            name="middle_name"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`Тема урока за ${moment(currentTopicDate).format("DD.MM.YYYY")}`}
        visible={isTopicModalVisible}
        onOk={saveTopic}
        onCancel={() => setIsTopicModalVisible(false)}
        okButtonProps={{ disabled: currentTopicDate !== moment().format("YYYY-MM-DD") }}
        cancelText="Закрыть"
        okText="Сохранить"
        confirmLoading={isTopicLoading}
      >
        {isTopicLoading ? (
          <Spin />
        ) : (
          currentTopicDate === moment().format("YYYY-MM-DD") ? (
            <Input.TextArea
              value={topicsByDate[currentTopicDate] || ""}
              onChange={(e) => setTopicsByDate(prev => ({ ...prev, [currentTopicDate]: e.target.value }))}
              rows={4}
              placeholder="Введите тему урока"
            />
          ) : (
            <p>{topicsByDate[currentTopicDate] || "Тема не назначена"}</p>
          )
        )}
      </Modal>
    </Layout>
  );
};

