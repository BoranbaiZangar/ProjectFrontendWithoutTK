// src/pages/AdminPanel.js
import React, { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";

// Компонент AdminPanel: қолданушыларды басқаруға арналған
const AdminPanel = () => {
  // Қолданушылар тізімін сақтауға арналған күй
  const [users, setUsers] = useState([]);
  // Растау модалын көрсету/жасыру күйі
  const [showConfirm, setShowConfirm] = useState(false);
  // Жойылатын қолданушының ID-ін сақтауға арналған күй
  const [selectedUserId, setSelectedUserId] = useState(null);
  // Қолданушы рөлдерінің тізімі
  const roles = ["Customer", "Owner", "Admin"];

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

  // Жоюды растау модалын көрсету функциясы
  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowConfirm(true);
  };

  // Қолданушыны және оның байланысты деректерін жою функциясы
  const handleDeleteConfirmed = async () => {
    try {
      // Жойылатын қолданушыны аламыз
      const userToDelete = users.find((u) => u.id === selectedUserId);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      // Рөлге байланысты байланысты деректерді жоямыз
      if (userToDelete.role === "Owner") {
        // Owner рөліндегі қолданушының ресторандарын жоямыз
        const resRestaurants = await fetch(
          `http://localhost:5000/restaurants?ownerId=${selectedUserId}`
        );
        const restaurants = await resRestaurants.json();

        // Әр ресторанды жоямыз
        for (const restaurant of restaurants) {
          await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
            method: "DELETE",
          });
        }
      } else if (userToDelete.role === "Customer") {
        // Customer рөліндегі қолданушының тапсырыстарын жоямыз
        const resOrders = await fetch(
          `http://localhost:5000/orders?userId=${selectedUserId}`
        );
        const orders = await resOrders.json();

        // Әр тапсырысты жоямыз
        for (const order of orders) {
          await fetch(`http://localhost:5000/orders/${order.id}`, {
            method: "DELETE",
          });
        }
      }

      // Соңында қолданушыны жоямыз
      await fetch(`http://localhost:5000/users/${selectedUserId}`, {
        method: "DELETE",
      });

      // Модальді жабамыз және күйді жаңартамыз
      setShowConfirm(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Қолданушыны жою кезінде қате пайда болды:", err.message);
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
              <th>Change Role</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
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
                    onClick={() => confirmDelete(u.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this user?"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;