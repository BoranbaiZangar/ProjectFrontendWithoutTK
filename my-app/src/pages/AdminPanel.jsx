import React, { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import "../css/AdminPanel.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isBanning, setIsBanning] = useState(true);
  const roles = ["user", "owner", "admin", "courier", "moderator"];

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const user = users.find((u) => u.id === userId);
      const updatedUser = { ...user, role: newRole };

      const res = await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Failed to update role");
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err.message);
    }
  };

  const confirmBanUnban = (userId, actionIsBan) => {
    setSelectedUserId(userId);
    setIsBanning(actionIsBan);
    setShowConfirm(true);
  };

  const handleBanUnbanConfirmed = async () => {
    try {
      const userToUpdate = users.find((u) => u.id === selectedUserId);
      if (!userToUpdate) throw new Error("User not found");

      const newStatus = isBanning ? "banned" : "active";
      const updatedUser = { ...userToUpdate, status: newStatus };

      const res = await fetch(`http://localhost:5000/users/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setShowConfirm(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Error during ban/unban:", err.message);
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
                <td>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${u.status.toLowerCase()}`}>
                    {u.status}
                  </span>
                </td>
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