import React, { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

// Компонент AdminPanel: қолданушыларды басқаруға арналған
const AdminPanel = () => {
  // Қолданушылар тізімін сақтауға арналған күй
  const [users, setUsers] = useState([]);
  // Растау модалын көрсету/жасыру күйі
  const [showConfirm, setShowConfirm] = useState(false);
  // Бан/разбан істейтін қолданушының ID-ін сақтауға арналған күй
  const [selectedUserId, setSelectedUserId] = useState(null);
  // Бан немесе разбан әрекетін анықтауға арналған күй (true - бан, false - разбан)
  const [isBanning, setIsBanning] = useState(true);
  // Қолданушы рөлдерінің тізімі
  const roles = ["user", "owner", "admin", "courier", "moderator"];

  // Серверден қолданушыларды алу функциясы
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/users");
    const data = await res.json();
    setUsers(data);
  };

  // Компонент жүктелгенде қолданушыларды аламыз
  useEffect(() => {
    fetchUsers();
  }, []);

  // Қолданушы рөлін өзгерту функциясы
  const handleRoleChange = async (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    const updatedUser = { ...user, role: newRole };

    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    fetchUsers();
  };

  // Бан/разбан растау модалын көрсету функциясы
  const confirmBanUnban = (userId, actionIsBan) => {
    setSelectedUserId(userId);
    setIsBanning(actionIsBan);
    setShowConfirm(true);
  };

  // Қолданушыны бан/разбан ету функциясы
  const handleBanUnbanConfirmed = async () => {
    try {
      // Бан/разбан істейтін қолданушыны аламыз
      const userToUpdate = users.find((u) => u.id === selectedUserId);
      if (!userToUpdate) {
        throw new Error("User not found");
      }

      // Жаңа статус: "banned" немесе "active"
      const newStatus = isBanning ? "banned" : "active";
      const updatedUser = { ...userToUpdate, status: newStatus };

      // Қолданушы статусын жаңарту
      await fetch(`http://localhost:5000/users/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      // Модальді жабамыз және күйді жаңартамыз
      setShowConfirm(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Қолданушыны бан/разбан кезінде қате пайда болды:", err.message);
      setShowConfirm(false);
      setSelectedUserId(null);
    }
  };

  return (
    <div className="admin-panel container">
      <h2>Admin Panel</h2>
      {users.length === 0 ? (
        <p className="no-users">No users found</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Change Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="role-select"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => confirmBanUnban(u.id, u.status === "active")}
                    className={u.status === "active" ? "ban-button" : "unban-button"}
                  >
                    {u.status === "active" ? "Ban" : "Unban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirm && (
        <ConfirmModal
          message={
            isBanning
              ? "Are you sure you want to ban this user?"
              : "Are you sure you want to unban this user?"
          }
          onConfirm={handleBanUnbanConfirmed}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;