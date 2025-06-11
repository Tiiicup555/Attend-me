import { Button } from "antd";
import { ArrowBottom, ArrowLeft, ArrowTop } from "../../app/styles/icons/icons";
import { Link, useNavigate } from "react-router-dom";
import { getGroups } from "../../redux/slice/groups-slice";
import { useEffect, useState } from "react";
import { getBoardDetail } from "../../redux/slice/board-slice";
import axiosInstance from "../../api/api";

export const Sidebar = ({ children, currentBoardId }) => {
  const [username, setUsername] = useState(localStorage.getItem("user") || "...");
  const [groups, setGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("teacherId");
    window.location.href = "/";
  };

  useEffect(() => {
    const loadGroups = async () => {
      const response = await getGroups();
      if (response.success) {
        const teacherId = parseInt(localStorage.getItem("teacherId"));
        const adminStatus = teacherId === 2;
        setIsAdmin(adminStatus);

        const filtered = adminStatus
          ? response.data
          : response.data.filter((group) => group.teacher === teacherId);

        setGroups(filtered);
      }
    };

    loadGroups();
  }, []);

  const handleGroupClick = async (groupId) => {
    const teacherId = parseInt(localStorage.getItem("teacherId"));
    const isAdmin = teacherId === 2;

    try {
      const res = await axiosInstance.get("/api/boards/");
      const boards = res.data;

      const boardDetails = await Promise.all(
        boards.map(async (board) => {
          const response = await getBoardDetail(board.id);
          return response.success ? response.data : null;
        })
      );

      const filteredBoards = boardDetails.filter((board) => board !== null);
      const boardForGroup = filteredBoards.find((board) => board.group === groupId);

      if (boardForGroup) {
        if (boardForGroup.teacher === teacherId || isAdmin) {
          navigate(`/board/${boardForGroup.id}`);
        } else {
          alert("У вас нет доступа к этой группе.");
        }
      } else {
        alert("Для этой группы нет борда.");
      }
    } catch (err) {
      console.error("Ошибка при переходе к борду:", err);
    }
  };

  return (
    <div className="side-body">
      <aside className="side-aside">
        <nav className="aside-nav">
          <h1 className="aside-title">NOMAD</h1>
          <hr />
          {isAdmin ? (
            <div className="nav-btn">
              {username}
            </div>
          ) : (
            <Link to="/profile" className="nav-btn">
              {username}
            </Link>
          )}

          {isAdmin && (
            <Link to="/groups" className="nav-btn">
              Группы
            </Link>
          )}

          {isAdmin && (
            <Link to="/teachers" className="nav-btn">
              Учителя
            </Link>
          )}

          {isAdmin && (
            <Link to={`/stats/${currentBoardId}`} className="nav-btn">
              Статистика посещаемости
            </Link>
          )}

          {!isAdmin && (
            <div
              className={`groups-wrapper ${showGroups ? "open" : ""} ${isHovered ? "hovered" : ""}`}
              onClick={() => setShowGroups(!showGroups)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ cursor: "pointer" }}
            >
              <div className="nav-btn1" onClick={() => setShowGroups(!showGroups)}>
                Группы {showGroups ? <ArrowTop /> : <ArrowBottom />}
              </div>

              {showGroups && (
                <div className="group-list">
                  {groups.map((group) => (  
                    <div
                      key={group.id}
                      className="group-link"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleGroupClick(group.id);
                      }}
                    >
                      • {group.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

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
