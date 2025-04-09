// src/pages/AdminPanel.js
import React, { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const roles = ["Customer", "Owner", "Admin"];

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    await fetch(`http://localhost:5000/users/${selectedUserId}`, {
      method: "DELETE",
    });
    setShowConfirm(false);
    setSelectedUserId(null);
    fetchUsers();
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Админ-панель</h2>
      {users.length === 0 ? (
        <p>Нет пользователей</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#f5f5f5" }}>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Имя</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Роль</th>
              <th style={thStyle}>Изменить</th>
              <th style={thStyle}>Удалить</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{u.id}</td>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.role}</td>
                <td style={tdStyle}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={{ padding: "0.3rem", borderRadius: "4px" }}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => confirmDelete(u.id)}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "#fff",
                      padding: "0.4rem 0.8rem",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Удалить пользователя?"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

const thStyle = {
  padding: "0.8rem",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "0.6rem",
};

export default AdminPanel;
