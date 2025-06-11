import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Progress, Modal, Input, Table } from "antd";
import axiosInstance from "../../../api/api";
import { Layout } from "../../../layout/layout";

export const StatsPage = () => {
  const { id } = useParams();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const handleMonthChange = (e) => {
    const selected = new Date(e.target.value);
    setSelectedMonth(selected);
  };

  const getAllDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    for (let i = 1; i <= totalDays; i++) {
      const current = new Date(year, month, i);
      current.setHours(0, 0, 0, 0);

      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0) continue; // исключаем только воскресенья
      if (current.getTime() > today.getTime()) continue; // исключаем будущее

      days.push(
        current.getFullYear() +
        "-" +
        String(current.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(current.getDate()).padStart(2, "0")
      );
    }

    return days;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardsRes = await axiosInstance.get("/api/boards/");
        const boards = boardsRes.data;
        const filteredBoards = boards;
        const studentsRes = await axiosInstance.get("/api/students/");
        const students = studentsRes.data;
        const attendanceRes = await axiosInstance.get("/api/attendances/");
        const attendanceData = attendanceRes.data;
        const boardIds = filteredBoards.map((b) => b.id);
        const filteredAttendance = attendanceData.filter((a) =>
          boardIds.includes(a.board)
        );
        const attendanceStudentIds = new Set(
          filteredAttendance.map((a) => a.student)
        );
        const relevantStudents = students.filter((s) =>
          attendanceStudentIds.has(s.id)
        );
        const daysInMonth = getAllDaysInMonth(selectedMonth);

        const getFullName = (student) => {
          return [student.last_name, student.first_name, student.middle_name]
            .filter(Boolean)
            .join(" ");
        };

        const calculatedStats = relevantStudents.map((student) => {
          const attendance = filteredAttendance.find(
            (a) => a.student === student.id
          );
          const studentName = getFullName(student) || `ID ${student.id}`;

          const recordsMap = {};
          if (attendance && attendance.records) {
            attendance.records.forEach((record) => {
              const dateStr = new Date(record.date).toISOString().split("T")[0];
              recordsMap[dateStr] = record.status;
            });
          }

          let presentCount = 0;
          daysInMonth.forEach((date) => {
            if (recordsMap[date] === "П") presentCount++;
          });

          const total = daysInMonth.length;
          const percent = total > 0 ? Math.round((presentCount / total) * 100) : 0;

          return {
            studentName,
            percent,
            total,
            presentCount,
            studentId: student.id,
            recordsMap,
          };
        });

        setStats(calculatedStats);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке статистики:", err);
        setError(err.message || "Ошибка загрузки");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, selectedMonth]);

  if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

  const filteredStats = stats.filter(({ studentName }) =>
    studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onStudentClick = (student) => {
    setSelectedStudent(student);
    setStatusFilter("");
    setDateFilter("");
    setModalVisible(true);
  };

  const daysInMonth = getAllDaysInMonth(selectedMonth);

  let modalData = [];

  if (selectedStudent) {
    modalData = daysInMonth
      .map((date) => ({
        key: date,
        date,
        status: selectedStudent.recordsMap[date] || "-",
    }));


    if (statusFilter) {
      modalData = modalData.filter((item) =>
        item.status.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      modalData = modalData.filter((item) =>
        item.date.includes(dateFilter)
      );
    }
  }

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("ru-RU"),
      width: "50%",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: "50%",
    },
  ];

  return (
    <Layout>
      <div className="stats-page">
        <input
          type="month"
          value={selectedMonth.toISOString().slice(0, 7)}
          onChange={handleMonthChange}
          className="month-input"
        />
        <input
          type="text"
          placeholder="Поиск по имени"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="students-container">
          <div className="students-list scrollable-list">
            {filteredStats.length === 0 && <p>Данных для отображения нет</p>}
            {filteredStats.map(({ studentName, percent, total, presentCount, studentId, recordsMap }) => (
              <Card
                key={studentId}
                className="student-card"
                hoverable
                onClick={() =>
                  onStudentClick({ studentName, studentId, recordsMap })
                }
              >
                <h3>{studentName}</h3>
                <p>
                  {presentCount} из {total} посещений
                </p>
                <Progress
                  percent={percent}
                  status={percent < 50 ? "exception" : "normal"}
                />
              </Card>
            ))}
          </div>
        </div>

        <Modal
          title={selectedStudent ? selectedStudent.studentName : "Детали студента"}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Input
            placeholder="Поиск по статусу"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Поиск по дате (например, 2025-06-01)"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <Table
            columns={columns}
            dataSource={modalData}
            pagination={{ pageSize: 10 }}
            size="small"
            rowKey="key"
          />
        </Modal>
      </div>
    </Layout>
  );
};
